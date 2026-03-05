import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userData?.clinic_id) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 })
    }

    const { data: clinic } = await supabase
      .from("clinics")
      .select("vapi_assistant_id")
      .eq("id", userData.clinic_id)
      .single()

    const phoneNumber = process.env.VAPI_PHONE_NUMBER || null
    const hasAssistant = !!clinic?.vapi_assistant_id

    return NextResponse.json({
      phoneNumber,
      active: !!phoneNumber && hasAssistant,
      hasAssistant,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 })
  }
}
