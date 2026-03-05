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
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", userData.clinic_id)
      .order("appointment_datetime", { ascending: true })

    if (status && status !== "all") query = query.eq("status", status)
    if (from) query = query.gte("appointment_datetime", from)
    if (to) query = query.lte("appointment_datetime", to)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
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
      .from("appointments")
      .insert({ ...body, clinic_id: userData.clinic_id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: "Missing appointment id" }, { status: 400 })

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}
