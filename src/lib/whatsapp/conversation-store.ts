import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Message = { role: 'user' | 'assistant'; content: string };

export async function getOrCreateConversation(patientPhone: string) {
  // Look for an active conversation (updated within 24 hours)
  const { data: existing } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('patient_phone', patientPhone)
    .eq('session_state', 'active')
    .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from('whatsapp_conversations')
    .insert({ patient_phone: patientPhone, conversation_history: [] })
    .select()
    .single();

  if (error) throw error;
  return newConv;
}

export async function updateConversationHistory(
  conversationId: string,
  history: Message[],
  patientName?: string
) {
  const update: Record<string, unknown> = { conversation_history: history };
  if (patientName) update.patient_name = patientName;

  await supabase
    .from('whatsapp_conversations')
    .update(update)
    .eq('id', conversationId);
}

export async function logMessage(
  conversationId: string,
  direction: 'inbound' | 'outbound',
  body: string,
  sid?: string
) {
  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversationId,
    direction,
    message_body: body,
    twilio_message_sid: sid,
  });
}

export async function saveAppointment(data: {
  conversationId: string;
  patientPhone: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  treatmentType: string;
  notes?: string;
}) {
  const { data: appt, error } = await supabase
    .from('whatsapp_appointments')
    .insert({
      conversation_id: data.conversationId,
      patient_phone: data.patientPhone,
      patient_name: data.patientName,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      treatment_type: data.treatmentType,
      notes: data.notes,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) throw error;
  return appt;
}

export async function saveIntakeData(data: Record<string, unknown>) {
  await supabase.from('patient_intake_forms').upsert(data, {
    onConflict: 'conversation_id',
  });
}

export async function getUpcomingAppointmentsForReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // 24-hour reminders
  const { data: remind24 } = await supabase
    .from('whatsapp_appointments')
    .select('*')
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .gte('appointment_date', now.toISOString().split('T')[0])
    .lte('appointment_date', in24h.toISOString().split('T')[0]);

  // 2-hour reminders
  const { data: remind2 } = await supabase
    .from('whatsapp_appointments')
    .select('*')
    .eq('status', 'confirmed')
    .eq('reminder_2h_sent', false)
    .gte('appointment_date', now.toISOString().split('T')[0])
    .lte('appointment_date', in2h.toISOString().split('T')[0]);

  return { remind24: remind24 || [], remind2: remind2 || [] };
}

export async function markReminderSent(
  appointmentId: string,
  type: '24h' | '2h'
) {
  const field = type === '24h' ? 'reminder_24h_sent' : 'reminder_2h_sent';
  await supabase
    .from('whatsapp_appointments')
    .update({ [field]: true })
    .eq('id', appointmentId);
}
