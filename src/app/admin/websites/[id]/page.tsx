"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { DoctorWebsite } from "@/types"

export default function AdminWebsiteEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [website, setWebsite] = useState<DoctorWebsite | null>(null)
  const [clinicName, setClinicName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/websites/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setWebsite(d.website)
        setClinicName((d.website?.clinics as { name: string })?.name || "")
        setLoading(false)
      })
  }, [params.id])

  async function handleSave() {
    if (!website) return
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, clinic_id, created_at, updated_at, clinics, ...cleanData } = website as DoctorWebsite & { clinics?: unknown }

      const res = await fetch(`/api/admin/websites/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast({ title: "Website saved" })
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

  if (!website) return <p className="text-gray-400">Website not found</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Website: {clinicName}</h1>
          <p className="text-gray-400 text-sm">/dr/{website.slug}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/dr/${website.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">Preview</Button>
          </a>
          <Button variant="ghost" className="text-gray-400" onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Hero Section</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Title</Label>
            <Input className="bg-gray-700 border-gray-600 text-white" value={website.hero_title || ""} onChange={e => setWebsite({ ...website, hero_title: e.target.value })} placeholder="Welcome to our clinic" />
          </div>
          <div>
            <Label className="text-gray-300">Subtitle</Label>
            <Input className="bg-gray-700 border-gray-600 text-white" value={website.hero_subtitle || ""} onChange={e => setWebsite({ ...website, hero_subtitle: e.target.value })} placeholder="Your trusted dental care provider" />
          </div>
          <div>
            <Label className="text-gray-300">Hero Image URL</Label>
            <Input className="bg-gray-700 border-gray-600 text-white" value={website.hero_image_url || ""} onChange={e => setWebsite({ ...website, hero_image_url: e.target.value })} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">About Section</CardTitle></CardHeader>
        <CardContent>
          <textarea
            className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-3 text-sm min-h-[120px]"
            value={website.about_text || ""}
            onChange={e => setWebsite({ ...website, about_text: e.target.value })}
            placeholder="Tell patients about your clinic..."
          />
        </CardContent>
      </Card>

      {/* Template & Theme */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Design</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Template</Label>
              <select
                className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-2 text-sm"
                value={website.template}
                onChange={e => setWebsite({ ...website, template: e.target.value })}
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={website.theme_colors?.primary || "#1B56DB"}
                  onChange={e => setWebsite({ ...website, theme_colors: { ...website.theme_colors, primary: e.target.value } })}
                  className="h-10 w-14 rounded cursor-pointer bg-gray-700 border border-gray-600"
                />
                <Input className="bg-gray-700 border-gray-600 text-white" value={website.theme_colors?.primary || ""} onChange={e => setWebsite({ ...website, theme_colors: { ...website.theme_colors, primary: e.target.value } })} />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Custom CSS</Label>
            <textarea
              className="w-full rounded-md bg-gray-700 border border-gray-600 text-white p-3 text-sm min-h-[80px] font-mono text-xs"
              value={website.custom_css || ""}
              onChange={e => setWebsite({ ...website, custom_css: e.target.value })}
              placeholder=".custom-class { }"
            />
          </div>
        </CardContent>
      </Card>

      {/* Domain & Advanced */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Domain & Advanced</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Custom Domain</Label>
            <Input className="bg-gray-700 border-gray-600 text-white" value={website.custom_domain || ""} onChange={e => setWebsite({ ...website, custom_domain: e.target.value || null })} placeholder="www.drclinic.com" />
            <p className="text-xs text-gray-500 mt-1">Point a CNAME record to your deployment URL</p>
          </div>
          <div>
            <Label className="text-gray-300">GitHub Repo (for custom code)</Label>
            <Input className="bg-gray-700 border-gray-600 text-white" value={website.github_repo || ""} onChange={e => setWebsite({ ...website, github_repo: e.target.value || null })} placeholder="https://github.com/user/repo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">SEO Title</Label>
              <Input className="bg-gray-700 border-gray-600 text-white" value={website.seo_title || ""} onChange={e => setWebsite({ ...website, seo_title: e.target.value })} />
            </div>
            <div>
              <Label className="text-gray-300">SEO Description</Label>
              <Input className="bg-gray-700 border-gray-600 text-white" value={website.seo_description || ""} onChange={e => setWebsite({ ...website, seo_description: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={website.is_published}
              onCheckedChange={checked => setWebsite({ ...website, is_published: checked })}
            />
            <Label className="text-gray-300">Published</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700" disabled={saving}>
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
