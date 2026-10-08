import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { hashPassword } from '@/lib/auth/password';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import RegistrationRequest, { RegistrationStatus } from '@/models/RegistrationRequest';
import User, { UserRole, UserStatus } from '@/models/User';
import ReferralHistory from '@/models/ReferralHistory';
import AuditLog from '@/models/AuditLog';
import { generateUniqueReferralCode } from '@/services/referral.service';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  let session = null;
  try {
    const nextAuthSession = await getServerSession(authOptions);
    
    if (!nextAuthSession || nextAuthSession.user.role !== UserRole.ROOT_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, reason } = await req.json(); // action can be 'APPROVE' or 'REJECT'
    const { id } = await props.params;
    const requestId = id;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'REJECT' && (!reason || reason.trim().length < 5)) {
      return NextResponse.json({ error: 'Valid rejection reason is required' }, { status: 400 });
    }

    await dbConnect();
    
    session = await mongoose.startSession();
    session.startTransaction();

    const request = await RegistrationRequest.findById(requestId).session(session);
    if (!request) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Registration request not found' }, { status: 404 });
    }

    if (request.status !== RegistrationStatus.PENDING) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // Check duplicate user again
      const existingUser = await User.findOne({ $or: [{ email: request.email }, { phone: request.phone }] }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        return NextResponse.json({ error: 'User with this email or phone already exists' }, { status: 400 });
      }

      // Check referrer is still active
      let finalReferrerId = null;
      if (request.referrer) {
        const referrerUser = await User.findById(request.referrer).session(session);
        if (!referrerUser || referrerUser.status !== UserStatus.ACTIVE) {
          await session.abortTransaction();
          return NextResponse.json({ error: 'Referrer is no longer active or does not exist' }, { status: 400 });
        }
        finalReferrerId = referrerUser._id;
      }

      // Generate unique loginId (SAKHI + 6 random digits)
      let uniqueLoginId = '';
      let isUnique = false;
      while (!isUnique) {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        uniqueLoginId = `SAKHI${randomNum}`;
        const existingLoginId = await User.findOne({ loginId: uniqueLoginId }).session(session);
        if (!existingLoginId) {
          isUnique = true;
        }
      }

      // Generate temporary password (6 characters)
      const tempPassword = crypto.randomBytes(3).toString('hex').toLowerCase();
      const hashedPassword = await hashPassword(tempPassword);

      // Generate referral code
      const newReferralCode = await generateUniqueReferralCode(request.name);

      // Create User
      const [newUser] = await User.create([{
        name: request.name,
        email: request.email,
        phone: request.phone,
        password: hashedPassword,
        loginId: uniqueLoginId,
        mustChangePassword: true,
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        referralCode: newReferralCode,
        referredBy: finalReferrerId,
      }], { session });

      request.status = RegistrationStatus.APPROVED;

      // Create ReferralHistory if referrer exists
      if (finalReferrerId) {
        await ReferralHistory.create([{
          referrer: finalReferrerId,
          referredUser: newUser._id,
          referralCode: request.referralCode,
          status: 'APPROVED',
          registrationDate: request.createdAt,
          approvalDate: new Date(),
        }], { session });
      }

      await AuditLog.create([{
        performedBy: nextAuthSession.user.id,
        action: 'REGISTRATION_APPROVED',
        entityType: 'User',
        entityId: newUser._id,
        description: `Approved registration for ${request.email}. Generated ID: ${uniqueLoginId}`,
      }], { session });

      // In a real app, send email/SMS with credentials here. For now, we will just return them.
      // We will attach them to the response for the admin UI to display.
      request.set('tempPassword', tempPassword, { strict: false });
      request.set('loginId', uniqueLoginId, { strict: false });

    } else if (action === 'REJECT') {
      request.status = RegistrationStatus.REJECTED;
      request.rejectionReason = reason;

      await AuditLog.create([{
        performedBy: nextAuthSession.user.id,
        action: 'REGISTRATION_REJECTED',
        entityType: 'RegistrationRequest',
        entityId: request._id,
        description: `Rejected registration for ${request.email}. Reason: ${reason}`,
      }], { session });
    }

    request.reviewedBy = nextAuthSession.user.id as any;
    request.reviewedAt = new Date();
    await request.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ 
      success: true, 
      message: `Registration ${action.toLowerCase()}d successfully`,
      credentials: action === 'APPROVE' ? {
        loginId: request.get('loginId'),
        tempPassword: request.get('tempPassword')
      } : null
    });
  } catch (error: any) {
    console.error('Process Registration Error:', error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

