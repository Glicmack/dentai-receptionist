"use client"

import { useEffect, useState, useCallback } from "react"
import { useClinic } from "@/hooks/useClinic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { Appointment } from "@/types"

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
  rescheduled: "outline",
}

export default function AppointmentsPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { toast } = useToast()

  // New appointment form
  const [newAppt, setNewAppt] = useState({
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    service_type: "",
    appointment_datetime: "",
    duration_minutes: 60,
    notes: "",
  })

  const fetchAppointments = useCallback(async () => {
    const params = new URLSearchParams()
    if (filter !== "all") params.set("status", filter)

    const response = await fetch(`/api/appointments?${params}`)
    if (response.ok) {
      const data = await response.json()
      setAppointments(data)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (!clinic) return
    fetchAppointments()
  }, [clinic, filter, fetchAppointments])

  async function addAppointment() {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAppt, booked_via: "manual" }),
    })

    if (response.ok) {
      toast({ title: "Appointment created" })
      setShowAddDialog(false)
      setNewAppt({ patient_name: "", patient_phone: "", patient_email: "", service_type: "", appointment_datetime: "", duration_minutes: 60, notes: "" })
      fetchAppointments()
    } else {
      toast({ title: "Failed to create appointment", variant: "destructive" })
    }
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })

    if (response.ok) {
      toast({ title: `Appointment ${status}` })
      fetchAppointments()
    }
  }

  if (clinicLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage all clinic appointments</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Appointment Manually</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input value={newAppt.patient_name} onChange={(e) => setNewAppt({ ...newAppt, patient_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={newAppt.patient_phone} onChange={(e) => setNewAppt({ ...newAppt, patient_phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={newAppt.service_type} onValueChange={(v) => setNewAppt({ ...newAppt, service_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {(clinic?.services || []).map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.name} ({s.duration} min)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={newAppt.appointment_datetime} onChange={(e) => setNewAppt({ ...newAppt, appointment_datetime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={newAppt.notes} onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })} />
              </div>
              <Button onClick={addAppointment} className="w-full" disabled={!newAppt.patient_name || !newAppt.service_type || !newAppt.appointment_datetime}>
                Create Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
        {["all", "confirmed", "completed", "cancelled", "no_show"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm" onClick={() => setFilter(s)} className={filter === s ? "shadow-sm" : ""}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments found.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:shadow-sm hover:border-primary/20">
                  <div className="space-y-1">
                    <p className="font-medium">{apt.patient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.service_type} - {apt.duration_minutes} min
                    </p>
                    <p className="text-sm text-muted-foreground">{apt.patient_phone}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm font-medium">
                      {new Date(apt.appointment_datetime).toLocaleDateString()}{" "}
                      {new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_COLORS[apt.status] || "secondary"}>
                        {apt.status}
                      </Badge>
                      {apt.booked_via && (
                        <span className="text-xs text-muted-foreground">via {apt.booked_via}</span>
                      )}
                    </div>
                    {apt.status === "confirmed" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "completed")}>Complete</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(apt.id, "cancelled")}>Cancel</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
