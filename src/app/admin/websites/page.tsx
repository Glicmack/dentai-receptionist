"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface WebsiteRow {
  id: string
  slug: string
  template: string
  custom_domain: string | null
  is_published: boolean
  hero_title: string | null
  created_at: string
  clinics: { name: string; slug: string; email: string }
}

interface ClinicOption {
  id: string
  name: string
  slug: string
}

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState<WebsiteRow[]>([])
  const [clinics, setClinics] = useState<ClinicOption[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ clinic_id: "", slug: "", template: "modern", hero_title: "", about_text: "" })
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const [websitesRes, clinicsRes] = await Promise.all([
      fetch("/api/admin/websites"),
      fetch("/api/admin/doctors"),
    ])
    const websitesData = await websitesRes.json()
    const clinicsData = await clinicsRes.json()
    setWebsites(websitesData.websites || [])
    setClinics(clinicsData.clinics || [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Website created" })
      setDialogOpen(false)
      load()
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" })
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctor Websites</h1>
          <p className="text-gray-400 text-sm mt-1">Manage landing pages for doctors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">+ New Website</Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Create Doctor Website</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label className="text-gray-300">Doctor / Clinic</Label>
                <select
                  className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-2 text-sm"
                  value={form.clinic_id}
                  onChange={e => {
                    const clinic = clinics.find(c => c.id === e.target.value)
                    setForm(f => ({ ...f, clinic_id: e.target.value, slug: clinic?.slug || "" }))
                  }}
                  required
                >
                  <option value="">Select a doctor...</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-gray-300">URL Slug</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">/dr/</span>
                  <Input className="bg-gray-700 border-gray-600 text-white" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Template</Label>
                <select
                  className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-2 text-sm"
                  value={form.template}
                  onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-300">Hero Title</Label>
                <Input className="bg-gray-700 border-gray-600 text-white" value={form.hero_title} onChange={e => setForm(f => ({ ...f, hero_title: e.target.value }))} placeholder="Welcome to our clinic" />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={creating}>
                {creating ? "Creating..." : "Create Website"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4"><div className="h-5 w-48 bg-gray-700 rounded animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      ) : websites.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center text-gray-400">No websites created yet</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {websites.map(w => (
            <Card key={w.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 text-lg">
                      🌐
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{w.clinics?.name || "Unknown"}</h3>
                      <p className="text-sm text-gray-400">/dr/{w.slug} {w.custom_domain && `| ${w.custom_domain}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gray-700 text-gray-300">{w.template}</Badge>
                    <Badge className={w.is_published ? "bg-green-500/20 text-green-300" : "bg-gray-700 text-gray-400"}>
                      {w.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Link href={`/admin/websites/${w.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Edit</Button>
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
