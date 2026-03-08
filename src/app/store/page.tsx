"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createAdminClient } from "@/lib/supabase/admin"

interface DoctorCard {
  id: string
  name: string
  slug: string
  specialty: string | null
  rating: number
  city: string | null
  state: string | null
  logo_url: string | null
  description: string | null
  services: { name: string }[]
}

export default function StorePage() {
  const [doctors, setDoctors] = useState<DoctorCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/store/doctors")
      .then(r => r.json())
      .then(d => { setDoctors(d.doctors || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialty || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.city || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Find Your Perfect Dentist</h1>
          <p className="mt-3 text-blue-100">Browse top dental professionals. Chat instantly with AI or book an appointment.</p>
          <div className="mt-8 max-w-lg mx-auto">
            <Input
              placeholder="Search by name, specialty, or city..."
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 h-12 text-base"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Doctor Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No doctors found{search && " matching your search"}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doctor => (
              <Link key={doctor.id} href={`/dr/${doctor.slug}`}>
                <div className="bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all p-6 h-full">
                  <div className="flex items-start gap-4">
                    {doctor.logo_url ? (
                      <img src={doctor.logo_url} alt={doctor.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {doctor.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      {doctor.specialty && (
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      )}
                    </div>
                  </div>

                  {doctor.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{doctor.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
                    </div>
                    {(doctor.city || doctor.state) && (
                      <span className="text-xs text-gray-400">
                        {[doctor.city, doctor.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>

                  {doctor.services && doctor.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doctor.services.slice(0, 3).map((svc, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          {svc.name}
                        </Badge>
                      ))}
                      {doctor.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                          +{doctor.services.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
