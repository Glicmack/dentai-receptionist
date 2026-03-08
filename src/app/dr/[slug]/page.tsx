import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

interface DoctorWebsiteData {
  id: string
  slug: string
  template: string
  hero_title: string | null
  hero_subtitle: string | null
  hero_image_url: string | null
  about_text: string | null
  theme_colors: { primary: string; secondary: string }
  custom_css: string | null
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
  clinics: {
    name: string
    slug: string
    phone: string | null
    email: string
    address: string | null
    city: string | null
    state: string | null
    services: { name: string; duration: number; price: string }[]
    hours: Record<string, { open: string | null; close: string | null; closed: boolean }>
    logo_url: string | null
    specialty: string | null
    rating: number
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("doctor_websites")
    .select("seo_title, seo_description, clinics(name)")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single()

  const clinicName = (data?.clinics as unknown as { name: string })?.name || "Doctor"
  return {
    title: data?.seo_title || clinicName,
    description: data?.seo_description || `Visit ${clinicName} for quality dental care`,
  }
}

export default async function DoctorWebsitePage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient()
  const { data: website } = await supabase
    .from("doctor_websites")
    .select("*, clinics(name, slug, phone, email, address, city, state, services, hours, logo_url, specialty, rating)")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single()

  if (!website) notFound()

  const site = website as unknown as DoctorWebsiteData
  const clinic = site.clinics
  const primary = site.theme_colors?.primary || "#1B56DB"
  const services = clinic.services || []

  return (
    <div className="min-h-screen bg-white">
      {site.custom_css && <style dangerouslySetInnerHTML={{ __html: site.custom_css }} />}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic.logo_url ? (
              <img src={clinic.logo_url} alt={clinic.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: primary }}>
                {clinic.name[0]}
              </div>
            )}
            <span className="font-bold text-lg">{clinic.name}</span>
          </div>
          <div className="flex items-center gap-4">
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`} className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">
                {clinic.phone}
              </a>
            )}
            <Link
              href={`/dr/${params.slug}/chat`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ background: primary }}
            >
              Chat Now
            </Link>
            <Link
              href={`/dr/${params.slug}/book`}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
              style={{ borderColor: primary, color: primary }}
            >
              Book
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 md:py-28" style={{ background: `linear-gradient(135deg, ${primary}15, ${primary}05)` }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {site.hero_title || `Welcome to ${clinic.name}`}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                {site.hero_subtitle || "Your trusted dental care provider. We're here to give you the best experience."}
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={`/dr/${params.slug}/book`}
                  className="rounded-lg px-6 py-3 text-white font-medium shadow-lg"
                  style={{ background: primary }}
                >
                  Book Appointment
                </Link>
                <Link
                  href={`/dr/${params.slug}/chat`}
                  className="rounded-lg border-2 px-6 py-3 font-medium"
                  style={{ borderColor: primary, color: primary }}
                >
                  Chat with Us
                </Link>
              </div>
              {clinic.specialty && (
                <p className="mt-6 text-sm text-gray-500">Specialty: {clinic.specialty}</p>
              )}
            </div>
            <div className="hidden md:block">
              {site.hero_image_url ? (
                <img src={site.hero_image_url} alt={clinic.name} className="rounded-2xl shadow-xl w-full" />
              ) : (
                <div className="rounded-2xl p-12 text-center" style={{ background: `${primary}10` }}>
                  <div className="text-6xl mb-4">🦷</div>
                  <p className="text-gray-500">Quality Dental Care</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {site.about_text && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">About Us</h2>
            <p className="text-gray-600 text-center leading-relaxed whitespace-pre-line">{site.about_text}</p>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="font-semibold text-lg text-gray-900">{svc.name}</h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>{svc.duration} min</span>
                    {svc.price && <span className="font-medium" style={{ color: primary }}>${svc.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hours */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Business Hours</h2>
          <div className="space-y-3">
            {Object.entries(clinic.hours || {}).map(([day, hours]) => (
              <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700 capitalize">{day}</span>
                <span className="text-gray-500">
                  {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16" style={{ background: primary, color: "white" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8">Book your appointment today or chat with our AI assistant</p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/dr/${params.slug}/book`}
              className="rounded-lg bg-white px-8 py-3 font-medium shadow-lg"
              style={{ color: primary }}
            >
              Book Now
            </Link>
            {clinic.phone && (
              <a
                href={`tel:${clinic.phone}`}
                className="rounded-lg border-2 border-white/50 px-8 py-3 font-medium text-white hover:bg-white/10"
              >
                Call Us
              </a>
            )}
          </div>
          {clinic.address && (
            <p className="mt-8 text-white/60 text-sm">
              {clinic.address}{clinic.city && `, ${clinic.city}`}{clinic.state && `, ${clinic.state}`}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} {clinic.name}. Powered by DentAI</p>
      </footer>
    </div>
  )
}
