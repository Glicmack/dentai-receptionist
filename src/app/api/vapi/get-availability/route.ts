import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAvailableSlots } from "@/lib/google-calendar"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clinicId, preferredDay, preferredTime } = body

    if (!clinicId) {
      return NextResponse.json({ error: "Missing clinicId" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: clinic } = await supabase
      .from("clinics")
      .select("hours, google_calendar_connected")
      .eq("id", clinicId)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    if (!clinic.google_calendar_connected) {
      return NextResponse.json({
        slots: [],
        message: "Calendar not connected. Please ask the patient for their preferred time and we'll confirm manually.",
      })
    }

    // Calculate target date
    const targetDate = new Date()
    const dayMap: Record<string, number> = {
      monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
      friday: 5, saturday: 6, sunday: 0,
      today: -1, tomorrow: -2,
    }

    const dayKey = preferredDay?.toLowerCase() || "today"
    if (dayKey === "today") {
      // Keep targetDate as today
    } else if (dayKey === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1)
    } else if (dayMap[dayKey] !== undefined) {
      const today = targetDate.getDay()
      const diff = (dayMap[dayKey] - today + 7) % 7 || 7
      targetDate.setDate(targetDate.getDate() + diff)
    }

    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const hours = clinic.hours[dayName as keyof typeof clinic.hours]

    if (!hours || hours.closed) {
      return NextResponse.json({
        slots: [],
        message: `We're closed on ${dayName}s. Would you like to try another day?`,
      })
    }

    const slots = await getAvailableSlots(
      clinicId,
      targetDate,
      60,
      hours.open || "09:00",
      hours.close || "17:00"
    )

    // Filter by preferred time
    let filtered = slots
    if (preferredTime === "morning") {
      filtered = slots.filter((s) => s.start.getHours() < 12)
    } else if (preferredTime === "afternoon") {
      filtered = slots.filter((s) => s.start.getHours() >= 12 && s.start.getHours() < 17)
    } else if (preferredTime === "evening") {
      filtered = slots.filter((s) => s.start.getHours() >= 17)
    }

    const result = (filtered.length > 0 ? filtered : slots).slice(0, 3).map((s) => ({
      datetime: s.start.toISOString(),
      displayTime: s.start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      displayDate: s.start.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    }))

    return NextResponse.json({ slots: result })
  } catch (error) {
    console.error("Get availability error:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
