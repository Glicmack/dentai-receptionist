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
    const { data: patients, error } = await admin
      .from("patients")
      .select("id, email, phone, full_name, phone_verified, created_at")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return NextResponse.json({ patients })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
