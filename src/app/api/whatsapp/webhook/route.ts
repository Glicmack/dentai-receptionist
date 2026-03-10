import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import { processChat } from "@/lib/ai/chat-handler"
import { sendWhatsApp, validateTwilioSignature } from "@/lib/twilio"
import type { TranscriptMessage } from "@/types"

// Twilio sends form-urlencoded POST requests
export async function POST(request: Request) {
  try {
    // 1. Parse Twilio's form-urlencoded body
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    // 2. Validate Twilio signature in production
    const signature = request.headers.get("x-twilio-signature") || ""
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`
    if (
      process.env.NODE_ENV === "production" &&
      !validateTwilioSignature(webhookUrl, body, signature)
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 3. Extract message details
    const senderPhone = (body.From || "").replace("whatsapp:", "")
    const recipientPhone = (body.To || "").replace("whatsapp:", "")
    const incomingMessage = (body.Body || "").trim()
    const senderName = body.ProfileName || null

    if (!incomingMessage) {
      // No text (could be media-only) — acknowledge without reply
      return twimlResponse("")
    }

    const supabase = createAdminClient()

    // 4. Find clinic by WhatsApp phone number
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("whatsapp_phone_number", recipientPhone)
      .eq("whatsapp_enabled", true)
      .single()

    if (clinicError || !clinic) {
      console.error("No clinic found for WhatsApp number:", recipientPhone)
      return twimlResponse("")
    }

    // 5. Find or create WhatsApp session
    const session = await getOrCreateSession(
      supabase,
      clinic.id,
      senderPhone,
      senderName
    )

    // 6. Load conversation history
    let conversationHistory: TranscriptMessage[] = []
    if (session.conversation_id) {
      const { data: convo } = await supabase
        .from("conversations")
        .select("transcript")
        .eq("id", session.conversation_id)
        .single()
      if (convo?.transcript) {
        conversationHistory = convo.transcript as TranscriptMessage[]
      }
    }

    // 7. Check if AI is paused (doctor has taken over)
    if (session.conversation_id) {
      const { data: convoStatus } = await supabase
        .from("conversations")
        .select("ai_paused")
        .eq("id", session.conversation_id)
        .single()

      if (convoStatus?.ai_paused) {
        // Save patient message but don't generate AI response
        const updatedTranscript: TranscriptMessage[] = [
          ...conversationHistory,
          { role: "user", content: incomingMessage, timestamp: new Date().toISOString() },
        ]
        await supabase
          .from("conversations")
          .update({
            transcript: updatedTranscript,
            patient_name: senderName || session.patient_name,
          })
          .eq("id", session.conversation_id)

        // Also save to conversation_messages for live chat
        await supabase.from("conversation_messages").insert({
          conversation_id: session.conversation_id,
          clinic_id: clinic.id,
          sender_type: "patient",
          content: incomingMessage,
        })

        // Update session timestamp
        await supabase
          .from("whatsapp_sessions")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", session.id)

        return twimlResponse("")
      }
    }

    // 8. Check for special commands
    const specialResponse = await handleSpecialCommands(
      supabase,
      incomingMessage,
      senderPhone,
      clinic
    )
    if (specialResponse) {
      // Save the special command interaction to transcript
      await appendToTranscript(
        supabase,
        session,
        clinic.id,
        conversationHistory,
        incomingMessage,
        specialResponse,
        senderName,
        senderPhone
      )
      await sendWhatsApp(senderPhone, specialResponse)
      return twimlResponse("")
    }

    // 9. Process through Claude AI (same pipeline as web chat)
    const systemPrompt = buildSystemPrompt(clinic)
    const result = await processChat(
      systemPrompt,
      conversationHistory,
      incomingMessage
    )

    // 10. Save conversation
    const updatedSession = await appendToTranscript(
      supabase,
      session,
      clinic.id,
      conversationHistory,
      incomingMessage,
      result.message,
      senderName,
      senderPhone,
      result.intent
    )

    // 11. Handle intent-based side effects
    if (result.intent === "lead_capture") {
      await supabase.from("leads").insert({
        clinic_id: clinic.id,
        patient_name:
          senderName || extractPatientName([...conversationHistory]),
        patient_phone: senderPhone,
        source: "whatsapp",
        interest: "WhatsApp inquiry",
        status: "new",
        conversation_id: updatedSession.conversation_id,
      })
    }

    // 12. Send AI response via WhatsApp
    await sendWhatsApp(senderPhone, result.message)

    // 13. Return empty TwiML (reply already sent via REST)
    return twimlResponse("")
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return twimlResponse("")
  }
}

// --- Helper Functions ---

function twimlResponse(message: string): NextResponse {
  const twiml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`
  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateSession(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  phone: string,
  profileName: string | null
) {
  // Check for existing active session
  const { data: existing } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("clinic_id", clinicId)
    .eq("phone_number", phone)
    .eq("is_active", true)
    .single()

  if (existing) {
    // If session is >24h stale, mark inactive and create a new one
    const lastMsg = new Date(existing.last_message_at)
    const hoursSince = (Date.now() - lastMsg.getTime()) / (1000 * 60 * 60)
    if (hoursSince > 24) {
      await supabase
        .from("whatsapp_sessions")
        .update({ is_active: false })
        .eq("id", existing.id)
    } else {
      return existing
    }
  }

  // Create new session
  const { data: newSession } = await supabase
    .from("whatsapp_sessions")
    .upsert(
      {
        clinic_id: clinicId,
        phone_number: phone,
        patient_name: profileName,
        is_active: true,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: "clinic_id,phone_number" }
    )
    .select("*")
    .single()

  return newSession!
}

async function appendToTranscript(
  supabase: ReturnType<typeof createAdminClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any,
  clinicId: string,
  history: TranscriptMessage[],
  userMessage: string,
  aiMessage: string,
  senderName: string | null,
  senderPhone: string,
  intent?: string
) {
  const updatedTranscript: TranscriptMessage[] = [
    ...history,
    { role: "user", content: userMessage, timestamp: new Date().toISOString() },
    {
      role: "assistant",
      content: aiMessage,
      timestamp: new Date().toISOString(),
    },
  ]

  const patientName =
    senderName || extractPatientName(updatedTranscript)

  const outcome = intent
    ? intent === "booking_flow"
      ? "booked"
      : intent === "lead_capture"
        ? "lead_captured"
        : intent === "escalate"
          ? "escalated"
          : null
    : null

  if (session.conversation_id) {
    // Update existing conversation
    await supabase
      .from("conversations")
      .update({
        transcript: updatedTranscript,
        patient_name: patientName,
        patient_phone: senderPhone,
        ...(outcome ? { outcome } : {}),
      })
      .eq("id", session.conversation_id)
  } else {
    // Create new conversation
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({
        clinic_id: clinicId,
        channel: "whatsapp",
        transcript: updatedTranscript,
        patient_name: patientName,
        patient_phone: senderPhone,
        ...(outcome ? { outcome } : {}),
      })
      .select("id")
      .single()

    if (newConvo) {
      await supabase
        .from("whatsapp_sessions")
        .update({ conversation_id: newConvo.id })
        .eq("id", session.id)
      session.conversation_id = newConvo.id
    }
  }

  // Update session timestamp
  await supabase
    .from("whatsapp_sessions")
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      patient_name: patientName || session.patient_name,
    })
    .eq("id", session.id)

  return session
}

async function handleSpecialCommands(
  supabase: ReturnType<typeof createAdminClient>,
  message: string,
  phone: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clinic: any
): Promise<string | null> {
  const upper = message.toUpperCase().trim()

  if (upper === "CANCEL") {
    const { data: appt } = await supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", clinic.id)
      .eq("patient_phone", phone)
      .eq("status", "confirmed")
      .gte("appointment_datetime", new Date().toISOString())
      .order("appointment_datetime", { ascending: true })
      .limit(1)
      .single()

    if (appt) {
      await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appt.id)
      return `Your appointment on ${new Date(appt.appointment_datetime).toLocaleDateString()} has been cancelled. Reply anytime to book a new one!`
    }
    return `We couldn't find an upcoming appointment for this number. Reply with your details and we'll help you out.`
  }

  if (upper === "RESCHEDULE") {
    return `Sure! What day and time would work better for you? Our team will find the best available slot.`
  }

  return null // Not a special command — proceed to AI
}

function extractPatientName(
  transcript: TranscriptMessage[]
): string | null {
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
