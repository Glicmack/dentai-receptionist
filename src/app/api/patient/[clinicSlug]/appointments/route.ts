import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPatientSession } from "@/lib/patient-auth"

export async function GET(
  _request: Request,
  { params }: { params: { clinicSlug: string } }
) {
  try {
    const session = await getPatientSession()
    if (!session || session.clinicSlug !== params.clinicSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Build query based on auth method (phone or email)
    let query = adminClient
      .from("appointments")
      .select(
        "id, patient_name, service_type, duration_minutes, appointment_datetime, status, booked_via, notes, created_at"
      )
      .eq("clinic_id", session.clinicId)

    if (session.phone) {
      query = query.eq("patient_phone", session.phone)
    } else if (session.email) {
      query = query.eq("patient_email", session.email)
    } else {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { data, error } = await query.order("appointment_datetime", { ascending: false })

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
