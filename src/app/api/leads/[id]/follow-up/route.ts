import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendLeadFollowUp } from "@/lib/twilio"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's clinic
    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userData?.clinic_id) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 })
    }

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", params.id)
      .eq("clinic_id", userData.clinic_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Rate limit: max 3 follow-ups
    if (lead.follow_up_count >= 3) {
      return NextResponse.json(
        { error: "Maximum follow-ups reached for this lead" },
        { status: 429 }
      )
    }

    if (!lead.patient_phone) {
      return NextResponse.json(
        { error: "Lead has no phone number" },
        { status: 400 }
      )
    }

    // Get clinic info for the SMS
    const { data: clinic } = await supabase
      .from("clinics")
      .select("name, phone")
      .eq("id", userData.clinic_id)
      .single()

    // Send the follow-up SMS
    const sent = await sendLeadFollowUp(
      lead.patient_phone,
      lead.patient_name || "",
      clinic?.name || "our clinic",
      lead.interest || "dental services",
      clinic?.phone || ""
    )

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      )
    }

    // Update lead record
    await supabase
      .from("leads")
      .update({
        follow_up_count: lead.follow_up_count + 1,
        last_follow_up_at: new Date().toISOString(),
        status: "contacted",
      })
      .eq("id", params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Follow-up error:", error)
    return NextResponse.json(
      { error: "Failed to send follow-up" },
      { status: 500 }
    )
  }
}
