import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: Request,
  { params }: { params: { clinicSlug: string } }
) {
  try {
    const adminClient = createAdminClient()

    const { data: clinic, error } = await adminClient
      .from("clinics")
      .select(
        "name, phone, address, city, state, hours, services, insurance_accepted, emergency_policy, timezone"
      )
      .eq("slug", params.clinicSlug)
      .single()

    if (error || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    return NextResponse.json(clinic)
  } catch {
    return NextResponse.json({ error: "Failed to fetch clinic" }, { status: 500 })
  }
}
