// Manual send from the admin dashboard

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/twilio';
import { logMessage } from '@/lib/whatsapp/conversation-store';

export async function POST(req: NextRequest) {
  const { to, message, conversationId } = await req.json();

  if (!to || !message) {
    return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });
  }

  const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const sendResult = await sendWhatsAppMessage(whatsappTo, message);

  if (!sendResult.success) {
    return NextResponse.json({ error: 'Failed to send message', detail: sendResult.error }, { status: 500 });
  }

  if (conversationId) {
    await logMessage(conversationId, 'outbound', message, sendResult.sid);
  }

  return NextResponse.json({ success: true, sid: sendResult.sid });
}
