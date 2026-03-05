import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAvailableSlots } from "@/lib/google-calendar"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clinicId, preferredDate, durationMinutes, openTime, closeTime } = body

    if (!clinicId || !preferredDate) {
      return NextResponse.json(
        { error: "Missing clinicId or preferredDate" },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const date = new Date(preferredDate)
    const slots = await getAvailableSlots(
      clinicId,
      date,
      durationMinutes || 60,
      openTime || "09:00",
      closeTime || "17:00"
    )

    const formattedSlots = slots.slice(0, 6).map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      displayTime: slot.start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      displayDate: slot.start.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    }))

    return NextResponse.json({ slots: formattedSlots })
  } catch (error) {
    console.error("Availability error:", error)
    return NextResponse.json(
      { error: "Failed to get availability" },
      { status: 500 }
    )
  }
}
