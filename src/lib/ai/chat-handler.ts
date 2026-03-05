import Anthropic from "@anthropic-ai/sdk"
import type { TranscriptMessage } from "@/types"

let _anthropic: Anthropic | null = null

function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _anthropic
}

interface ChatResult {
  message: string
  intent: "booking_flow" | "question" | "lead_capture" | "escalate" | "general"
  rawResponse: string
}

export async function processChat(
  systemPrompt: string,
  conversationHistory: TranscriptMessage[],
  userMessage: string
): Promise<ChatResult> {
  const messages = conversationHistory.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }))

  // Add the new user message
  messages.push({ role: "user", content: userMessage })

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages,
  })

  const rawResponse =
    response.content[0].type === "text" ? response.content[0].text : ""

  // Parse intent from response markers
  let intent: ChatResult["intent"] = "general"
  let cleanMessage = rawResponse

  if (rawResponse.includes("[BOOKING_INTENT]")) {
    intent = "booking_flow"
    cleanMessage = rawResponse.replace("[BOOKING_INTENT]", "").trim()
  } else if (rawResponse.includes("[LEAD_CAPTURED]")) {
    intent = "lead_capture"
    cleanMessage = rawResponse.replace("[LEAD_CAPTURED]", "").trim()
  } else if (rawResponse.includes("[ESCALATE]")) {
    intent = "escalate"
    cleanMessage = rawResponse.replace("[ESCALATE]", "").trim()
  } else if (
    rawResponse.toLowerCase().includes("book") ||
    rawResponse.toLowerCase().includes("appointment") ||
    rawResponse.toLowerCase().includes("schedule")
  ) {
    intent = "booking_flow"
  } else if (rawResponse.includes("?") || rawResponse.toLowerCase().includes("yes") || rawResponse.toLowerCase().includes("no")) {
    intent = "question"
  }

  return {
    message: cleanMessage,
    intent,
    rawResponse,
  }
}
