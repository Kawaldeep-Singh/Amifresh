import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getReferrerByCode } from '@/services/referral.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const referrer = await getReferrerByCode(code.toUpperCase());

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      referrer: {
        name: referrer.name,
      }
    });
  } catch (error) {
    console.error('Validate Referral Error:', error);
    return NextResponse.json({ error: 'Failed to validate referral code' }, { status: 500 });
  }
}
