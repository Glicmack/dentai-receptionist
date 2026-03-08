import { NextResponse } from "next/server"
import { getPatientSession } from "@/lib/patient-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const session = await getPatientSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: links, error } = await supabase
      .from("patient_clinic_links")
      .select("clinic_id, first_contact_at, last_contact_at, clinics(id, name, slug, specialty, logo_url, rating)")
      .eq("patient_id", session.patientId)
      .eq("is_blocked", false)
      .order("last_contact_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ doctors: links })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
