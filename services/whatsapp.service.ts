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

  const response = await fetch('https://backend.api-wa.co/campaign/smartping/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey,
      ...payload
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}
