"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PatientHeader } from "@/components/patient/PatientHeader"
import { PatientNav } from "@/components/patient/PatientNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { PatientAppointment } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-yellow-100 text-yellow-700",
  no_show: "bg-gray-100 text-gray-700",
}

function formatDate(datetime: string) {
  const d = new Date(datetime)
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(datetime: string) {
  const d = new Date(datetime)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export default function PatientAppointmentsPage() {
  const params = useParams()
  const router = useRouter()
  const clinicSlug = params.clinicSlug as string
  const [upcoming, setUpcoming] = useState<PatientAppointment[]>([])
  const [past, setPast] = useState<PatientAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [clinicName, setClinicName] = useState("")
  const [patientName, setPatientName] = useState("")

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

        setUpcoming(apptData.upcoming || [])
        setPast(apptData.past || [])
        setClinicName(clinicData.name || "")

        // Get patient name from most recent appointment
        const allAppts = [...(apptData.upcoming || []), ...(apptData.past || [])]
        if (allAppts.length > 0 && allAppts[0].patient_name) {
          setPatientName(allAppts[0].patient_name)
        }
      } catch {
        router.push(`/p/${clinicSlug}`)
      }
      setLoading(false)
    }
    load()
  }, [clinicSlug, router])

  if (loading) {
    return (
      <div>
        <div className="h-14 border-b bg-white" />
        <div className="mx-auto max-w-2xl space-y-4 p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 sm:pb-4">
      <PatientHeader clinicName={clinicName} clinicSlug={clinicSlug} patientName={patientName} />
      <PatientNav clinicSlug={clinicSlug} />

      <main className="mx-auto max-w-2xl space-y-6 p-4 pt-6 sm:pt-4">
        {/* Upcoming */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <Link href={`/p/${clinicSlug}/book`}>
              <Button size="sm" className="shadow-sm">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Book New
              </Button>
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <svg className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p>No upcoming appointments</p>
                <Link href={`/p/${clinicSlug}/book`}>
                  <Button variant="link" className="mt-1">Book an appointment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} clinicSlug={clinicSlug} />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Past Appointments</h2>
            <div className="space-y-3">
              {past.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} clinicSlug={clinicSlug} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function AppointmentCard({
  appointment,
  clinicSlug,
}: {
  appointment: PatientAppointment
  clinicSlug: string
}) {
  return (
    <Link href={`/p/${clinicSlug}/appointments/${appointment.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <span className="text-xs font-medium leading-none">
              {new Date(appointment.appointment_datetime).toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className="text-lg font-bold leading-none">
              {new Date(appointment.appointment_datetime).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{appointment.service_type}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(appointment.appointment_datetime)} at {formatTime(appointment.appointment_datetime)}
            </p>
            {appointment.duration_minutes > 0 && (
              <p className="text-xs text-muted-foreground">{appointment.duration_minutes} min</p>
            )}
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[appointment.status] || "bg-gray-100 text-gray-700"}`}
          >
            {appointment.status}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
