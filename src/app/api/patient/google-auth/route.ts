import { NextResponse } from "next/server"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { createAdminClient } from "@/lib/supabase/admin"
import { createPatientToken, setPatientCookie } from "@/lib/patient-auth"

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
)

export async function POST(request: Request) {
  try {
    const { credential, clinicSlug } = await request.json()

    if (!credential || !clinicSlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the Google ID token
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const email = payload.email as string
    const fullName = payload.name as string || "Patient"

    if (!email) {
      return NextResponse.json({ error: "Email not found in Google account" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Look up clinic
    const { data: clinic } = await adminClient
      .from("clinics")
      .select("id")
      .eq("slug", clinicSlug)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    // Find or create patient record
    let patientId = ""
    const { data: existingPatient } = await adminClient
      .from("patients")
      .select("id, full_name")
      .eq("email", email.toLowerCase())
      .single()

    if (existingPatient) {
      patientId = existingPatient.id
    } else {
      // Auto-register Google user as a patient (no password needed)
      const { data: newPatient, error: insertError } = await adminClient
        .from("patients")
        .insert({
          email: email.toLowerCase(),
          full_name: fullName,
          password_hash: "", // Google OAuth — no password
          google_auth: true,
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("Failed to create patient:", insertError)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
      }
      patientId = newPatient.id
    }

    // Create patient session
    const token = await createPatientToken({
      patientId,
      email: email.toLowerCase(),
      fullName,
    })
    setPatientCookie(token)

    return NextResponse.json({ success: true, patientName: fullName })
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
