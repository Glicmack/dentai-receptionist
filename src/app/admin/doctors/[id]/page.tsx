"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Clinic } from "@/types"

export default function AdminDoctorEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/doctors/${params.id}`)
      .then(r => r.json())
      .then(d => { setClinic(d.clinic); setLoading(false) })
  }, [params.id])

  async function handleSave() {
    if (!clinic) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/doctors/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clinic.name,
          email: clinic.email,
          phone: clinic.phone,
          specialty: clinic.specialty,
          description: clinic.description,
          is_listed: clinic.is_listed,
          plan: clinic.plan,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast({ title: "Saved successfully" })
    } catch {
      toast({ title: "Error saving", variant: "destructive" })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  if (!clinic) {
    return <p className="text-gray-400">Doctor not found</p>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit: {clinic.name}</h1>
          <p className="text-gray-400 text-sm">/{clinic.slug}</p>
        </div>
        <Button variant="ghost" className="text-gray-400" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Clinic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Name</Label>
              <Input className="bg-gray-700 border-gray-600 text-white" value={clinic.name} onChange={e => setClinic({ ...clinic, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input className="bg-gray-700 border-gray-600 text-white" value={clinic.email} onChange={e => setClinic({ ...clinic, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Phone</Label>
              <Input className="bg-gray-700 border-gray-600 text-white" value={clinic.phone || ""} onChange={e => setClinic({ ...clinic, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-gray-300">Specialty</Label>
              <Input className="bg-gray-700 border-gray-600 text-white" value={clinic.specialty || ""} onChange={e => setClinic({ ...clinic, specialty: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Description</Label>
            <textarea
              className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-2 text-sm min-h-[80px]"
              value={clinic.description || ""}
              onChange={e => setClinic({ ...clinic, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Plan</Label>
              <select
                className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-2 text-sm"
                value={clinic.plan}
                onChange={e => setClinic({ ...clinic, plan: e.target.value as Clinic["plan"] })}
              >
                <option value="trial">Trial</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={clinic.is_listed}
                onCheckedChange={checked => setClinic({ ...clinic, is_listed: checked })}
              />
              <Label className="text-gray-300">Listed in Directory</Label>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
