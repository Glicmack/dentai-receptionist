import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isEmailAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !(await isEmailAdmin(user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clinicId = searchParams.get("clinic_id")

    const admin = createAdminClient()
    let query = admin
      .from("leads")
      .select("*, clinics(name, slug)")
      .order("created_at", { ascending: false })
      .limit(100)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (clinicId) {
      query = query.eq("clinic_id", clinicId)
    }

    const { data: leads, error } = await query
    if (error) throw error

    return NextResponse.json({ leads })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
