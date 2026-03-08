"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeadWithClinic {
  id: string
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  source: string | null
  interest: string | null
  status: string
  follow_up_count: number
  created_at: string
  clinics: { name: string; slug: string }
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadWithClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetch(`/api/admin/leads?status=${filter}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false) })
  }, [filter])

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-300",
    contacted: "bg-amber-500/20 text-amber-300",
    booked: "bg-green-500/20 text-green-300",
    lost: "bg-red-500/20 text-red-300",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Leads</h1>
        <p className="text-gray-400 text-sm mt-1">Leads across all doctors</p>
      </div>

      <div className="flex gap-2">
        {["all", "new", "contacted", "booked", "lost"].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setLoading(true) }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4"><div className="h-5 w-48 bg-gray-700 rounded animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center text-gray-400">No leads found</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => (
            <Card key={lead.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-gray-300 text-sm font-medium">
                      {(lead.patient_name || "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{lead.patient_name || "Unknown"}</p>
                      <p className="text-xs text-gray-400">{lead.patient_phone || lead.patient_email || "No contact"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">{lead.clinics?.name}</Badge>
                    {lead.interest && <span className="text-xs text-gray-400">{lead.interest}</span>}
                    <Badge className={statusColors[lead.status] || "bg-gray-700 text-gray-300"}>{lead.status}</Badge>
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
