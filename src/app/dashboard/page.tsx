"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useClinic } from "@/hooks/useClinic"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Appointment, Conversation, Lead } from "@/types"

export default function DashboardPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({
    totalConversations: 0,
    appointmentsBooked: 0,
    estimatedRevenue: 0,
    answerRate: 100,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!clinic) return

    async function loadDashboardData() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

      // Fetch in parallel
      const [convosRes, appointmentsRes, leadsRes, todayApptsRes] = await Promise.all([
        supabase
          .from("conversations")
          .select("*")
          .eq("clinic_id", clinic!.id)
          .gte("created_at", startOfMonth)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("appointments")
          .select("*")
          .eq("clinic_id", clinic!.id)
          .gte("created_at", startOfMonth),
        supabase
          .from("leads")
          .select("*")
          .eq("clinic_id", clinic!.id)
          .in("status", ["new", "contacted"])
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("appointments")
          .select("*")
          .eq("clinic_id", clinic!.id)
          .gte("appointment_datetime", todayStart)
          .lt("appointment_datetime", todayEnd)
          .order("appointment_datetime"),
      ])

      const monthConvos = convosRes.data || []
      const monthAppts = appointmentsRes.data || []
      const activeLeads = leadsRes.data || []
      const todayAppts = todayApptsRes.data || []

      setConversations(monthConvos)
      setAppointments(todayAppts)
      setLeads(activeLeads)
      setStats({
        totalConversations: monthConvos.length,
        appointmentsBooked: monthAppts.length,
        estimatedRevenue: monthAppts.length * 200,
        answerRate: monthConvos.length > 0 ? 100 : 0,
      })
      setLoading(false)
    }

    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinic])

  if (clinicLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{clinic?.name ? `, ${clinic.name}` : ""}
        </p>
      </div>

      <StatsCards {...stats} />

      {/* Try Your AI Assistant */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Try Your AI Receptionist</h3>
              <p className="text-sm text-muted-foreground">
                Test how your AI handles patient conversations — booking, questions, and more
              </p>
            </div>
          </div>
          <Link href="/dashboard/chat">
            <Button>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Open AI Chat
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{apt.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{apt.service_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(apt.appointment_datetime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet. Your AI receptionist is ready!</p>
            ) : (
              <div className="space-y-3">
                {conversations.slice(0, 5).map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {conv.channel === "voice" ? "📞" : "💬"}
                      </span>
                      <div>
                        <p className="font-medium">{conv.patient_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {conv.outcome && (
                      <Badge variant={conv.outcome === "booked" ? "default" : "secondary"}>
                        {conv.outcome}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads Needing Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads Needing Follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads need follow-up at this time.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{lead.patient_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.interest || "General inquiry"} - {lead.source}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                    <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                      {lead.status}
                    </Badge>
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
