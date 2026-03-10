import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPatientSession } from "@/lib/patient-auth"

export async function GET(
  _request: Request,
  { params }: { params: { clinicSlug: string } }
) {
  try {
    const session = await getPatientSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Get clinic by slug
    const { data: clinic } = await adminClient
      .from("clinics")
      .select("id")
      .eq("slug", params.clinicSlug)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    const { data, error } = await adminClient
      .from("appointments")
      .select(
        "id, patient_name, service_type, duration_minutes, appointment_datetime, status, booked_via, notes, created_at"
      )
      .eq("clinic_id", clinic.id)
      .eq("patient_email", session.email)
      .order("appointment_datetime", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Split into upcoming and past
    const now = new Date().toISOString()
    const upcoming = (data || [])
      .filter(
        (a) =>
          a.appointment_datetime >= now &&
          (a.status === "confirmed" || a.status === "rescheduled")
      )
      .reverse() // ascending for upcoming
    const past = (data || []).filter(
      (a) =>
        a.appointment_datetime < now ||
        a.status === "completed" ||
        a.status === "cancelled" ||
        a.status === "no_show"
    )

    return NextResponse.json({ upcoming, past })
  } catch {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}
