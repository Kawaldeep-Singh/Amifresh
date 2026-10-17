import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendSakhiApprovalSequence } from '@/services/whatsapp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.isSequence) {
      const result = await sendSakhiApprovalSequence({
        destination: body.destination,
        userName: body.userName || 'Amit Sharma',
        loginId: body.loginId || 'SAKHI978925',
        password: body.password || 'Password@123',
        referralCode: body.referralCode || 'AMIT8760',
        delayMs: Number(body.delayMs) || 12000,
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Sequence initiated! Step 1 (KYC Approved) sent immediately. Step 2 (ID & Password) will arrive in 12-15 seconds.',
      });
    }

    const result = await sendWhatsAppMessage({
      campaignName: body.campaignName,
      destination: body.destination,
      userName: body.userName,
      templateParams: body.templateParams || [],
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('WhatsApp Test Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
