import twilio from "twilio"

const WHATSAPP_PREFIX = "whatsapp:"

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

function getWhatsAppFromNumber(): string {
  const num = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER
  return `${WHATSAPP_PREFIX}${num}`
}

function formatWhatsAppTo(phone: string): string {
  const cleaned = phone.replace(/^whatsapp:/, "")
  return `${WHATSAPP_PREFIX}${cleaned}`
}

export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    const client = getClient()
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    return true
  } catch (error) {
    console.error("Twilio SMS error:", error)
    return false
  }
}

export async function sendBookingConfirmation(
  patientPhone: string,
  clinicName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceName: string
): Promise<boolean> {
  const message = `Your appointment at ${clinicName} is confirmed!\n\nService: ${serviceName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\n\nReply CANCEL to cancel. If you need to reschedule, please call us directly.`
  return sendSMS(patientPhone, message)
}

export async function sendReminder24h(
  patientPhone: string,
  clinicName: string,
  appointmentTime: string
): Promise<boolean> {
  const message = `Reminder: You have an appointment at ${clinicName} tomorrow at ${appointmentTime}. We look forward to seeing you!`
  return sendSMS(patientPhone, message)
}

export async function sendReminder2h(
  patientPhone: string,
  clinicName: string,
  appointmentTime: string
): Promise<boolean> {
  const message = `Your appointment at ${clinicName} is in 2 hours (${appointmentTime}). See you soon!`
  return sendSMS(patientPhone, message)
}

export async function sendLeadFollowUp(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  interest: string,
  clinicPhone: string
): Promise<boolean> {
  const name = patientName ? `Hi ${patientName}, ` : "Hi, "
  const message = `${name}we noticed you were interested in ${interest || "our dental services"} at ${clinicName}. Would you like to schedule an appointment? Reply YES or call us at ${clinicPhone}.`
  return sendSMS(patientPhone, message)
}

// =============================================
// WhatsApp Functions
// =============================================

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  try {
    const client = getClient()
    await client.messages.create({
      body,
      from: getWhatsAppFromNumber(),
      to: formatWhatsAppTo(to),
    })
    return true
  } catch (error) {
    console.error("Twilio WhatsApp error:", error)
    return false
  }
}

export async function sendWhatsAppBookingConfirmation(
  patientPhone: string,
  clinicName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceName: string
): Promise<boolean> {
  const message =
    `Your appointment at ${clinicName} is confirmed!\n\n` +
    `Service: ${serviceName}\n` +
    `Date: ${appointmentDate}\n` +
    `Time: ${appointmentTime}\n\n` +
    `Reply CANCEL to cancel or RESCHEDULE to change your time.`
  return sendWhatsApp(patientPhone, message)
}

export async function sendWhatsAppReminder24h(
  patientPhone: string,
  clinicName: string,
  appointmentTime: string,
  rescheduleUrl?: string
): Promise<boolean> {
  let message =
    `Reminder: You have an appointment at ${clinicName} tomorrow at ${appointmentTime}. ` +
    `We look forward to seeing you!`
  if (rescheduleUrl) {
    message += `\n\nNeed to reschedule? Click here: ${rescheduleUrl}`
  }
  return sendWhatsApp(patientPhone, message)
}

export async function sendWhatsAppReminder2h(
  patientPhone: string,
  clinicName: string,
  appointmentTime: string
): Promise<boolean> {
  const message = `Your appointment at ${clinicName} is in 2 hours (${appointmentTime}). See you soon!`
  return sendWhatsApp(patientPhone, message)
}

export async function sendWhatsAppReviewRequest(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  reviewUrl: string
): Promise<boolean> {
  const name = patientName ? `Hi ${patientName}` : "Hi"
  const message =
    `${name}, thank you for visiting ${clinicName} today! ` +
    `We hope you had a great experience.\n\n` +
    `Would you mind leaving us a quick review? It helps other patients find us.\n` +
    `${reviewUrl}\n\nThank you!`
  return sendWhatsApp(patientPhone, message)
}

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  try {
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      params
    )
  } catch {
    return false
  }
}
