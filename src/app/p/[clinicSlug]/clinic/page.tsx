"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PatientHeader } from "@/components/patient/PatientHeader"
import { PatientNav } from "@/components/patient/PatientNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { PatientClinicInfo } from "@/types"

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

export default function PatientClinicInfoPage() {
  const params = useParams()
  const router = useRouter()
  const clinicSlug = params.clinicSlug as string
  const [clinic, setClinic] = useState<PatientClinicInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/patient/${clinicSlug}/clinic`)
        if (!res.ok) {
          router.push(`/p/${clinicSlug}`)
          return
        }
        setClinic(await res.json())
      } catch {
        router.push(`/p/${clinicSlug}`)
      }
      setLoading(false)
    }
    load()
  }, [clinicSlug, router])

  if (loading || !clinic) {
    return (
      <div>
        <div className="h-14 border-b bg-white" />
        <div className="mx-auto max-w-2xl space-y-4 p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 sm:pb-4">
      <PatientHeader clinicName={clinic.name} clinicSlug={clinicSlug} />
      <PatientNav clinicSlug={clinicSlug} />

      <main className="mx-auto max-w-2xl space-y-4 p-4 pt-6 sm:pt-4">
        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clinic.phone && (
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href={`tel:${clinic.phone}`} className="font-medium text-blue-600 hover:underline">
                  {clinic.phone}
                </a>
              </div>
            )}
            {clinic.address && (
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                <p>
                  {clinic.address}
                  {clinic.city && `, ${clinic.city}`}
                  {clinic.state && `, ${clinic.state}`}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {clinic.phone && (
                <a href={`tel:${clinic.phone}`} className="flex-1">
                  <Button className="w-full" variant="outline">Call Now</Button>
                </a>
              )}
              <Link href={`/p/${clinicSlug}/book`} className="flex-1">
                <Button className="w-full">Book Appointment</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DAY_KEYS.map((key, i) => {
                const day = clinic.hours[key]
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{DAY_LABELS[i]}</span>
                    <span className={day.closed ? "text-muted-foreground" : ""}>
                      {day.closed ? "Closed" : `${day.open} - ${day.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        {clinic.services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinic.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.duration} min</p>
                    </div>
                    <p className="text-sm font-medium">From {service.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insurance */}
        {clinic.insurance_accepted.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insurance Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {clinic.insurance_accepted.map((ins) => (
                  <span key={ins} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {ins}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency */}
        {clinic.emergency_policy && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{clinic.emergency_policy}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
