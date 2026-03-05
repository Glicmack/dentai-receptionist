"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChatWidget } from "@/components/widget/ChatWidget"
import { Skeleton } from "@/components/ui/skeleton"

interface ClinicConfig {
  name: string
  slug: string
  phone: string | null
  greeting: string
  tone: string
}

export default function WidgetPage() {
  const params = useParams()
  const clinicSlug = params.clinicSlug as string
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadClinic() {
      try {
        const response = await fetch(`/api/widget/${clinicSlug}`)
        if (!response.ok) {
          setError("Clinic not found")
          return
        }
        const data = await response.json()
        setClinicConfig({
          name: data.name,
          slug: data.slug,
          phone: data.phone,
          greeting: data.greeting,
          tone: data.tone,
        })
      } catch {
        setError("Failed to load clinic data")
      }
    }
    loadClinic()
  }, [clinicSlug])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!clinicConfig) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b bg-primary p-4">
          <Skeleton className="h-6 w-32 bg-white/20" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    )
  }

  return <ChatWidget clinicConfig={clinicConfig} />
}
