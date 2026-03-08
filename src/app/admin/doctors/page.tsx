"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ClinicWithUsers {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  plan: string
  specialty: string | null
  is_listed: boolean
  created_at: string
  users: { email: string; full_name: string | null; role: string }[]
}

export default function AdminDoctorsPage() {
  const [clinics, setClinics] = useState<ClinicWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", slug: "", phone: "", specialty: "", description: "" })
  const { toast } = useToast()

  useEffect(() => { loadClinics() }, [])

  async function loadClinics() {
    const res = await fetch("/api/admin/doctors")
    const data = await res.json()
    setClinics(data.clinics || [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: "Doctor created" })
      setDialogOpen(false)
      setForm({ name: "", email: "", slug: "", phone: "", specialty: "", description: "" })
      loadClinics()
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" })
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctors / Clinics</h1>
          <p className="text-gray-400 text-sm mt-1">{clinics.length} total doctors on platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">+ Add Doctor</Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Create New Doctor / Clinic</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Clinic Name *</Label>
                  <Input className="bg-gray-700 border-gray-600 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <Label className="text-gray-300">Slug *</Label>
                  <Input className="bg-gray-700 border-gray-600 text-white" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="dr-smith" required />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input className="bg-gray-700 border-gray-600 text-white" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input className="bg-gray-700 border-gray-600 text-white" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-gray-300">Specialty</Label>
                  <Input className="bg-gray-700 border-gray-600 text-white" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="General Dentistry" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={creating}>
                {creating ? "Creating..." : "Create Doctor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="h-5 w-48 bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {clinics.map(clinic => (
            <Card key={clinic.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-bold">
                      {clinic.name[0]}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{clinic.name}</h3>
                      <p className="text-sm text-gray-400">{clinic.email} &middot; /{clinic.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {clinic.specialty && (
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300">{clinic.specialty}</Badge>
                    )}
                    <Badge className={
                      clinic.plan === "pro" ? "bg-purple-500/20 text-purple-300" :
                      clinic.plan === "growth" ? "bg-blue-500/20 text-blue-300" :
                      clinic.plan === "starter" ? "bg-green-500/20 text-green-300" :
                      "bg-gray-700 text-gray-300"
                    }>
                      {clinic.plan}
                    </Badge>
                    <Link href={`/admin/doctors/${clinic.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        Edit
                      </Button>
                    </Link>
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
