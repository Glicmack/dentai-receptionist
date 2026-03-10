import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userData?.clinic_id) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 })
    }

    const { data: members, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, created_at")
      .eq("clinic_id", userData.clinic_id)
      .order("created_at", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(members)
  } catch {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
  }
}
