import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  sendReminder24h,
  sendReminder2h,
  sendWhatsAppReminder24h,
  sendWhatsAppReminder2h,
} from "@/lib/twilio"

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  let sent24h = 0
  let sent2h = 0

  // --- 24-hour reminders ---
  const twentyFourHoursFromNow = new Date(
    now.getTime() + 24 * 60 * 60 * 1000
  )
  const twentyThreeHoursFromNow = new Date(
    now.getTime() + 23 * 60 * 60 * 1000
  )

  const { data: reminders24h } = await supabase
    .from("appointments")
    .select("*, clinics!inner(name, whatsapp_enabled)")
    .eq("status", "confirmed")
    .eq("reminder_24h_sent", false)
    .gte("appointment_datetime", twentyThreeHoursFromNow.toISOString())
    .lte("appointment_datetime", twentyFourHoursFromNow.toISOString())

  for (const appt of reminders24h || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clinicData = appt.clinics as any
    const time = new Date(appt.appointment_datetime).toLocaleTimeString(
      "en-US",
      { hour: "numeric", minute: "2-digit", hour12: true }
    )

    const useWhatsApp =
      appt.booked_via === "whatsapp" && clinicData.whatsapp_enabled

    let success = false
    if (useWhatsApp) {
      success = await sendWhatsAppReminder24h(
        appt.patient_phone,
        clinicData.name,
        time
      )
    } else {
      success = await sendReminder24h(
        appt.patient_phone,
        clinicData.name,
        time
      )
    }

    if (success) {
      await supabase
        .from("appointments")
        .update({ reminder_24h_sent: true })
        .eq("id", appt.id)
      sent24h++
    }
  }

  // --- 2-hour reminders ---
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000)

  const { data: reminders2h } = await supabase
    .from("appointments")
    .select("*, clinics!inner(name, whatsapp_enabled)")
    .eq("status", "confirmed")
    .eq("reminder_2h_sent", false)
    .eq("reminder_24h_sent", true)
    .gte("appointment_datetime", oneHourFromNow.toISOString())
    .lte("appointment_datetime", twoHoursFromNow.toISOString())

  for (const appt of reminders2h || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clinicData = appt.clinics as any
    const time = new Date(appt.appointment_datetime).toLocaleTimeString(
      "en-US",
      { hour: "numeric", minute: "2-digit", hour12: true }
    )

    const useWhatsApp =
      appt.booked_via === "whatsapp" && clinicData.whatsapp_enabled

    let success = false
    if (useWhatsApp) {
      success = await sendWhatsAppReminder2h(
        appt.patient_phone,
        clinicData.name,
        time
      )
    } else {
      success = await sendReminder2h(
        appt.patient_phone,
        clinicData.name,
        time
      )
    }

    if (success) {
      await supabase
        .from("appointments")
        .update({ reminder_2h_sent: true })
        .eq("id", appt.id)
      sent2h++
    }
  }

  return NextResponse.json({
    success: true,
    sent: { reminders_24h: sent24h, reminders_2h: sent2h },
    timestamp: now.toISOString(),
  })
}
