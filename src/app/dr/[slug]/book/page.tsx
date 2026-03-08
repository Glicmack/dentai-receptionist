"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function DrBookPage() {
  const params = useParams()
  const slug = params.slug as string
  const [patientLoggedIn, setPatientLoggedIn] = useState<boolean | null>(null)
  const [clinicName, setClinicName] = useState("")

  useEffect(() => {
    fetch("/api/patient/me")
      .then(r => { setPatientLoggedIn(r.ok); return r.ok ? r.json() : null })
      .catch(() => setPatientLoggedIn(false))

    fetch(`/api/store/doctors`)
      .then(r => r.json())
      .then(d => {
        const doc = (d.doctors || []).find((doc: { slug: string }) => doc.slug === slug)
        if (doc) setClinicName(doc.name)
      })
  }, [slug])

  if (patientLoggedIn === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">📅</div>
          <h2 className="text-xl font-semibold">Login Required</h2>
          <p className="text-gray-500">You need to sign in to book an appointment</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/store/login?redirect=/dr/${slug}/book`}><Button>Sign In</Button></Link>
            <Link href={`/store/register?redirect=/dr/${slug}/book`}><Button variant="outline">Create Account</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Book with {clinicName || "Doctor"}</h1>
        <p className="text-gray-500 mt-2">
          To book an appointment, chat with our AI assistant. It will help you find the perfect time slot.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-semibold text-lg mb-2">Chat to Book</h3>
          <p className="text-gray-500 mb-6">
            Our AI assistant will help you pick a service, find available times, and confirm your booking.
          </p>
          <Link href={`/dr/${slug}/chat`}>
            <Button size="lg">Start Chat to Book</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link href={`/dr/${slug}`} className="text-sm text-gray-400 hover:underline">
          Back to clinic page
        </Link>
      </div>
    </div>
  )
}
