"use client"

import { useEffect, useState, useCallback } from "react"
import { useClinic } from "@/hooks/useClinic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { Lead } from "@/types"

export default function LeadsPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams()
    if (filter !== "all") params.set("status", filter)

    const response = await fetch(`/api/leads?${params}`)
    if (response.ok) {
      const data = await response.json()
      setLeads(data)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (!clinic) return
    fetchLeads()
  }, [clinic, filter, fetchLeads])

  async function updateLeadStatus(id: string, status: string) {
    const response = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })

    if (response.ok) {
      toast({ title: `Lead marked as ${status}` })
      fetchLeads()
    }
  }

  async function sendFollowUp(id: string) {
    const response = await fetch(`/api/leads/${id}/follow-up`, {
      method: "POST",
    })

    if (response.ok) {
      toast({ title: "Follow-up SMS sent!" })
      fetchLeads()
    } else {
      const data = await response.json()
      toast({ title: "Failed to send", description: data.error, variant: "destructive" })
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
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-muted-foreground">Manage interested patients and follow-ups</p>
      </div>

      <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
        {["all", "new", "contacted", "booked", "lost"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm" onClick={() => setFilter(s)} className={filter === s ? "shadow-sm" : ""}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{leads.length} lead{leads.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads found.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:shadow-sm hover:border-primary/20">
                  <div className="space-y-1">
                    <p className="font-medium">{lead.patient_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.patient_phone || "No phone"}{" "}
                      {lead.patient_email ? `- ${lead.patient_email}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Interested in: {lead.interest || "General"} | Source: {lead.source || "Unknown"}
                    </p>
                    {lead.notes && (
                      <p className="text-xs text-muted-foreground">{lead.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                        {lead.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {lead.patient_phone && lead.status !== "booked" && lead.status !== "lost" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendFollowUp(lead.id)}
                          disabled={lead.follow_up_count >= 3}
                        >
                          {lead.follow_up_count >= 3 ? "Max sent" : `Send SMS (${lead.follow_up_count}/3)`}
                        </Button>
                      )}
                      {lead.status !== "booked" && (
                        <Button size="sm" variant="default" onClick={() => updateLeadStatus(lead.id, "booked")}>
                          Mark Booked
                        </Button>
                      )}
                      {lead.status !== "lost" && (
                        <Button size="sm" variant="ghost" onClick={() => updateLeadStatus(lead.id, "lost")}>
                          Mark Lost
                        </Button>
                      )}
                    </div>
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
