import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isEmailAdmin } from "@/lib/admin-auth"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !(await isEmailAdmin(user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const admin = createAdminClient()

    const [clinics, conversations, appointments, leads, patients] = await Promise.all([
      admin.from("clinics").select("id", { count: "exact", head: true }),
      admin.from("conversations").select("id", { count: "exact", head: true }),
      admin.from("appointments").select("id", { count: "exact", head: true }),
      admin.from("leads").select("id", { count: "exact", head: true }),
      admin.from("patients").select("id", { count: "exact", head: true }),
    ])

    // Revenue estimate from appointments
    const { data: recentAppointments } = await admin
      .from("appointments")
      .select("id")
      .eq("status", "completed")

    return NextResponse.json({
      totalClinics: clinics.count || 0,
      totalConversations: conversations.count || 0,
      totalAppointments: appointments.count || 0,
      totalLeads: leads.count || 0,
      totalPatients: patients.count || 0,
      completedAppointments: recentAppointments?.length || 0,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
