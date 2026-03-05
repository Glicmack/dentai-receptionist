import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: Request,
  { params }: { params: { clinicSlug: string } }
) {
  try {
    const supabase = createAdminClient()

    const { data: clinic, error } = await supabase
      .from("clinics")
      .select("name, slug, phone, hours, services, insurance_accepted, ai_greeting, ai_tone, timezone")
      .eq("slug", params.clinicSlug)
      .single()

    if (error || !clinic) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      )
    }

    // Return only safe, public data
    return NextResponse.json({
      name: clinic.name,
      slug: clinic.slug,
      phone: clinic.phone,
      hours: clinic.hours,
      services: clinic.services,
      insuranceAccepted: clinic.insurance_accepted,
      greeting: clinic.ai_greeting,
      tone: clinic.ai_tone,
      timezone: clinic.timezone,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to load clinic data" },
      { status: 500 }
    )
  }
}
