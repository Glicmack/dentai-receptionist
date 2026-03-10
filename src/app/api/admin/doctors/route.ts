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
    const { data: clinics, error } = await admin
      .from("clinics")
      .select("*, users(email, full_name, role)")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ clinics })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !(await isEmailAdmin(user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, slug, phone, specialty, description } = body

    if (!name || !email || !slug) {
      return NextResponse.json({ error: "Name, email, and slug are required" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Create clinic
    const { data: clinic, error } = await admin
      .from("clinics")
      .insert({
        name,
        email,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        phone: phone || null,
        specialty: specialty || null,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug or email already exists" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ clinic })
  } catch (error) {
    console.error("Create doctor error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
