import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import type { Clinic } from "@/types"

export function buildVapiAssistantConfig(clinic: Clinic) {
  return {
    name: `${clinic.name} AI Receptionist`,
    voice: {
      provider: "11labs",
      voiceId: "rachel",
    },
    model: {
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(clinic),
        },
      ],
      functions: [
        {
          name: "checkAvailability",
          description: "Check available appointment slots",
          parameters: {
            type: "object",
            properties: {
              preferredDay: { type: "string" },
              preferredTime: {
                type: "string",
                enum: ["morning", "afternoon", "evening", "any"],
              },
              serviceType: { type: "string" },
            },
          },
        },
        {
          name: "bookAppointment",
          description: "Book an appointment for the patient",
          parameters: {
            type: "object",
            required: [
              "patientName",
              "patientPhone",
              "serviceType",
              "appointmentDatetime",
            ],
            properties: {
              patientName: { type: "string" },
              patientPhone: { type: "string" },
              patientEmail: { type: "string" },
              serviceType: { type: "string" },
              appointmentDatetime: {
                type: "string",
                description: "ISO 8601 datetime",
              },
              patientType: {
                type: "string",
                enum: ["new", "existing"],
              },
              notes: { type: "string" },
            },
          },
        },
        {
          name: "captureLeadInfo",
          description:
            "Save contact details when patient cannot book right now",
          parameters: {
            type: "object",
            required: ["patientName", "patientPhone"],
            properties: {
              patientName: { type: "string" },
              patientPhone: { type: "string" },
              interest: { type: "string" },
              notes: { type: "string" },
            },
          },
        },
        {
          name: "transferToHuman",
          description: "Transfer call to human receptionist",
          parameters: {
            type: "object",
            properties: {
              reason: { type: "string" },
            },
          },
        },
      ],
    },
    firstMessage: clinic.ai_greeting,
    endCallFunctionEnabled: true,
    recordingEnabled: true,
    hipaaEnabled: false,
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
  }
}
