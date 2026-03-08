import { NextResponse } from "next/server"
import { getPatientSession } from "@/lib/patient-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import { processChat } from "@/lib/ai/chat-handler"
import type { TranscriptMessage } from "@/types"

export async function POST(request: Request) {
  try {
    const session = await getPatientSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { clinicSlug, message, conversationId, conversationHistory } = body

    if (!clinicSlug || !message) {
      return NextResponse.json({ error: "Missing clinicSlug or message" }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Load clinic
    const { data: clinic } = await supabase
      .from("clinics")
      .select("*")
      .eq("slug", clinicSlug)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    // Ensure patient-clinic link exists
    await supabase
      .from("patient_clinic_links")
      .upsert({
        patient_id: session.patientId,
        clinic_id: clinic.id,
        last_contact_at: new Date().toISOString(),
      }, { onConflict: "patient_id,clinic_id" })

    // Check if conversation exists and if AI is paused
    let existingConversation = null
    if (conversationId) {
      const { data } = await supabase
        .from("conversations")
        .select("id, ai_paused, transcript")
        .eq("id", conversationId)
        .eq("patient_id", session.patientId)
        .single()
      existingConversation = data
    }

    // Save patient message to conversation_messages
    const saveMessage = async (convId: string, senderType: string, content: string, senderId?: string) => {
      await supabase.from("conversation_messages").insert({
        conversation_id: convId,
        clinic_id: clinic.id,
        sender_type: senderType,
        sender_id: senderId || null,
        content,
      })
    }

    // If AI is paused (doctor took over), just save the message
    if (existingConversation?.ai_paused) {
      await saveMessage(existingConversation.id, "patient", message, session.patientId)

      // Still update transcript for backward compat
      const updatedTranscript: TranscriptMessage[] = [
        ...(conversationHistory || []),
        { role: "user" as const, content: message, timestamp: new Date().toISOString() },
      ]
      await supabase
        .from("conversations")
        .update({ transcript: updatedTranscript })
        .eq("id", existingConversation.id)

      return NextResponse.json({
        message: null,
        intent: "general",
        aiPaused: true,
        conversationId: existingConversation.id,
      })
    }

    // Process with Claude AI
    const systemPrompt = buildSystemPrompt(clinic)
    const result = await processChat(systemPrompt, conversationHistory || [], message)

    const updatedTranscript: TranscriptMessage[] = [
      ...(conversationHistory || []),
      { role: "user" as const, content: message, timestamp: new Date().toISOString() },
      { role: "assistant" as const, content: result.message, timestamp: new Date().toISOString() },
    ]

    let convId = conversationId

    if (existingConversation) {
      await supabase
        .from("conversations")
        .update({
          transcript: updatedTranscript,
          patient_name: session.fullName,
          outcome: result.intent === "booking_flow" ? "booked" :
            result.intent === "lead_capture" ? "lead_captured" :
              result.intent === "escalate" ? "escalated" : null,
        })
        .eq("id", existingConversation.id)
      convId = existingConversation.id
    } else {
      convId = crypto.randomUUID()
      await supabase
        .from("conversations")
        .insert({
          id: convId,
          clinic_id: clinic.id,
          channel: "chat",
          transcript: updatedTranscript,
          patient_name: session.fullName,
          patient_email: session.email,
          patient_id: session.patientId,
          is_active: true,
        })
    }

    // Save individual messages
    await saveMessage(convId!, "patient", message, session.patientId)
    await saveMessage(convId!, "ai", result.message)

    return NextResponse.json({
      message: result.message,
      intent: result.intent,
      aiPaused: false,
      conversationId: convId,
    })
  } catch (error) {
    console.error("Patient chat error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
