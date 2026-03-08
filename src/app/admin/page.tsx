"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Stats {
  totalClinics: number
  totalConversations: number
  totalAppointments: number
  totalLeads: number
  totalPatients: number
  completedAppointments: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Total Doctors", value: stats?.totalClinics || 0, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Patients", value: stats?.totalPatients || 0, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Conversations", value: stats?.totalConversations || 0, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Appointments", value: stats?.totalAppointments || 0, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Leads", value: stats?.totalLeads || 0, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Completed", value: stats?.completedAppointments || 0, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor all activity across the platform</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <span className={`text-lg font-bold ${stat.color}`}>#</span>
                  </div>
                  <span className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
