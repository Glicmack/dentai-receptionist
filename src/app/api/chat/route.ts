import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import { processChat } from "@/lib/ai/chat-handler"
import type { ChatRequest, TranscriptMessage } from "@/types"

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json()
    const { clinicSlug, message, sessionId, conversationHistory } = body

    if (!clinicSlug || !message) {
      return NextResponse.json(
        { error: "Missing clinicSlug or message" },
        { status: 400 }
      )
    }

    // Prevent abuse with message length limit
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long. Please keep messages under 2000 characters." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Load clinic data
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("slug", clinicSlug)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      )
    }

    // Check if conversation is paused (doctor took over)
    if (sessionId) {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("ai_paused")
        .eq("id", sessionId)
        .single()

      if (existingConv?.ai_paused) {
        // AI is paused - just save the patient message, don't generate AI response
        const pausedTranscript: TranscriptMessage[] = [
          ...(conversationHistory || []),
          { role: "user", content: message, timestamp: new Date().toISOString() },
        ]
        await supabase
          .from("conversations")
          .update({ transcript: pausedTranscript })
          .eq("id", sessionId)

        // Save to conversation_messages table
        await supabase.from("conversation_messages").insert({
          conversation_id: sessionId,
          clinic_id: clinic.id,
          sender_type: "patient",
          content: message,
        })

        return NextResponse.json({
          message: null,
          intent: "general",
          appointmentBooked: false,
          appointment: null,
          aiPaused: true,
        })
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(clinic)

    // Process with Claude
    const result = await processChat(
      systemPrompt,
      conversationHistory || [],
      message
    )

    // Save/update conversation in Supabase
    const updatedTranscript: TranscriptMessage[] = [
      ...(conversationHistory || []),
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: result.message, timestamp: new Date().toISOString() },
    ]

    if (sessionId) {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", sessionId)
        .single()

      if (existing) {
        // Update existing conversation
        await supabase
          .from("conversations")
          .update({
            transcript: updatedTranscript,
            patient_name: extractPatientName(updatedTranscript),
            outcome: result.intent === "booking_flow" ? "booked" :
              result.intent === "lead_capture" ? "lead_captured" :
                result.intent === "escalate" ? "escalated" : null,
          })
          .eq("id", sessionId)
      } else {
        // Create new conversation
        await supabase
          .from("conversations")
          .insert({
            id: sessionId,
            clinic_id: clinic.id,
            channel: "chat",
            transcript: updatedTranscript,
            patient_name: extractPatientName(updatedTranscript),
          })
      }
    }

    return NextResponse.json({
      message: result.message,
      intent: result.intent,
      appointmentBooked: false,
      appointment: null,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message. Please try again." },
      { status: 500 }
    )
  }
}

// Simple extraction of patient name from conversation
function extractPatientName(transcript: TranscriptMessage[]): string | null {
  // Look for patterns like "My name is X" or "I'm X" in user messages
  for (const msg of transcript) {
    if (msg.role !== "user") continue

    const namePatterns = [
      /my name is (\w+(?:\s\w+)?)/i,
      /i'?m (\w+(?:\s\w+)?)/i,
      /this is (\w+(?:\s\w+)?)/i,
      /name'?s (\w+(?:\s\w+)?)/i,
    ]

    for (const pattern of namePatterns) {
      const match = msg.content.match(pattern)
      if (match) return match[1]
    }
  }
  return null
}
