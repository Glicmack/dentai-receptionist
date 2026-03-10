import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    // Verify doctor is authenticated
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get doctor's clinic
    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not linked to clinic" }, { status: 403 })
    }

    const body = await request.json()
    const { conversationId, message } = body

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Missing conversationId or message" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify conversation belongs to this clinic
    const { data: conversation } = await admin
      .from("conversations")
      .select("id, clinic_id, transcript")
      .eq("id", conversationId)
      .eq("clinic_id", userData.clinic_id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Save message to conversation_messages
    await admin.from("conversation_messages").insert({
      conversation_id: conversationId,
      clinic_id: userData.clinic_id,
      sender_type: "doctor",
      sender_id: user.id,
      content: message,
    })

    // Update transcript for backward compatibility
    const existingTranscript = (conversation.transcript as Array<{ role: string; content: string }>) || []
    const updatedTranscript = [
      ...existingTranscript,
      { role: "assistant", content: `[Doctor] ${message}`, timestamp: new Date().toISOString() },
    ]

    // Pause AI and update transcript
    await admin
      .from("conversations")
      .update({
        transcript: updatedTranscript,
        ai_paused: true,
        ai_paused_at: new Date().toISOString(),
        ai_paused_by: user.id,
      })
      .eq("id", conversationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Doctor reply error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// Pause/Resume AI for a conversation
export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not linked to clinic" }, { status: 403 })
    }

    const body = await request.json()
    const { conversationId, aiPaused } = body

    const admin = createAdminClient()

    const { error } = await admin
      .from("conversations")
      .update({
        ai_paused: aiPaused,
        ai_paused_at: aiPaused ? new Date().toISOString() : null,
        ai_paused_by: aiPaused ? user.id : null,
      })
      .eq("id", conversationId)
      .eq("clinic_id", userData.clinic_id)

    if (error) throw error

    return NextResponse.json({ success: true, aiPaused })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
