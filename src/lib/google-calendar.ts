import { google } from "googleapis"
import { createAdminClient } from "@/lib/supabase/admin"
import type { GoogleCalendarToken } from "@/types"

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

async function getAuthenticatedClient(clinicId: string) {
  const supabase = createAdminClient()

  const { data: clinic } = await supabase
    .from("clinics")
    .select("google_calendar_token")
    .eq("id", clinicId)
    .single()

  if (!clinic?.google_calendar_token) {
    throw new Error("Google Calendar not connected")
  }

  const token = clinic.google_calendar_token as GoogleCalendarToken
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: token.expiry_date,
    token_type: token.token_type,
  })

  // Auto-refresh if expired
  if (token.expiry_date && Date.now() >= token.expiry_date) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    // Save new tokens
    await supabase
      .from("clinics")
      .update({
        google_calendar_token: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || token.refresh_token,
          expiry_date: credentials.expiry_date,
          token_type: credentials.token_type || "Bearer",
          scope: token.scope,
        },
      })
      .eq("id", clinicId)
  }

  return google.calendar({ version: "v3", auth: oauth2Client })
}

export async function getAvailableSlots(
  clinicId: string,
  preferredDate: Date,
  durationMinutes: number = 60,
  clinicHoursOpen: string = "09:00",
  clinicHoursClose: string = "17:00"
): Promise<{ start: Date; end: Date }[]> {
  const calendar = await getAuthenticatedClient(clinicId)

  // Get events for the day
  const dayStart = new Date(preferredDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(preferredDate)
  dayEnd.setHours(23, 59, 59, 999)

  const events = await calendar.events.list({
    calendarId: "primary",
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  })

  // Parse clinic hours
  const [openH, openM] = clinicHoursOpen.split(":").map(Number)
  const [closeH, closeM] = clinicHoursClose.split(":").map(Number)

  const workStart = new Date(preferredDate)
  workStart.setHours(openH, openM, 0, 0)
  const workEnd = new Date(preferredDate)
  workEnd.setHours(closeH, closeM, 0, 0)

  // Build busy times
  const busyTimes = (events.data.items || [])
    .filter((event) => event.start?.dateTime && event.end?.dateTime)
    .map((event) => ({
      start: new Date(event.start!.dateTime!),
      end: new Date(event.end!.dateTime!),
    }))

  // Find free slots
  const slots: { start: Date; end: Date }[] = []
  let current = new Date(workStart)

  // Don't show past slots
  const now = new Date()
  if (current < now) {
    // Round up to next 30 min slot
    current = new Date(now)
    current.setMinutes(Math.ceil(current.getMinutes() / 30) * 30, 0, 0)
  }

  while (current.getTime() + durationMinutes * 60000 <= workEnd.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000)

    // Check if slot conflicts with any busy time
    const hasConflict = busyTimes.some(
      (busy) => current < busy.end && slotEnd > busy.start
    )

    if (!hasConflict) {
      slots.push({ start: new Date(current), end: new Date(slotEnd) })
    }

    // Move to next 30-min increment
    current = new Date(current.getTime() + 30 * 60000)
  }

  return slots
}

export async function createCalendarEvent(
  clinicId: string,
  summary: string,
  description: string,
  startTime: Date,
  endTime: Date
): Promise<string | null> {
  const calendar = await getAuthenticatedClient(clinicId)

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
        ],
      },
    },
  })

  return event.data.id || null
}
