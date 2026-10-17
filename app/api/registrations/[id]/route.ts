import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { hashPassword } from '@/lib/auth/password';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User, { UserRole, UserStatus } from '@/models/User';
import ReferralHistory from '@/models/ReferralHistory';
import AuditLog from '@/models/AuditLog';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
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

    const request = await User.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: 'User registration not found' }, { status: 404 });
    }

    if (request.status !== UserStatus.PENDING) {
      return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    let tempPassword = '';

    if (action === 'APPROVE') {
      // Use existing assigned loginId (SAKHI...) or generate unique loginId
      let uniqueLoginId = request.loginId || '';
      if (!uniqueLoginId) {
        let isUnique = false;
        while (!isUnique) {
          const randomNum = Math.floor(100000 + Math.random() * 900000);
          uniqueLoginId = `SAKHI${randomNum}`;
          const existingLoginId = await User.findOne({ loginId: uniqueLoginId });
          if (!existingLoginId) {
            isUnique = true;
          }
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

      // Extract referrer ID correctly whether it's an object or string
      const referrerId = typeof request.referredBy === 'object' && request.referredBy
        ? (request.referredBy.id || request.referredBy._id)
        : request.referredBy;

      // Create ReferralHistory if referrer exists
      if (referrerId) {
        try {
          await ReferralHistory.create({
            referrer: referrerId,
            referredUser: request.id || request._id,
            referralCode: request.referralCode,
            status: 'APPROVED',
            registrationDate: request.createdAt,
            approvalDate: new Date(),
          });
        } catch (rhErr) {
          console.error('ReferralHistory creation warning:', rhErr);
        }
      }

      try {
        await AuditLog.create({
          performedBy: nextAuthSession.user.id,
          action: 'REGISTRATION_APPROVED',
          entityType: 'User',
          entityId: request.id || request._id,
          description: `Approved registration for ${request.email}. Generated ID: ${uniqueLoginId}`,
        });
      } catch (alErr) {
        console.error('AuditLog creation warning:', alErr);
      }

      await request.save();

      // Send WhatsApp approval notification sequence:
      // 1. KYC Approved message immediately (sakhi_approved1)
      // 2. Account Created message (sample_given1) with ID/Password & referral link after 12-15 seconds
      if (request.phone) {
        try {
          const { sendSakhiApprovalSequence } = await import('@/services/whatsapp.service');
          await sendSakhiApprovalSequence({
            destination: request.phone,
            userName: request.name,
            loginId: uniqueLoginId,
            password: tempPassword,
            referralCode: request.referralCode,
            delayMs: 12000,
          });
        } catch (waErr) {
          console.error('WhatsApp approval notification sequence warning:', waErr);
        }
      }

    } else if (action === 'REJECT') {
      request.status = UserStatus.REJECTED;
      request.statusRemark = reason;

      try {
        await AuditLog.create({
          performedBy: nextAuthSession.user.id,
          action: 'REGISTRATION_REJECTED',
          entityType: 'User',
          entityId: request.id || request._id,
          description: `Rejected registration for ${request.email}. Reason: ${reason}`,
        });
      } catch (alErr) {
        console.error('AuditLog creation warning:', alErr);
      }

      await request.save();

      // Send WhatsApp rejection notification using sakhi_failed campaign
      if (request.phone) {
        try {
          const { sendSakhiFailedMessage } = await import('@/services/whatsapp.service');
          await sendSakhiFailedMessage({
            destination: request.phone,
            userName: request.name,
          });
        } catch (waErr) {
          console.error('WhatsApp rejection notification warning:', waErr);
        }
      }
    }

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
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

