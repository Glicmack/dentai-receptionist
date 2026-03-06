"use client"

import { useCallback, useEffect, useState } from "react"
import { useClinic } from "@/hooks/useClinic"
import { useToast } from "@/hooks/use-toast"
import { ImageDropzone } from "@/components/dashboard/ImageDropzone"
import { BeforeAfterSlider } from "@/components/dashboard/BeforeAfterSlider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SmileSimulation } from "@/types"

const TREATMENT_TYPES = [
  { value: "Teeth Whitening", label: "Teeth Whitening" },
  { value: "Straightening / Braces", label: "Straightening / Braces" },
  { value: "Veneers", label: "Veneers" },
  { value: "Gap Closure", label: "Gap Closure" },
  { value: "Full Smile Makeover", label: "Full Smile Makeover" },
] as const

export default function SmileSimulatorPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const { toast } = useToast()

  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [treatmentType, setTreatmentType] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const [simulationResult, setSimulationResult] = useState<{
    before_image_url: string
    after_image_url: string
    after_image_base64: string
    treatment_type: string
    notes: string | null
  } | null>(null)

  const [gallery, setGallery] = useState<SmileSimulation[]>([])
  const [galleryLoading, setGalleryLoading] = useState(true)

  const loadGallery = useCallback(async () => {
    if (!clinic) return
    try {
      const res = await fetch("/api/smile-simulation")
      if (res.ok) {
        const data = await res.json()
        setGallery(data)
      }
    } catch {
      // silently fail
    } finally {
      setGalleryLoading(false)
    }
  }, [clinic])

  useEffect(() => {
    if (clinic) loadGallery()
  }, [clinic, loadGallery])

  async function handleGenerate() {
    if (!imageBase64 || !treatmentType) {
      toast({
        title: "Please upload a photo and select treatment type",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    setSimulationResult(null)

    try {
      const res = await fetch("/api/smile-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          treatment_type: treatmentType,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Simulation failed")
      }

      const data = await res.json()
      setSimulationResult(data)
      toast({ title: "Simulation generated" })
    } catch (error) {
      toast({
        title: "Simulation failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!simulationResult || !clinic) return

    setSaving(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

      if (!userData?.clinic_id) throw new Error("No clinic found")

      const { error } = await supabase.from("smile_simulations").insert({
        clinic_id: userData.clinic_id,
        before_image_url: simulationResult.before_image_url,
        after_image_url: simulationResult.after_image_url,
        treatment_type: simulationResult.treatment_type,
        notes: simulationResult.notes,
      })

      if (error) throw error

      toast({ title: "Saved to patient records" })
      loadGallery()
    } catch (error) {
      toast({
        title: "Failed to save",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function handleDownload() {
    if (!simulationResult?.after_image_base64) return
    const link = document.createElement("a")
    link.href = `data:image/jpeg;base64,${simulationResult.after_image_base64}`
    link.download = `smile-simulation-${Date.now()}.jpg`
    link.click()
  }

  if (clinicLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Smile Simulator</h1>
        <p className="text-muted-foreground">
          Generate before & after treatment previews for patients
        </p>
      </div>

      {/* Upload & Config */}
      <Card>
        <CardHeader>
          <CardTitle>Create Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Step 1: Upload patient photo
            </label>
            <ImageDropzone
              onImageSelect={(_file, base64) => setImageBase64(base64)}
              accept="image/jpeg,image/png,image/webp"
              label="Drop a teeth photo here"
              loading={generating}
              preview={imageBase64}
            />
          </div>

          {/* Step 2: Treatment type */}
          <div className="max-w-xs">
            <label className="mb-1.5 block text-sm font-medium">
              Step 2: Select treatment type
            </label>
            <Select value={treatmentType} onValueChange={setTreatmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select treatment..." />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Additional notes{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              placeholder="e.g. patient wants a natural look"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!imageBase64 || !treatmentType || generating}
            className="w-full sm:w-auto"
          >
            {generating ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              "Generate Simulation"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {simulationResult && imageBase64 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Simulation Result</CardTitle>
              <Badge variant="secondary">
                {simulationResult.treatment_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <BeforeAfterSlider
              beforeSrc={`data:image/jpeg;base64,${imageBase64}`}
              afterSrc={`data:image/jpeg;base64,${simulationResult.after_image_base64}`}
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save to Patient Record"}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          {galleryLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : gallery.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved simulations yet. Generate one above to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((sim) => (
                <div
                  key={sim.id}
                  className="overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
                >
                  <div className="grid grid-cols-2">
                    <div className="relative">
                      <img
                        src={sim.before_image_url}
                        alt="Before"
                        className="h-32 w-full object-cover"
                      />
                      <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        Before
                      </span>
                    </div>
                    <div className="relative">
                      <img
                        src={sim.after_image_url}
                        alt="After"
                        className="h-32 w-full object-cover"
                      />
                      <span className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        After
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {sim.treatment_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sim.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {sim.notes && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {sim.notes}
                      </p>
                    )}
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
