import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()
    if (!userData?.clinic_id) return NextResponse.json({ error: "No clinic" }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("leads")
      .select("*")
      .eq("clinic_id", userData.clinic_id)
      .order("created_at", { ascending: false })

    if (status && status !== "all") query = query.eq("status", status)

    const { data, error } = await query.limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()
    if (!userData?.clinic_id) return NextResponse.json({ error: "No clinic" }, { status: 404 })

    const body = await request.json()
    const { data, error } = await supabase
      .from("leads")
      .insert({ ...body, clinic_id: userData.clinic_id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: "Missing lead id" }, { status: 400 })

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}
