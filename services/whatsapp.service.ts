export interface WhatsAppPayload {
  campaignName: string;
  destination: string;
  userName: string;
  source?: string;
  media?: {
    url: string;
    filename: string;
  };
  templateParams?: string[];
  tags?: string[];
  attributes?: Record<string, string>;
}

export async function sendWhatsAppMessage(payload: WhatsAppPayload) {
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiKey) {
    throw new Error('WHATSAPP_API_KEY is not defined in environment variables');
  }

  // Normalize destination phone number
  let destination = (payload.destination || '').trim().replace(/[\s\-\(\)]/g, '');
  if (/^\d{10}$/.test(destination)) {
    destination = `+91${destination}`;
  } else if (/^91\d{10}$/.test(destination)) {
    destination = `+${destination}`;
  } else if (/^\d{11,15}$/.test(destination)) {
    destination = `+${destination}`;
  }

  if (!destination || destination === '+91' || destination.length < 12) {
    throw new Error('Invalid mobile number. Please provide a valid 10-digit mobile number with country code (e.g. +919876543210)');
  }

  const response = await fetch('https://backend.api-wa.co/campaign/smartping/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey,
      ...payload,
      destination,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

export interface OrderDeliveredPayload {
  destination: string;
  userName: string;
  templateParams?: string[];
  media?: {
    url: string;
    filename: string;
  };
  attributes?: Record<string, string>;
}

export async function sendOrderDeliveredMessage(data: OrderDeliveredPayload) {
  const campaignName = process.env.WHATSAPP_CAMPAIGN_ORDER_DELIVERED || 'order_delivred';
  return sendWhatsAppMessage({
    campaignName,
    destination: data.destination,
    userName: data.userName,
    templateParams: data.templateParams || [],
    media: data.media,
    attributes: data.attributes,
  });
}

export interface SakhiRegistrationPayload {
  destination: string;
  userName: string;
  registrationId: string;
}

export async function sendSakhiRegistrationMessage(data: SakhiRegistrationPayload) {
  const campaignName = process.env.WHATSAPP_CAMPAIGN_SAKHI_REG || 'sakhi_reg';
  return sendWhatsAppMessage({
    campaignName,
    destination: data.destination,
    userName: data.userName,
    templateParams: [data.userName, data.registrationId],
  });
}

export interface SakhiAccountCreatedPayload {
  destination: string;
  userName: string;
  loginId: string;
  password: string;
  referralCode: string;
}

export async function sendSakhiAccountCreatedMessage(data: SakhiAccountCreatedPayload) {
  const campaignName =
    process.env.WHATSAPP_CAMPAIGN_SAKHI_ACCOUNT_CREATED ||
    'sample_given1';

  const domain =
    process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')
      ? process.env.NEXTAUTH_URL
      : 'https://sakhi.amifresh.in';

  const referralLink = `${domain.replace(/\/$/, '')}/join?ref=${data.referralCode}`;

  return sendWhatsAppMessage({
    campaignName,
    destination: data.destination,
    userName: data.userName,
    templateParams: [
      data.userName,
      `🔐 User Name - ${data.loginId}`,
      `🔑 Password - ${data.password}`,
      referralLink,
    ],
  });
}

export interface SakhiApprovalSequencePayload {
  destination: string;
  userName: string;
  loginId: string;
  password: string;
  referralCode: string;
  delayMs?: number;
}

export async function sendSakhiApprovalSequence(data: SakhiApprovalSequencePayload) {
  const kycCampaign = process.env.WHATSAPP_CAMPAIGN_SAKHI_APPROVED || 'sakhi_approved1';

  // Step 1: Immediately send KYC Approved message (sakhi_approved1)
  let kycResult = null;
  try {
    kycResult = await sendWhatsAppMessage({
      campaignName: kycCampaign,
      destination: data.destination,
      userName: data.userName,
      templateParams: [data.userName],
    });
    console.log(`[WhatsApp Sequence 1/2] KYC approval message sent to ${data.destination}:`, kycResult);
  } catch (err) {
    console.error(`[WhatsApp Sequence 1/2] Error sending KYC approval to ${data.destination}:`, err);
  }

  // Step 2: Send Account Credentials & Referral Link (sample_given1) after delay (default 12-15 seconds)
  const delayMs = data.delayMs ?? 12000;
  setTimeout(async () => {
    try {
      const credsResult = await sendSakhiAccountCreatedMessage({
        destination: data.destination,
        userName: data.userName,
        loginId: data.loginId,
        password: data.password,
        referralCode: data.referralCode,
      });
      console.log(`[WhatsApp Sequence 2/2] Account details message sent to ${data.destination} after ${delayMs / 1000}s:`, credsResult);
    } catch (err) {
      console.error(`[WhatsApp Sequence 2/2] Error sending credentials to ${data.destination}:`, err);
    }
  }, delayMs);

  return kycResult;
}

export interface SakhiApprovedPayload {
  destination: string;
  userName: string;
  loginId?: string;
  password?: string;
  referralCode?: string;
  delayMs?: number;
}

export async function sendSakhiApprovedMessage(data: SakhiApprovedPayload) {
  if (data.loginId && data.password && data.referralCode) {
    return sendSakhiApprovalSequence({
      destination: data.destination,
      userName: data.userName,
      loginId: data.loginId,
      password: data.password,
      referralCode: data.referralCode,
      delayMs: data.delayMs,
    });
  }

  const campaignName = process.env.WHATSAPP_CAMPAIGN_SAKHI_APPROVED || 'sakhi_approved1';
  return sendWhatsAppMessage({
    campaignName,
    destination: data.destination,
    userName: data.userName,
    templateParams: [data.userName],
  });
}

export interface SakhiFailedPayload {
  destination: string;
  userName: string;
}

export async function sendSakhiFailedMessage(data: SakhiFailedPayload) {
  const campaignName = process.env.WHATSAPP_CAMPAIGN_SAKHI_FAILED || 'sakhi_failed';
  return sendWhatsAppMessage({
    campaignName,
    destination: data.destination,
    userName: data.userName,
    templateParams: [data.userName],
  });
}

