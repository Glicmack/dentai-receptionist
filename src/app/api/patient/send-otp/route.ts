import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateOTP, normalizePhone } from "@/lib/patient-auth"
import { sendSMS } from "@/lib/twilio"

const OTP_EXPIRY_MINUTES = 10
const MAX_OTPS_PER_WINDOW = 3

export async function POST(request: Request) {
  try {
    const { phone, clinicSlug } = await request.json()

    if (!phone || !clinicSlug) {
      return NextResponse.json({ error: "Phone and clinic are required" }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)
    const adminClient = createAdminClient()

    // Look up clinic by slug
    const { data: clinic } = await adminClient
      .from("clinics")
      .select("id, name")
      .eq("slug", clinicSlug)
      .single()

    if (!clinic) {
      // Don't reveal clinic doesn't exist
      return NextResponse.json({ success: true })
    }

    // Check if patient exists for this clinic (has any records)
    const [appointments, conversations, leads] = await Promise.all([
      adminClient
        .from("appointments")
        .select("id")
        .eq("clinic_id", clinic.id)
        .eq("patient_phone", normalizedPhone)
        .limit(1),
      adminClient
        .from("conversations")
        .select("id")
        .eq("clinic_id", clinic.id)
        .eq("patient_phone", normalizedPhone)
        .limit(1),
      adminClient
        .from("leads")
        .select("id")
        .eq("clinic_id", clinic.id)
        .eq("patient_phone", normalizedPhone)
        .limit(1),
    ])

    const hasRecords =
      (appointments.data && appointments.data.length > 0) ||
      (conversations.data && conversations.data.length > 0) ||
      (leads.data && leads.data.length > 0)

    if (!hasRecords) {
      // Don't reveal patient doesn't exist
      return NextResponse.json({ success: true })
    }

    // Rate limit: max OTPs per window
    const windowStart = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()
    const { count } = await adminClient
      .from("patient_otps")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinic.id)
      .eq("phone", normalizedPhone)
      .gte("created_at", windowStart)

    if (count && count >= MAX_OTPS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes." },
        { status: 429 }
      )
    }

    // Generate and store OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

    await adminClient.from("patient_otps").insert({
      clinic_id: clinic.id,
      phone: normalizedPhone,
      code,
      expires_at: expiresAt,
    })

    // Send OTP via SMS
    await sendSMS(
      normalizedPhone,
      `Your ${clinic.name} verification code is: ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 })
  }
}
