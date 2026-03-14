import { NextRequest, NextResponse } from 'next/server';
import { runDentalAgent } from '@/lib/whatsapp/claude-dental-agent';
import {
  getOrCreateConversation,
  updateConversationHistory,
  logMessage,
  saveAppointment,
  saveIntakeData,
} from '@/lib/whatsapp/conversation-store';
import { sendWhatsAppMessage } from '@/lib/whatsapp/twilio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries()) as Record<string, string>;

    const patientPhone = body.From;   // e.g. whatsapp:+447911123456
    const messageBody = body.Body?.trim();

    if (!patientPhone || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[WhatsApp] Inbound from ${patientPhone}: ${messageBody}`);

    // Get or create conversation session
    const conversation = await getOrCreateConversation(patientPhone);
    const history = (conversation.conversation_history || []) as Array<{ role: 'user' | 'assistant'; content: string }>;

    // Log inbound message
    await logMessage(conversation.id, 'inbound', messageBody, body.MessageSid);

    // Run Claude dental agent
    const result = await runDentalAgent(history, messageBody);

    // Update conversation history
    const newHistory = [
      ...history,
      { role: 'user' as const, content: messageBody },
      { role: 'assistant' as const, content: result.reply },
    ];

    await updateConversationHistory(
      conversation.id,
      newHistory,
      result.patientName
    );

    // Handle tool calls
    if (result.toolCall) {
      if (result.toolCall.name === 'book_appointment') {
        const input = result.toolCall.input as {
          patient_name: string;
          appointment_date: string;
          appointment_time: string;
          treatment_type: string;
          notes?: string;
        };
        await saveAppointment({
          conversationId: conversation.id,
          patientPhone,
          patientName: input.patient_name,
          appointmentDate: input.appointment_date,
          appointmentTime: input.appointment_time,
          treatmentType: input.treatment_type,
          notes: input.notes,
        });
      } else if (result.toolCall.name === 'save_intake_data') {
        await saveIntakeData({
          conversation_id: conversation.id,
          patient_phone: patientPhone,
          ...result.toolCall.input,
        });
      }
    }

    // Send reply via Twilio
    const sendResult = await sendWhatsAppMessage(patientPhone, result.reply);
    if (sendResult.success) {
      await logMessage(conversation.id, 'outbound', result.reply, sendResult.sid);
    }

    // Twilio expects a 200 with empty TwiML or plain text
    return new NextResponse('', { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Twilio sends POST only; block other methods
export async function GET() {
  return NextResponse.json({ status: 'WhatsApp webhook active' });
}
