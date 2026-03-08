import { NextResponse } from "next/server"
import { getPatientSession } from "@/lib/patient-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const session = await getPatientSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clinicSlug = searchParams.get("clinic")

    const supabase = createAdminClient()

    let query = supabase
      .from("conversations")
      .select("id, clinic_id, channel, patient_name, transcript, outcome, created_at, ai_paused, is_active, clinics(name, slug)")
      .eq("patient_id", session.patientId)
      .order("created_at", { ascending: false })

    if (clinicSlug) {
      // Filter by clinic slug via a subquery
      const { data: clinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("slug", clinicSlug)
        .single()

      if (clinic) {
        query = query.eq("clinic_id", clinic.id)
      }
    }

    const { data: conversations, error } = await query.limit(50)
    if (error) throw error

    return NextResponse.json({ conversations })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
