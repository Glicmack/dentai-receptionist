import Anthropic from '@anthropic-ai/sdk';
import { Message } from './conversation-store';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are DentAI Receptionist — the AI assistant for ${process.env.PRACTICE_NAME}.

You are helpful, warm, professional, and knowledgeable about dentistry.

PRACTICE INFO:
- Name: ${process.env.PRACTICE_NAME}
- Phone: ${process.env.PRACTICE_PHONE}
- Address: ${process.env.PRACTICE_ADDRESS}
- Hours: ${process.env.PRACTICE_HOURS}

YOUR CAPABILITIES:
1. DENTAL Q&A — Answer questions about dental treatments, procedures, medicines, pain management, costs, and what to expect. Be informative but always recommend booking a consultation for specific diagnoses.

2. APPOINTMENT BOOKING — Help patients book appointments. Collect: name, preferred date, preferred time, treatment type needed. Confirm the booking by calling book_appointment tool.

3. PATIENT INTAKE — Collect new patient information: full name, date of birth, email, medical conditions, current medications, allergies, last dental visit, main dental concerns, GP name, emergency contact.

4. GENERAL SUPPORT — Answer questions about the practice, directions, parking, payment options, insurance.

RESPONSE STYLE:
- Keep messages SHORT and conversational (this is WhatsApp, not email)
- Use simple language, avoid jargon
- Use emojis sparingly and appropriately
- Never write walls of text — break into short messages if needed
- Always be warm and reassuring, especially about anxious patients

AVAILABLE APPOINTMENT SLOTS (simulate realistic availability):
- Monday-Friday: 9am, 10am, 11am, 2pm, 3pm, 4pm, 5pm
- Saturday: 9am, 10am, 11am, 12pm, 1pm

TREATMENTS & APPROXIMATE COSTS (GBP):
- Dental checkup & clean: £60-£80
- X-rays: £25-£50
- White filling: £120-£200
- Root canal: £400-£700
- Crown: £500-£900
- Teeth whitening: £350-£500
- Invisalign consultation: Free, treatment from £2,500
- Emergency appointment: £90
- Tooth extraction: £150-£300
- Implant consultation: Free, implant from £2,000

IMPORTANT:
- Never diagnose specific conditions — always recommend an in-person consultation
- If patient seems in severe pain or distress, provide emergency contact and advise urgent care
- Collect patient name early in the conversation
- After booking, always confirm: name, date, time, treatment, and give the practice address`;

// Tool definitions for Claude
const tools: Anthropic.Tool[] = [
  {
    name: 'book_appointment',
    description: 'Book a dental appointment for the patient after collecting all required details',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_name: { type: 'string', description: 'Full name of the patient' },
        appointment_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        appointment_time: { type: 'string', description: 'Time in HH:MM format (24hr)' },
        treatment_type: { type: 'string', description: 'Type of dental treatment needed' },
        notes: { type: 'string', description: 'Any additional notes from the patient' },
      },
      required: ['patient_name', 'appointment_date', 'appointment_time', 'treatment_type'],
    },
  },
  {
    name: 'save_intake_data',
    description: 'Save collected patient intake/registration information',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_name: { type: 'string' },
        date_of_birth: { type: 'string', description: 'YYYY-MM-DD format' },
        email: { type: 'string' },
        medical_conditions: { type: 'array', items: { type: 'string' } },
        current_medications: { type: 'array', items: { type: 'string' } },
        allergies: { type: 'array', items: { type: 'string' } },
        last_dental_visit: { type: 'string' },
        dental_concerns: { type: 'string' },
        gp_name: { type: 'string' },
        emergency_contact: { type: 'string' },
      },
      required: ['patient_name'],
    },
  },
];

export type AgentResult = {
  reply: string;
  toolCall?: {
    name: string;
    input: Record<string, unknown>;
  };
  patientName?: string;
};

export async function runDentalAgent(
  history: Message[],
  newMessage: string
): Promise<AgentResult> {
  // Add the new user message to history
  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: newMessage },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages,
  });

  let reply = '';
  let toolCall: AgentResult['toolCall'] | undefined;
  let patientName: string | undefined;

  for (const block of response.content) {
    if (block.type === 'text') {
      reply += block.text;
    } else if (block.type === 'tool_use') {
      toolCall = {
        name: block.name,
        input: block.input as Record<string, unknown>,
      };
      // Extract patient name if present in any tool call
      if (block.input && typeof block.input === 'object' && 'patient_name' in block.input) {
        patientName = (block.input as Record<string, string>).patient_name;
      }
    }
  }

  // If Claude only returned a tool call with no text, generate a confirmation message
  if (!reply && toolCall) {
    if (toolCall.name === 'book_appointment') {
      const { patient_name, appointment_date, appointment_time, treatment_type } = toolCall.input as Record<string, string>;
      reply = `Perfect! Your appointment is confirmed:\n\n*${patient_name}*\n${appointment_date}\n${appointment_time}\n${treatment_type}\n${process.env.PRACTICE_ADDRESS}\n\nWe'll send you a reminder 24 hours before. See you soon!`;
    } else if (toolCall.name === 'save_intake_data') {
      reply = `Thank you! Your registration information has been saved. We look forward to seeing you at ${process.env.PRACTICE_NAME}!`;
    }
  }

  return { reply, toolCall, patientName };
}
