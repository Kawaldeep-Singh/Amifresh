import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    await dbConnect();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate temporary password (6 characters)
    const tempPassword = crypto.randomBytes(3).toString('hex').toLowerCase();
    const hashedPassword = await hashPassword(tempPassword);

    targetUser.password = hashedPassword;
    targetUser.mustChangePassword = true;
    await targetUser.save();

    await AuditLog.create({
      performedBy: session.user.id,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: targetUser._id,
      description: `Reset password for user ${targetUser.email}. New password generated.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      credentials: {
        loginId: targetUser.loginId || targetUser.email,
        tempPassword: tempPassword,
      }
    });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
