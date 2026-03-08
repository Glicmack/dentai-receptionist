import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: doctors, error } = await supabase
      .from("clinics")
      .select("id, name, slug, specialty, rating, city, state, logo_url, description, services")
      .eq("is_listed", true)
      .order("rating", { ascending: false })

    if (error) throw error

    return NextResponse.json({ doctors })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
