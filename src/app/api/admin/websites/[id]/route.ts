import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isEmailAdmin } from "@/lib/admin-auth"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !(await isEmailAdmin(user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data: website, error } = await admin
      .from("doctor_websites")
      .select("*, clinics(name, slug, email, phone, services, hours, logo_url)")
      .eq("id", params.id)
      .single()

    if (error || !website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 })
    }

    return NextResponse.json({ website })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !(await isEmailAdmin(user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const admin = createAdminClient()

    const { data: website, error } = await admin
      .from("doctor_websites")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ website })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
