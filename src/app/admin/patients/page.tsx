"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PatientRow {
  id: string
  email: string
  phone: string | null
  full_name: string
  phone_verified: boolean
  created_at: string
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const verifyRes = await fetch("/api/admin/verify")
      if (!verifyRes.ok) return

      const res = await fetch("/api/admin/patients")
      const data = await res.json()
      setPatients(data.patients || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Patients</h1>
        <p className="text-gray-400 text-sm mt-1">{patients.length} registered patients</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4"><div className="h-5 w-48 bg-gray-700 rounded animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center text-gray-400">No patients registered yet</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {patients.map(patient => (
            <Card key={patient.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium">
                      {patient.full_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{patient.full_name}</p>
                      <p className="text-xs text-gray-400">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {patient.phone && <span className="text-xs text-gray-400">{patient.phone}</span>}
                    {patient.phone_verified && <Badge className="bg-green-500/20 text-green-300">Verified</Badge>}
                    <span className="text-xs text-gray-500">{new Date(patient.created_at).toLocaleDateString()}</span>
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
