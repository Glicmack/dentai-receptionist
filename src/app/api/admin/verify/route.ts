import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isEmailAdmin } from "@/lib/admin-auth"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await isEmailAdmin(user.email)
    if (!admin) {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 })
    }

    return NextResponse.json({ admin: true, email: user.email })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
