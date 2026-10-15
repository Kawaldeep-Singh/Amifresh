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
