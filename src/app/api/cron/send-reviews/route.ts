import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppReviewRequest } from "@/lib/twilio"

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  let sentCount = 0

  // Find completed appointments in the last 4 hours that haven't had a review request
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)

  const { data: completedAppts } = await supabase
    .from("appointments")
    .select("*, clinics!inner(name, whatsapp_enabled, google_review_url)")
    .eq("status", "completed")
    .eq("review_request_sent", false)
    .gte("completed_at", fourHoursAgo.toISOString())

  for (const appt of completedAppts || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clinicData = appt.clinics as any

    // Only send if clinic has WhatsApp enabled AND a Google review URL
    if (!clinicData.whatsapp_enabled || !clinicData.google_review_url) continue
    if (!appt.patient_phone) continue

    const success = await sendWhatsAppReviewRequest(
      appt.patient_phone,
      appt.patient_name,
      clinicData.name,
      clinicData.google_review_url
    )

    if (success) {
      await supabase
        .from("appointments")
        .update({ review_request_sent: true })
        .eq("id", appt.id)
      sentCount++
    }
  }

  return NextResponse.json({
    success: true,
    sent: sentCount,
    timestamp: new Date().toISOString(),
  })
}
