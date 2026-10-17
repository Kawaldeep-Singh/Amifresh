import { NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import RegistrationRequest, { RegistrationStatus } from '@/models/RegistrationRequest';
import { registrationSchema } from '@/lib/validations/registration';
import { getReferrerByCode } from '@/services/referral.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const result = registrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    
    const { 
      name, email, phone, referralCode, 
      dob, address, city, state, pinCode, fatherSpouseName,
      photo, panCard, aadhaarCard, aadhaarCardFront, aadhaarCardBack
    } = result.data;
    
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email or mobile number already exists.' }, { status: 400 });
    }

    // Verify referral code if provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await getReferrerByCode(referralCode);
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code.' }, { status: 400 });
      }
      referrerId = referrer._id;
    }

    // Generate unique official Sakhi ID (e.g. SAKHI1001 / SAKHI + 6 digits)
    let sakhiId = '';
    let isUniqueSakhiId = false;
    while (!isUniqueSakhiId) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      sakhiId = `SAKHI${randomNum}`;
      const existing = await User.findOne({ loginId: sakhiId });
      if (!existing) {
        isUniqueSakhiId = true;
      }
    }

    // Generate a final referral code immediately
    const { generateUniqueReferralCode } = await import('@/services/referral.service');
    const newReferralCode = await generateUniqueReferralCode(name);

    // Create User directly with PENDING status and assigned Sakhi loginId
    await User.create({
      name,
      email,
      phone,
      loginId: sakhiId,
      referralCode: newReferralCode,
      referredBy: referrerId,
      status: 'PENDING',
      role: 'SAKHI',
      dob,
      address,
      city,
      state,
      pinCode,
      fatherSpouseName,
      photo,
      panCard,
      aadhaarCard: aadhaarCardFront || aadhaarCard,
      aadhaarCardFront,
      aadhaarCardBack,
    });

    // Send WhatsApp notification using sakhi_reg campaign
    try {
      const { sendSakhiRegistrationMessage } = await import('@/services/whatsapp.service');
      await sendSakhiRegistrationMessage({
        destination: phone,
        userName: name,
        registrationId: sakhiId,
      });
    } catch (waError) {
      console.error('WhatsApp registration notification warning:', waError);
    }

    return NextResponse.json({
      message: 'Registration submitted successfully. Your registration is currently under review.',
      success: true,
      registrationId: sakhiId,
      referralCode: newReferralCode,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'An error occurred during registration.' }, { status: 500 });
  }
}

