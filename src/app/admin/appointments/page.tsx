"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface AppointmentRow {
  id: string
  patient_name: string
  service_type: string
  appointment_datetime: string
  status: string
  booked_via: string | null
  clinics: { name: string }
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const verifyRes = await fetch("/api/admin/verify")
      if (!verifyRes.ok) return

      const supabase = createClient()
      const { data } = await supabase
        .from("appointments")
        .select("id, patient_name, service_type, appointment_datetime, status, booked_via, clinics(name)")
        .order("appointment_datetime", { ascending: false })
        .limit(100)

      setAppointments((data as unknown as AppointmentRow[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-500/20 text-blue-300",
    completed: "bg-green-500/20 text-green-300",
    cancelled: "bg-red-500/20 text-red-300",
    no_show: "bg-amber-500/20 text-amber-300",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Appointments</h1>
        <p className="text-gray-400 text-sm mt-1">Appointments across all doctors</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4"><div className="h-5 w-48 bg-gray-700 rounded animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map(apt => (
            <Card key={apt.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{apt.patient_name}</p>
                    <p className="text-xs text-gray-400">{apt.service_type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                      {(apt.clinics as { name: string })?.name}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(apt.appointment_datetime).toLocaleDateString()}{" "}
                      {new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {apt.booked_via && <span className="text-xs text-gray-500">via {apt.booked_via}</span>}
                    <Badge className={statusColors[apt.status] || "bg-gray-700 text-gray-300"}>{apt.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
