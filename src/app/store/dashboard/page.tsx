"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PatientDoctor {
  clinic_id: string
  last_contact_at: string
  clinics: {
    id: string
    name: string
    slug: string
    specialty: string | null
    logo_url: string | null
    rating: number
  }
}

interface PatientConversation {
  id: string
  clinic_id: string
  outcome: string | null
  created_at: string
  ai_paused: boolean
  clinics: { name: string; slug: string }
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState<{ fullName: string; email: string } | null>(null)
  const [doctors, setDoctors] = useState<PatientDoctor[]>([])
  const [conversations, setConversations] = useState<PatientConversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/patient/me")
      if (!meRes.ok) {
        router.push("/store/login")
        return
      }
      const meData = await meRes.json()
      setPatient(meData.patient)

      const [docRes, convRes] = await Promise.all([
        fetch("/api/patient/doctors"),
        fetch("/api/patient/conversations"),
      ])

      const docData = await docRes.json()
      const convData = await convRes.json()
      setDoctors(docData.doctors || [])
      setConversations(convData.conversations || [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="h-5 w-48 bg-gray-200 rounded animate-pulse" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {patient?.fullName}</h1>
        <p className="text-gray-500 text-sm mt-1">{patient?.email}</p>
      </div>

      {/* My Doctors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Doctors</h2>
          <Link href="/store" className="text-sm text-blue-600 hover:underline">Browse All</Link>
        </div>
        {doctors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>You haven&apos;t connected with any doctors yet.</p>
              <Link href="/store" className="text-blue-600 hover:underline text-sm mt-2 block">
                Find a doctor to get started
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <Link key={doc.clinic_id} href={`/dr/${doc.clinics.slug}/chat`}>
                <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {doc.clinics.logo_url ? (
                        <img src={doc.clinics.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {doc.clinics.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{doc.clinics.name}</p>
                        {doc.clinics.specialty && <p className="text-xs text-gray-500">{doc.clinics.specialty}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Conversations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Conversations</h2>
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">No conversations yet</CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.slice(0, 10).map(conv => (
              <Link key={conv.id} href={`/dr/${(conv.clinics as { slug: string }).slug}/chat`}>
                <Card className="hover:border-blue-200 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{(conv.clinics as { name: string }).name}</p>
                        <p className="text-xs text-gray-400">{new Date(conv.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {conv.ai_paused && <Badge className="bg-amber-100 text-amber-700">Doctor Replied</Badge>}
                        {conv.outcome && <Badge variant="secondary">{conv.outcome}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
