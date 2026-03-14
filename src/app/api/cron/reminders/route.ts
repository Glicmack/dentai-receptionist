import { NextResponse } from 'next/server';
import { getUpcomingAppointmentsForReminders, markReminderSent } from '@/lib/whatsapp/conversation-store';
import { sendWhatsAppMessage } from '@/lib/whatsapp/twilio';

export const dynamic = 'force-dynamic';

// Called by Vercel Cron every hour
export async function GET(req: Request) {
  // Secure the cron endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { remind24, remind2 } = await getUpcomingAppointmentsForReminders();

  let sent = 0;

  // Send 24-hour reminders
  for (const appt of remind24) {
    const msg = `*Appointment Reminder*\n\nHi ${appt.patient_name}! Just a reminder that you have an appointment at *${process.env.PRACTICE_NAME}* tomorrow.\n\n*${appt.appointment_date}* at *${appt.appointment_time}*\n${appt.treatment_type}\n${process.env.PRACTICE_ADDRESS}\n\nReply *CONFIRM* to confirm or *CANCEL* to cancel.\n\nSee you soon!`;

    await sendWhatsAppMessage(appt.patient_phone, msg);
    await markReminderSent(appt.id, '24h');
    sent++;
  }

  // Send 2-hour reminders
  for (const appt of remind2) {
    const msg = `*See you in 2 hours!*\n\nHi ${appt.patient_name}! Your appointment at *${process.env.PRACTICE_NAME}* is in just 2 hours.\n\n${appt.appointment_time} today\n${process.env.PRACTICE_ADDRESS}\n\nPlease arrive 5 minutes early. See you soon!`;

    await sendWhatsAppMessage(appt.patient_phone, msg);
    await markReminderSent(appt.id, '2h');
    sent++;
  }

  return NextResponse.json({ success: true, remindersSent: sent });
}
