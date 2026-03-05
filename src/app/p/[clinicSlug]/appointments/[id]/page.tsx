"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PatientHeader } from "@/components/patient/PatientHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { PatientAppointment } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-yellow-100 text-yellow-700",
  no_show: "bg-gray-100 text-gray-700",
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clinicSlug = params.clinicSlug as string
  const appointmentId = params.id as string
  const [appointment, setAppointment] = useState<PatientAppointment | null>(null)
  const [clinicName, setClinicName] = useState("")
  const [clinicPhone, setClinicPhone] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, clinicRes] = await Promise.all([
          fetch(`/api/patient/${clinicSlug}/appointments`),
          fetch(`/api/patient/${clinicSlug}/clinic`),
        ])

        if (apptRes.status === 401) {
          router.push(`/p/${clinicSlug}`)
          return
        }

        const apptData = await apptRes.json()
        const clinicData = await clinicRes.json()

        const allAppts = [...(apptData.upcoming || []), ...(apptData.past || [])]
        const found = allAppts.find((a: PatientAppointment) => a.id === appointmentId)
        setAppointment(found || null)
        setClinicName(clinicData.name || "")
        setClinicPhone(clinicData.phone || "")
      } catch {
        router.push(`/p/${clinicSlug}`)
      }
      setLoading(false)
    }
    load()
  }, [clinicSlug, appointmentId, router])

  if (loading) {
    return (
      <div>
        <div className="h-14 border-b bg-white" />
        <div className="mx-auto max-w-2xl space-y-4 p-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div>
        <PatientHeader clinicName={clinicName} clinicSlug={clinicSlug} />
        <div className="mx-auto max-w-2xl p-4 pt-8 text-center">
          <p className="text-muted-foreground">Appointment not found</p>
          <Link href={`/p/${clinicSlug}/appointments`}>
            <Button variant="link" className="mt-2">Back to appointments</Button>
          </Link>
        </div>
      </div>
    )
  }

  const apptDate = new Date(appointment.appointment_datetime)
  const isFuture = apptDate > new Date()
  const isActive = appointment.status === "confirmed" || appointment.status === "rescheduled"

  return (
    <div>
      <PatientHeader clinicName={clinicName} clinicSlug={clinicSlug} />

      <main className="mx-auto max-w-2xl p-4 pt-6">
        <Link
          href={`/p/${clinicSlug}/appointments`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to appointments
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">{appointment.service_type}</CardTitle>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[appointment.status] || "bg-gray-100"}`}
              >
                {appointment.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {apptDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {apptDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{appointment.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked via</p>
                <p className="font-medium capitalize">{appointment.booked_via || "N/A"}</p>
              </div>
            </div>

            {appointment.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1 rounded-lg bg-muted/50 p-3 text-sm">{appointment.notes}</p>
              </div>
            )}

            {isFuture && isActive && clinicPhone && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Need to cancel or reschedule? Contact us at{" "}
                  <a href={`tel:${clinicPhone}`} className="font-medium underline">
                    {clinicPhone}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
