import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createCalendarEvent, getAvailableSlots } from "@/lib/google-calendar"
import { sendBookingConfirmation } from "@/lib/twilio"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: "No message" }, { status: 400 })
    }

    const supabase = createAdminClient()

    switch (message.type) {
      case "call-started": {
        // Log the start of a call
        console.log("Vapi call started:", message.call?.id)
        break
      }

      case "end-of-call-report": {
        // Call ended - save full transcript
        const call = message.call
        const assistantId = call?.assistantId

        if (!assistantId) break

        // Find the clinic by Vapi assistant ID
        const { data: clinic } = await supabase
          .from("clinics")
          .select("id, name")
          .eq("vapi_assistant_id", assistantId)
          .single()

        if (!clinic) break

        // Build transcript from messages
        const transcript = (message.transcript || []).map((msg: { role: string; content: string }) => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.content,
        }))

        // Determine outcome
        let outcome = "answered_only"
        if (message.summary?.includes("booked") || message.summary?.includes("appointment")) {
          outcome = "booked"
        } else if (message.summary?.includes("transfer") || message.summary?.includes("escalat")) {
          outcome = "escalated"
        }

        // Create conversation record
        await supabase.from("conversations").insert({
          clinic_id: clinic.id,
          channel: "voice",
          transcript,
          outcome,
          duration_seconds: Math.round((call.endedAt - call.startedAt) / 1000) || null,
          vapi_call_id: call.id,
          summary: message.summary || null,
          patient_name: message.analysis?.patientName || null,
          patient_phone: call.customer?.number || null,
        })

        // Create lead if no booking
        if (outcome !== "booked" && call.customer?.number) {
          await supabase.from("leads").insert({
            clinic_id: clinic.id,
            patient_name: message.analysis?.patientName || null,
            patient_phone: call.customer.number,
            source: "voice_no_book",
            interest: message.analysis?.intent || "General inquiry",
            status: "new",
          })
        }
        break
      }

      case "function-call": {
        const functionCall = message.functionCall
        if (!functionCall) break

        const params = functionCall.parameters || {}
        const assistantId = message.call?.assistantId

        // Find clinic
        const { data: clinic } = await supabase
          .from("clinics")
          .select("*")
          .eq("vapi_assistant_id", assistantId)
          .single()

        if (!clinic) {
          return NextResponse.json({ result: "Clinic not found" })
        }

        switch (functionCall.name) {
          case "checkAvailability": {
            try {
              const preferredDate = new Date()
              // Simple day mapping
              const dayMap: Record<string, number> = {
                monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
                friday: 5, saturday: 6, sunday: 0,
              }
              const targetDay = dayMap[params.preferredDay?.toLowerCase()]
              if (targetDay !== undefined) {
                const today = preferredDate.getDay()
                const diff = (targetDay - today + 7) % 7 || 7
                preferredDate.setDate(preferredDate.getDate() + diff)
              }

              const dayName = params.preferredDay?.toLowerCase() || "monday"
              const dayHours = clinic.hours[dayName as keyof typeof clinic.hours]
              const slots = await getAvailableSlots(
                clinic.id,
                preferredDate,
                60,
                dayHours?.open || "09:00",
                dayHours?.close || "17:00"
              )

              const formatted = slots.slice(0, 3).map((s) =>
                s.start.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              )

              return NextResponse.json({
                result: formatted.length > 0
                  ? `Available slots: ${formatted.join(", ")}`
                  : "No available slots for that day. Would you like to try another day?",
              })
            } catch {
              return NextResponse.json({
                result: "I can check availability for you. What day and time works best?",
              })
            }
          }

          case "bookAppointment": {
            try {
              const appointmentTime = new Date(params.appointmentDatetime)
              const endTime = new Date(appointmentTime.getTime() + 60 * 60000)

              // Create Google Calendar event
              let eventId = null
              if (clinic.google_calendar_connected) {
                eventId = await createCalendarEvent(
                  clinic.id,
                  `${params.serviceType} - ${params.patientName}`,
                  `Patient: ${params.patientName}\nPhone: ${params.patientPhone}\nType: ${params.patientType || "new"}\nNotes: ${params.notes || ""}`,
                  appointmentTime,
                  endTime
                )
              }

              // Save appointment to Supabase
              await supabase.from("appointments").insert({
                clinic_id: clinic.id,
                patient_name: params.patientName,
                patient_phone: params.patientPhone,
                patient_email: params.patientEmail || null,
                patient_type: params.patientType || "new",
                service_type: params.serviceType,
                appointment_datetime: appointmentTime.toISOString(),
                google_calendar_event_id: eventId,
                booked_via: "voice",
              })

              // Send SMS confirmation
              if (params.patientPhone) {
                await sendBookingConfirmation(
                  params.patientPhone,
                  clinic.name,
                  appointmentTime.toLocaleDateString(),
                  appointmentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  params.serviceType
                )
              }

              return NextResponse.json({
                result: `Appointment booked for ${params.patientName} on ${appointmentTime.toLocaleDateString()} at ${appointmentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. A confirmation text has been sent.`,
              })
            } catch (err) {
              console.error("Booking error:", err)
              return NextResponse.json({
                result: "I apologize, I had trouble booking that appointment. Let me take your information and have someone call you back to confirm.",
              })
            }
          }

          case "captureLeadInfo": {
            await supabase.from("leads").insert({
              clinic_id: clinic.id,
              patient_name: params.patientName,
              patient_phone: params.patientPhone,
              interest: params.interest || null,
              source: "voice_no_book",
              notes: params.notes || null,
              status: "new",
            })

            return NextResponse.json({
              result: `Got it! I've saved ${params.patientName}'s information. Someone from our team will reach out shortly.`,
            })
          }

          case "transferToHuman": {
            return NextResponse.json({
              result: `I'll transfer you now. The reason noted is: ${params.reason || "Patient requested"}. Please hold.`,
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Vapi webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
