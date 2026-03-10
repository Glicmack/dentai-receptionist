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
    const name = payload.name as string || "Patient"

    if (!email) {
      return NextResponse.json({ error: "Email not found in Google account" }, { status: 400 })
    }

    // Look up clinic
    const adminClient = createAdminClient()
    const { data: clinic } = await adminClient
      .from("clinics")
      .select("id")
      .eq("slug", clinicSlug)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    // Create patient session with email
    const token = await createPatientToken({
      phone: "",
      email,
      name,
      clinicId: clinic.id,
      clinicSlug,
    })
    setPatientCookie(token)

    return NextResponse.json({ success: true, patientName: name })
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
