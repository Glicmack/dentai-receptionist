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
    const { data: clinic, error } = await admin
      .from("clinics")
      .select("*, users(email, full_name, role)")
      .eq("id", params.id)
      .single()

    if (error || !clinic) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ clinic })
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

    const { data: clinic, error } = await admin
      .from("clinics")
      .update(body)
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ clinic })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
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
    const { error } = await admin
      .from("clinics")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
