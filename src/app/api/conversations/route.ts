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
    const channel = searchParams.get("channel")
    const search = searchParams.get("search")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = supabase
      .from("conversations")
      .select("*")
      .eq("clinic_id", userData.clinic_id)
      .order("created_at", { ascending: false })

    if (channel && channel !== "all") query = query.eq("channel", channel)
    if (from) query = query.gte("created_at", from)
    if (to) query = query.lte("created_at", to)
    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,patient_phone.ilike.%${search}%`)
    }

    const { data, error } = await query.limit(50)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
