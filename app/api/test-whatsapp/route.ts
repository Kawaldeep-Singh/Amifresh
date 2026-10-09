import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/services/whatsapp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Yahan par hum test values pass kar rahe hain
    // Aap Postman ya kisi aur tool se body me values bhej sakte hain
    const result = await sendWhatsAppMessage({
      campaignName: body.campaignName, // e.g. "welcome_message"
      destination: body.destination,   // e.g. "+919876543210"
      userName: body.userName,         // e.g. "Kawaldeep"
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
