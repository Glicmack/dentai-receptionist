import twilio from 'twilio';

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

function formatWhatsAppNumber(phone: string): string {
  return phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
}

export async function sendWhatsAppMessage(to: string, body: string) {
  try {
    const client = getClient();
    const message = await client.messages.create({
      from: formatWhatsAppNumber(process.env.TWILIO_WHATSAPP_NUMBER!),
      to: formatWhatsAppNumber(to),
      body,
    });
    return { success: true as const, sid: message.sid };
  } catch (error) {
    console.error('[Twilio] Send error:', error);
    return { success: false as const, error };
  }
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );
}
