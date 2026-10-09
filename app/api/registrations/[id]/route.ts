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

    const { action, reason, role } = await req.json(); // action can be 'APPROVE' or 'REJECT'
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

    const request = await User.findById(requestId).session(session);
    if (!request) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'User registration not found' }, { status: 404 });
    }

    if (request.status !== UserStatus.PENDING) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    let tempPassword = '';

    if (action === 'APPROVE') {
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
      tempPassword = crypto.randomBytes(3).toString('hex').toLowerCase();
      const hashedPassword = await hashPassword(tempPassword);

      request.loginId = uniqueLoginId;
      request.password = hashedPassword;
      request.mustChangePassword = true;
      request.role = role === 'TEAM' ? UserRole.TEAM : UserRole.SAKHI;
      request.status = UserStatus.ACTIVE;

      // Create ReferralHistory if referrer exists
      if (request.referredBy) {
        await ReferralHistory.create([{
          referrer: request.referredBy,
          referredUser: request._id,
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
        entityId: request._id,
        description: `Approved registration for ${request.email}. Generated ID: ${uniqueLoginId}`,
      }], { session });

      await request.save({ session });

    } else if (action === 'REJECT') {
      request.status = UserStatus.REJECTED;
      request.statusRemark = reason;

      await AuditLog.create([{
        performedBy: nextAuthSession.user.id,
        action: 'REGISTRATION_REJECTED',
        entityType: 'User',
        entityId: request._id,
        description: `Rejected registration for ${request.email}. Reason: ${reason}`,
      }], { session });

      await request.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if (action === 'APPROVE') {
      return NextResponse.json({
        message: 'Registration approved successfully',
        credentials: {
          email: request.email,
          loginId: request.loginId,
          tempPassword,
        }
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'Registration rejected successfully'
      });
    }
  } catch (error: any) {
    console.error('Process Registration Error:', error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

