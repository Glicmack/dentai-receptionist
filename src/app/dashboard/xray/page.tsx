"use client"

import { useCallback, useEffect, useState } from "react"
import { useClinic } from "@/hooks/useClinic"
import { useToast } from "@/hooks/use-toast"
import { ImageDropzone } from "@/components/dashboard/ImageDropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { XrayAnalysis } from "@/types"

const XRAY_TYPES = [
  { value: "periapical", label: "Periapical" },
  { value: "panoramic", label: "Panoramic" },
  { value: "bitewing", label: "Bitewing" },
  { value: "cbct", label: "CBCT" },
] as const

const SEVERITY_CONFIG = {
  normal: { label: "Normal", className: "bg-green-100 text-green-800 border-green-200" },
  monitor: { label: "Monitor", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800 border-red-200" },
} as const

export default function XrayPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const { toast } = useToast()

  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [xrayType, setXrayType] = useState<string>("")
  const [analysing, setAnalysing] = useState(false)
  const [result, setResult] = useState<XrayAnalysis | null>(null)
  const [history, setHistory] = useState<XrayAnalysis[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    if (!clinic) return
    try {
      const res = await fetch("/api/xray-analysis")
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false)
    }
  }, [clinic])

  useEffect(() => {
    if (clinic) loadHistory()
  }, [clinic, loadHistory])

  async function handleAnalyse() {
    if (!imageBase64 || !xrayType) {
      toast({ title: "Please upload an image and select X-ray type", variant: "destructive" })
      return
    }

    setAnalysing(true)
    setResult(null)

    try {
      const res = await fetch("/api/xray-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, xray_type: xrayType }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Analysis failed")
      }

      const data = await res.json()
      setResult(data)
      toast({ title: "Analysis complete" })
      loadHistory()
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setAnalysing(false)
    }
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
        <h1 className="text-2xl font-bold">X-Ray AI Analyser</h1>
        <p className="text-muted-foreground">
          Upload a dental X-ray for AI-powered analysis
        </p>
      </div>

      <Tabs defaultValue="analyse">
        <TabsList>
          <TabsTrigger value="analyse">New Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload X-Ray</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageDropzone
                onImageSelect={(_file, base64) => setImageBase64(base64)}
                accept="image/jpeg,image/png,image/webp,application/dicom"
                label="Drop your X-ray image here"
                loading={analysing}
                preview={imageBase64}
              />

              <div className="max-w-xs">
                <label className="mb-1.5 block text-sm font-medium">
                  X-Ray Type
                </label>
                <Select value={xrayType} onValueChange={setXrayType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {XRAY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAnalyse}
                disabled={!imageBase64 || !xrayType || analysing}
                className="w-full sm:w-auto"
              >
                {analysing ? (
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
                    Analysing...
                  </>
                ) : (
                  "Analyse X-Ray"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analysis Results</CardTitle>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${SEVERITY_CONFIG[result.severity].className}`}
                  >
                    {SEVERITY_CONFIG[result.severity].label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence */}
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Confidence
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Findings</h3>
                  <ul className="space-y-1.5">
                    {result.findings.map((finding, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treatments */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Recommended Treatment
                  </h3>
                  <ol className="space-y-1.5">
                    {result.treatments.map((treatment, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {i + 1}
                        </span>
                        {treatment}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Disclaimer */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-xs text-yellow-800">
                    AI-assisted screening only. Not a clinical diagnosis. Always
                    confirm with a qualified dentist.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Past Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No analyses yet. Upload an X-ray to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={item.image_url}
                            alt="X-ray"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {item.xray_type} X-Ray
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()} &middot;{" "}
                            {item.findings.length} finding
                            {item.findings.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_CONFIG[item.severity].className}`}
                        >
                          {SEVERITY_CONFIG[item.severity].label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
