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
    const { data: websites, error } = await admin
      .from("doctor_websites")
      .select("*, clinics(name, slug, email)")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ websites })
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
    const { clinic_id, slug, template, hero_title, hero_subtitle, about_text } = body

    if (!clinic_id || !slug) {
      return NextResponse.json({ error: "clinic_id and slug are required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: website, error } = await admin
      .from("doctor_websites")
      .insert({
        clinic_id,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        template: template || "modern",
        hero_title,
        hero_subtitle,
        about_text,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ website })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
