import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/MobileNav"
import { FAQ } from "@/components/FAQ"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-7 w-7 text-[#1B56DB]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
            </svg>
            <span className="text-xl font-bold text-[#1B56DB]">Bright Smile</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1B56DB]">
              Home
            </Link>
            <Link href="#why-us" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1B56DB]">
              About us
            </Link>
            <Link href="#services" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1B56DB]">
              Services
            </Link>
            <Link href="#experts" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1B56DB]">
              Team
            </Link>
            <Link href="#faq" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1B56DB]">
              FAQ
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-[#1B56DB] text-white hover:bg-[#1647b8] shadow-md rounded-full px-6">
                Contact
              </Button>
            </Link>
          </nav>
          <MobileNav />
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF1FF] via-[#F3F7FF] to-white py-16 md:py-20 lg:py-28">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full border-[3px] border-blue-200/40" />
          <div className="pointer-events-none absolute -left-8 bottom-20 h-24 w-24 rounded-full border-[3px] border-blue-200/30" />
          <div className="pointer-events-none absolute right-1/4 top-6">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="#1B56DB" fillOpacity="0.15" /></svg>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
              {/* Left */}
              <div>
                <h1 className="animate-fade-up text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  Brighter Smiles,{" "}
                  <span className="text-[#1B56DB]">Healthier</span>{" "}
                  Lives
                  <svg width="24" height="24" className="mb-2 ml-2 inline-block text-[#1B56DB]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
                  </svg>
                </h1>
                <p className="animate-fade-up-delay-1 mt-6 max-w-lg text-base leading-relaxed text-gray-500">
                  Experience gentle, expert dental care in a warm and modern environment.
                </p>
                <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-4">
                  <Link href="/login">
                    <Button size="lg" className="bg-[#1B56DB] text-base shadow-lg shadow-blue-500/25 hover:bg-[#1647b8] hover:-translate-y-0.5 transition-all">
                      Book Appointment
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="border-[#1B56DB] text-[#1B56DB] text-base hover:bg-blue-50 hover:-translate-y-0.5 transition-all">
                      Call Us Now
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right - Circular image with badge */}
              <div className="animate-fade-up-delay-1 relative mx-auto w-full max-w-md md:max-w-none">
                <div className="relative mx-auto aspect-square w-[80%] overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-2xl ring-8 ring-white">
                  <Image src="/hero-dental-1.jpg" alt="Modern dental office" fill className="object-cover" sizes="(max-width: 768px) 80vw, 40vw" priority />
                </div>
                {/* Floating badge */}
                <div className="absolute -right-2 bottom-12 z-10 flex items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-lg ring-1 ring-blue-100">
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-gray-300 ring-2 ring-white" />
                    <div className="h-7 w-7 rounded-full bg-gray-400 ring-2 ring-white" />
                    <div className="h-7 w-7 rounded-full bg-gray-300 ring-2 ring-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#1B56DB]">50+</p>
                    <p className="text-[10px] text-gray-500">Dental Specialists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="animate-fade-up-delay-2 mt-16 grid grid-cols-3 gap-8 border-t border-blue-100 pt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">10+</p>
                <p className="mt-1 text-sm text-gray-500">Years Experience</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">1,200+</p>
                <p className="mt-1 text-sm text-gray-500">Happy Patients</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">4.9/5</p>
                <p className="mt-1 text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Services ─── */}
        <section id="services" className="bg-gradient-to-b from-white to-[#F5F8FF] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                <span className="text-[#0F2B6B]">Comprehensive</span>{" "}
                <span className="text-[#1B56DB]">Dental Care</span>
                <br /><span className="text-[#1B56DB]">Under One Roof</span>
              </h2>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { title: "General Dentistry", desc: "Routine check-ups, cleanings, and preventive dental care for the whole family.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { title: "Cosmetic Dentistry", desc: "Whitening, veneers, and smile makeovers for a confident, radiant smile.", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
                { title: "Orthodontics", desc: "Braces & clear aligners for all ages to straighten teeth and improve bite.", icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" },
                { title: "Pediatric Dentistry", desc: "Gentle dental care for your little ones in a fun, child-friendly setting.", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
                { title: "Restorative Dentistry", desc: "Fillings, crowns, bridges, and implants to restore your natural smile.", icon: "M11.42 15.17l-5.58-3.22a.96.96 0 010-1.65l5.58-3.22a2 2 0 012.16 0l5.58 3.22a.96.96 0 010 1.65l-5.58 3.22a2 2 0 01-2.16 0z" },
              ].map((svc) => (
                <div key={svc.title} className="group flex flex-col items-start rounded-2xl border-t-[3px] border-t-[#1B56DB] bg-white p-6 text-left shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-blue-200">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1B56DB] text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={svc.icon} />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">{svc.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{svc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Why Choose Us ─── */}
        <section id="why-us" className="relative overflow-hidden bg-gradient-to-b from-[#1B56DB] to-[#2563EB] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Why Choose{" "}
                <span className="text-blue-200">Bright Smile?</span>
              </h2>
            </div>

            <div className="mt-16 grid items-center gap-10 md:grid-cols-3">
              {/* Left pills */}
              <div className="flex flex-col items-end gap-4">
                {["Experienced, Caring Dentists", "Transparent Pricing", "Family-Friendly Environment"].map((label) => (
                  <div key={label} className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-md ring-1 ring-blue-100 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B56DB]">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                ))}
              </div>

              {/* Center image */}
              <div className="flex items-center justify-center">
                <Image src="/hero-dental-2.jpg" alt="Dental care" width={300} height={300} className="rounded-3xl object-cover shadow-xl" />
              </div>

              {/* Right pills */}
              <div className="flex flex-col items-start gap-4">
                {["Flexible Appointments", "Modern Equipment & Technology"].map((label) => (
                  <div key={label} className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-md ring-1 ring-blue-100 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B56DB]">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Meet the Experts ─── */}
        <section id="experts" className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-[#1B56DB]">Our Team</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                Meet the Smile Experts
              </h2>
            </div>

            <div className="mx-auto mt-14 max-w-4xl">
              <div className="grid items-center gap-8 md:grid-cols-2">
                {/* Doctor image */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="aspect-[4/5]">
                    <Image src="/hero-dental-1.jpg" alt="Dr. Alan Chen" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
                {/* Doctor info */}
                <div className="rounded-2xl bg-[#1B56DB] p-8 text-white">
                  <h3 className="text-2xl font-bold">Dr. Alan Chen, Orthodontist</h3>
                  <p className="mt-3 text-sm leading-relaxed text-blue-100">
                    Transforming smiles with braces & aligners. With years of experience in orthodontic care,
                    Dr. Chen brings precision and artistry to every smile makeover.
                  </p>
                  <div className="mt-6 flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-bold">4.9</p>
                      <div className="mt-0.5 flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                      <p className="text-2xl font-bold">8+</p>
                      <p className="text-xs text-blue-200">Years Exp.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-[#F5F8FF] to-[#EBF1FF] py-20 md:py-28">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute right-10 top-20 h-20 w-20 rounded-full border-2 border-blue-200/40" />
          <div className="pointer-events-none absolute left-20 bottom-10 h-12 w-12 rounded-full border-2 border-blue-200/30" />

          <div className="container mx-auto px-4">
            <div className="grid items-start gap-12 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-[#1B56DB]">How it works</p>
                <h2 className="mt-2 text-3xl font-bold text-[#0F2B6B] md:text-4xl">
                  Your Smile Journey<br />in 3 Easy Steps
                </h2>
                {/* Decorative star */}
                <svg className="mt-4 h-10 w-10 text-[#1B56DB]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
                </svg>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { step: "01", title: "Book Your Visit", desc: "Online or by phone", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
                  { step: "02", title: "Visit the Clinic", desc: "Friendly and expert care", icon: "M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21h13.5m-13.5-9h13.5m-13.5 0V3m13.5 9V3" },
                  { step: "03", title: "Leave Smiling", desc: "Healthier, brighter teeth", icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" },
                ].map((s) => (
                  <div key={s.step} className="group flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B56DB] text-sm font-bold text-white">
                      {s.step}
                    </div>
                    <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                      <svg className="h-6 w-6 text-[#1B56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                      </svg>
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900">{s.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-[#1B56DB]">Testimonials</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                  What Our<br />
                  <span className="text-[#1B56DB]">Patients Say</span>
                </h2>
                <p className="mt-3 max-w-md text-sm text-gray-500">
                  Real stories from real patients who found their best smiles with us.
                </p>
              </div>
              <Link href="/register">
                <Button variant="outline" className="border-[#1B56DB] text-[#1B56DB] hover:bg-blue-50">
                  More Testimonials
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { quote: "The entire staff is extremely helpful and professional. 10/10!", name: "Priya Sharma", role: "Regular Patient" },
                { quote: "I used to be terrified of the dentist. Now I look forward to my visits. Their gentle care is unmatched.", name: "Rajesh Patel", role: "Patient since 2022" },
                { quote: "I got my teeth whitened here and the results are absolutely amazing. Highly recommend!", name: "Anita Desai", role: "Cosmetic Patient" },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl bg-[#1B56DB] p-6 text-white transition-all hover:-translate-y-1 hover:shadow-xl">
                  <svg className="h-8 w-8 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                  <p className="mt-4 text-sm leading-relaxed text-blue-50">{t.quote}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-blue-200">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <FAQ />

        {/* ─── CTA ─── */}
        <section className="relative overflow-hidden bg-[#1B56DB] py-20 md:py-28">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-10 bottom-0 opacity-20">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" />
              <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="pointer-events-none absolute right-10 top-10 opacity-10">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="35" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Left: Tooth illustration area */}
              <div className="hidden items-center justify-center md:flex">
                <div className="relative">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full bg-white/10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                  </div>
                  {/* Sparkles */}
                  <svg className="absolute -right-4 -top-4 h-6 w-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
                  </svg>
                  <svg className="absolute -left-6 top-2 h-4 w-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
                  </svg>
                </div>
              </div>

              {/* Right: CTA text */}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                  Book Your Visit.{" "}
                  <span className="text-blue-200">Your Smile Deserves It!</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-blue-100">
                  Stop missing calls and losing patients. Let Bright Smile handle your reception 24/7
                  while you focus on what you do best — creating beautiful smiles.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
                  <Link href="/login">
                    <Button size="lg" className="bg-white text-[#1B56DB] text-base shadow-lg hover:bg-blue-50 hover:-translate-y-0.5 transition-all">
                      Book Appointment
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="border-white text-white text-base hover:bg-white/10 hover:-translate-y-0.5 transition-all">
                      Call Us Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0F2B6B] text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2">
                <svg className="h-7 w-7 text-blue-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
                </svg>
                <span className="text-xl font-bold">Bright Smile</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-blue-200">
                Experience gentle, expert dental care in a warm and modern environment. Your smile is our priority.
              </p>
              <div className="mt-5 flex gap-3">
                {["twitter", "facebook", "linkedin"].map((social) => (
                  <button key={social} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-200 transition-colors hover:bg-white/20 hover:text-white">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
              <ul className="mt-4 space-y-2.5">
                {["Home", "Services", "About Us", "Contact"].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-blue-200 transition-colors hover:text-white">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Services</h4>
              <ul className="mt-4 space-y-2.5">
                {["General Dentistry", "Cosmetic Dentistry", "Orthodontics", "Pediatric Care"].map((svc) => (
                  <li key={svc}>
                    <Link href="#services" className="text-sm text-blue-200 transition-colors hover:text-white">{svc}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-blue-200">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  123 Dental Avenue, Suite 100
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  hello@dentai.com
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-blue-300">
              &copy; {new Date().getFullYear()} Bright Smile. All rights reserved. |{" "}
              <Link href="#" className="hover:text-white">Privacy Policy</Link> |{" "}
              <Link href="#" className="hover:text-white">Terms of Service</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
