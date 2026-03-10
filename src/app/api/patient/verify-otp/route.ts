import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  normalizePhone,
  createPatientToken,
  setPatientCookie,
} from "@/lib/patient-auth"

const MAX_ATTEMPTS = 5

export async function POST(request: Request) {
  try {
    const { phone, code, clinicSlug } = await request.json()

    if (!phone || !code || !clinicSlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)
    const adminClient = createAdminClient()

    // Look up clinic
    const { data: clinic } = await adminClient
      .from("clinics")
      .select("id")
      .eq("slug", clinicSlug)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }

    // Find the latest unexpired, unverified OTP
    const now = new Date().toISOString()
    const { data: otp } = await adminClient
      .from("patient_otps")
      .select("*")
      .eq("clinic_id", clinic.id)
      .eq("phone", normalizedPhone)
      .eq("verified", false)
      .gte("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!otp) {
      return NextResponse.json({ error: "Code expired or not found" }, { status: 400 })
    }

    // Check attempts
    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 400 })
    }

    // Increment attempts
    await adminClient
      .from("patient_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id)

    // Verify code
    if (otp.code !== code) {
      const remaining = MAX_ATTEMPTS - (otp.attempts + 1)
      return NextResponse.json(
        { error: "Invalid code", attemptsRemaining: remaining },
        { status: 400 }
      )
    }

    // Mark as verified
    await adminClient
      .from("patient_otps")
      .update({ verified: true })
      .eq("id", otp.id)

    // Get patient name from most recent appointment or conversation
    let patientName = "Patient"
    const { data: recentAppt } = await adminClient
      .from("appointments")
      .select("patient_name")
      .eq("clinic_id", clinic.id)
      .eq("patient_phone", normalizedPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (recentAppt?.patient_name) {
      patientName = recentAppt.patient_name
    } else {
      const { data: recentConvo } = await adminClient
        .from("conversations")
        .select("patient_name")
        .eq("clinic_id", clinic.id)
        .eq("patient_phone", normalizedPhone)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (recentConvo?.patient_name) {
        patientName = recentConvo.patient_name
      }
    }

    // Create JWT and set cookie
    const token = await createPatientToken({
      patientId: "", // OTP-based auth doesn't have a patient account yet
      email: "", // OTP-based auth uses phone
      fullName: patientName,
    })
    setPatientCookie(token)

    return NextResponse.json({ success: true, patientName })
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
