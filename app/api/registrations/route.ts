import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import RegistrationRequest from '@/models/RegistrationRequest';
import User, { UserRole } from '@/models/User';

export async function GET(req: Request) {
  // Opt into dynamic rendering
  const url = req.url;
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    await dbConnect();

    // Fetch registrations matching the status
    const requests = await User.find({ status })
      .populate('referredBy', 'name email referralCode')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Fetch Registrations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

