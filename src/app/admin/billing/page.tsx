"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ClinicBilling {
  id: string
  name: string
  slug: string
  plan: string
  subscription_status: string
  stripe_customer_id: string | null
  trial_ends_at: string
}

export default function AdminBillingPage() {
  const [clinics, setClinics] = useState<ClinicBilling[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/doctors")
      .then(r => r.json())
      .then(d => { setClinics(d.clinics || []); setLoading(false) })
  }, [])

  const planCounts = clinics.reduce((acc, c) => {
    acc[c.plan] = (acc[c.plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Subscription status across all doctors</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {["trial", "starter", "growth", "pro"].map(plan => (
          <Card key={plan} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400 capitalize">{plan}</p>
              <p className="text-2xl font-bold text-white mt-1">{planCounts[plan] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && (
        <div className="space-y-2">
          {clinics.map(clinic => (
            <Card key={clinic.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{clinic.name}</p>
                    <p className="text-xs text-gray-400">/{clinic.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      clinic.plan === "pro" ? "bg-purple-500/20 text-purple-300" :
                      clinic.plan === "growth" ? "bg-blue-500/20 text-blue-300" :
                      clinic.plan === "starter" ? "bg-green-500/20 text-green-300" :
                      "bg-gray-700 text-gray-300"
                    }>{clinic.plan}</Badge>
                    <span className="text-xs text-gray-400">{clinic.subscription_status}</span>
                    {clinic.stripe_customer_id && <span className="text-xs text-gray-500">Stripe linked</span>}
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
