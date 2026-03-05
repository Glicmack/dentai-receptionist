import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/MobileNav"
import { FAQ } from "@/components/FAQ"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="text-xl font-bold">DentAI</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-md shadow-primary/20">Start Free Trial</Button>
            </Link>
          </nav>
          <MobileNav />
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-white py-16 md:py-20 lg:py-28">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-50/50 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
              {/* Left Content */}
              <div>
                <h1 className="animate-fade-up text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Welcome to DentAI{" "}
                  <svg width="28" height="28" className="mb-1 inline-block text-blue-500 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.937A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.962 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .962L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.962 0z" />
                  </svg>
                  <br />
                  <span className="text-gradient">Dental Care</span>
                </h1>
                <p className="animate-fade-up-delay-1 mt-6 max-w-lg text-lg text-muted-foreground">
                  Our AI-powered dental receptionist answers every call, books appointments 24/7,
                  and recovers missed patients &mdash; personalized care tailored to your clinic&apos;s needs.
                </p>
                <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-4">
                  <Link href="/register">
                    <Button size="lg" className="text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                      Start Free Trial
                      <svg width="16" height="16" className="ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="text-base border-primary text-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all">
                      Schedule a Call
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Images */}
              <div className="animate-fade-up-delay-1 relative mx-auto w-full max-w-lg md:max-w-none">
                {/* Main image - top right */}
                <div className="relative ml-auto w-[85%] overflow-hidden rounded-2xl shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-blue-50 to-white">
                    {/* Replace with: <Image src="/hero-dental-1.jpg" alt="Dental care" fill className="object-cover" /> */}
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
                      <svg width="80" height="80" className="text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-300">Dental Professional</span>
                    </div>
                  </div>
                </div>

                {/* Secondary image - bottom left, overlapping */}
                <div className="absolute -bottom-6 left-0 z-10 w-[60%] overflow-hidden rounded-2xl border-4 border-white shadow-xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-sky-100 via-blue-50 to-white">
                    {/* Replace with: <Image src="/hero-dental-2.jpg" alt="Patient care" fill className="object-cover" /> */}
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
                      <svg width="56" height="56" className="text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                      </svg>
                      <span className="text-xs font-medium text-blue-300">Patient Care</span>
                    </div>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute -right-2 bottom-4 z-20 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-blue-500 sm:h-28 sm:w-28 md:-right-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C10.08 2 8.5 3.87 7.5 5c-.58.66-1.36 1-2.24 1C4.56 6 4 6.56 4 7.26c0 .53.15 1.03.43 1.47C3.56 9.64 3 10.96 3 12.4c0 1.2.36 2.34.97 3.29C4.34 16.82 5 18 6 19.5 7.58 21.93 9 22 12 22s4.42-.07 6-2.5c1-1.5 1.66-2.68 2.03-3.81.61-.95.97-2.09.97-3.29 0-1.44-.56-2.76-1.43-3.67.28-.44.43-.94.43-1.47C20 6.56 19.44 6 18.74 6c-.88 0-1.66-.34-2.24-1C15.5 3.87 13.92 2 12 2z" />
                    </svg>
                  </div>
                  <span className="mt-1 text-sm font-bold text-blue-700">AI-Powered</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">24/7 Service</span>
                </div>
              </div>
            </div>

            {/* Trust Logos */}
            <div className="animate-fade-up-delay-3 mt-20 border-t pt-10">
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-50 grayscale">
                {[
                  { name: "SmileCare", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                  { name: "BrightDental", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
                  { name: "PearlSmile", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" },
                  { name: "DentaPlus", icon: "M12 4.5v15m7.5-7.5h-15" },
                  { name: "OralFirst", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
                ].map((brand) => (
                  <div key={brand.name} className="flex items-center gap-2 text-lg font-bold text-muted-foreground transition-opacity hover:opacity-80">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={brand.icon} />
                    </svg>
                    {brand.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Everything your front desk needs,{" "}
                <span className="text-gradient">automated</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                From answering calls to booking appointments, DentAI handles it all so your team can focus on patient care.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  title: "Answers Every Call",
                  desc: "24/7 AI voice receptionist that handles calls professionally, even after hours.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: "Books Appointments",
                  desc: "Direct Google Calendar integration. Patients book instantly during the conversation.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  title: "Recovers Missed Leads",
                  desc: "Automatic SMS follow-up for every missed call and interested patient.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-colors duration-300 group-hover:from-blue-500 group-hover:to-blue-700 group-hover:text-white">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-t border-b bg-muted/30 py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by <span className="font-bold text-foreground">50+</span> dental clinics across the country
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              The Reasons DentAI{" "}
              <span className="text-gradient">is Unbeatable</span>
            </h2>
            <div className="mx-auto mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { value: "50+", label: "Dental Clinics", highlighted: false },
                { value: "5+", label: "Years Experience", highlighted: true },
                { value: "16k+", label: "Satisfied Patients", highlighted: false },
                { value: "24/7", label: "AI Availability", highlighted: false },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div
                    className={`flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 shadow-md transition-transform hover:scale-105 md:h-32 md:w-32 ${
                      stat.highlighted
                        ? "border-blue-600 bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                        : "border-blue-200 bg-white text-foreground"
                    }`}
                  >
                    <span className="text-2xl font-bold md:text-3xl">{stat.value}</span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider md:text-xs ${stat.highlighted ? "text-blue-100" : "text-muted-foreground"}`}>
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 text-white">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
              What Makes Us Different<br />From Others
            </h2>

            <div className="grid items-center gap-10 md:grid-cols-2">
              {/* Left - Feature Cards */}
              <div className="space-y-5">
                {[
                  {
                    num: "01",
                    title: "Advanced Technology",
                    desc: "We use AI-powered tools such as voice recognition, smart scheduling, and real-time analytics. Our goal is to ensure efficient operations and exceptional patient experience.",
                  },
                  {
                    num: "02",
                    title: "A Dedicated AI Team",
                    desc: "Your AI receptionist works 24/7 without breaks. It answers every call, books appointments, captures leads, and follows up — so your team can focus on patient care.",
                  },
                  {
                    num: "03",
                    title: "Personalized Care",
                    desc: "Our AI is customized to your clinic. It learns your services, hours, tone, and policies — creating personalized interactions that feel natural and professional.",
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="rounded-xl bg-white p-6 text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    <span className="text-sm font-bold text-blue-600">{item.num}</span>
                    <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Right - Image Placeholder */}
              <div className="relative mx-auto w-full max-w-md">
                <div className="overflow-hidden rounded-2xl shadow-2xl">
                  <div className="aspect-[3/4] bg-gradient-to-br from-blue-400/30 via-blue-300/20 to-white/10">
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
                      <svg width="80" height="80" className="text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                      </svg>
                      <span className="text-sm font-medium text-white/40">Dental Care</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-10 text-white shadow-xl shadow-blue-500/20 md:flex-row md:px-12">
              <div>
                <h3 className="text-2xl font-bold md:text-3xl">Premium AI Receptionist at Affordable Prices</h3>
                <p className="mt-2 max-w-lg text-blue-100">
                  Transform your dental clinic&apos;s front desk with AI that works 24/7 &mdash; starting at just ₹4,999/month.
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:-translate-y-0.5 transition-all">
                    Get Started
                  </Button>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-10 items-center justify-center rounded-md border-2 border-white/30 px-8 text-sm font-medium text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, Transparent Pricing</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Choose the plan that fits your clinic. All plans include a 14-day free trial.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { key: "starter", name: "Starter", price: "₹4,999", features: ["Chat widget only", "500 conversations/mo", "Google Calendar integration", "Email support"] },
                { key: "growth", name: "Growth", price: "₹9,999", features: ["Chat + voice AI", "1,000 conversations/mo", "SMS follow-ups", "Full dashboard", "Priority support"], popular: true },
                { key: "pro", name: "Pro", price: "₹19,999", features: ["Everything unlimited", "Custom integrations", "Dedicated account manager", "White-label option"] },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative rounded-xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    plan.popular
                      ? "scale-[1.02] border-primary/30 shadow-lg shadow-primary/10 md:scale-105"
                      : "hover:border-primary/20"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-1 text-xs font-medium text-white shadow-md">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/pricing?plan=${plan.key}`} className="mt-8 block">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Patient Reviews - Sliding Marquee */}
        <section className="overflow-hidden py-20">
          <div className="container mx-auto px-4">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                What Our Patients Say{" "}
                <span className="text-gradient">About Us</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Real stories from dental clinics using DentAI to transform their patient experience.
              </p>
            </div>
          </div>

          {/* Row 1 - slides left to right */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent md:w-40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent md:w-40" />
            <div className="flex animate-marquee-left gap-6 py-2">
              {[
                {
                  name: "Dr. Priya Sharma",
                  role: "Smile Care Dental Clinic",
                  review: "DentAI has completely transformed how we handle patient calls. We never miss an appointment request now, and our patients love the 24/7 availability.",
                },
                {
                  name: "Dr. Rajesh Patel",
                  role: "BrightSmile Dentistry",
                  review: "The AI receptionist sounds so natural that most patients don't even realize they're talking to AI. Our no-show rate dropped by 40% since we started using it.",
                },
                {
                  name: "Dr. Anita Desai",
                  role: "Pearl Dental Studio",
                  review: "Setting up was incredibly easy. Within a day, our AI receptionist was answering calls, booking appointments, and following up with leads automatically.",
                },
                {
                  name: "Dr. Priya Sharma",
                  role: "Smile Care Dental Clinic",
                  review: "DentAI has completely transformed how we handle patient calls. We never miss an appointment request now, and our patients love the 24/7 availability.",
                },
                {
                  name: "Dr. Rajesh Patel",
                  role: "BrightSmile Dentistry",
                  review: "The AI receptionist sounds so natural that most patients don't even realize they're talking to AI. Our no-show rate dropped by 40% since we started using it.",
                },
                {
                  name: "Dr. Anita Desai",
                  role: "Pearl Dental Studio",
                  review: "Setting up was incredibly easy. Within a day, our AI receptionist was answering calls, booking appointments, and following up with leads automatically.",
                },
              ].map((review, idx) => (
                <div
                  key={`row1-${idx}`}
                  className="w-[320px] flex-shrink-0 rounded-xl border bg-card p-6 shadow-sm md:w-[380px]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                    </svg>
                  </div>
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{review.review}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
                      {review.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - slides right to left */}
          <div className="relative mt-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent md:w-40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent md:w-40" />
            <div className="flex animate-marquee-right gap-6 py-2">
              {[
                {
                  name: "Dr. Vikram Singh",
                  role: "DentaCare Plus",
                  review: "We used to lose so many patients to missed calls after hours. DentAI captures every single lead now. Our revenue has grown significantly since implementing it.",
                },
                {
                  name: "Dr. Meera Kapoor",
                  role: "Gentle Touch Dental",
                  review: "The best investment we've made for our practice. The SMS follow-ups for missed calls alone have recovered dozens of patients we would have lost otherwise.",
                },
                {
                  name: "Dr. Arjun Mehta",
                  role: "Metro Dental Clinic",
                  review: "Our front desk staff can finally focus on in-office patients instead of being glued to the phone. DentAI handles the calls better than we ever expected.",
                },
                {
                  name: "Dr. Vikram Singh",
                  role: "DentaCare Plus",
                  review: "We used to lose so many patients to missed calls after hours. DentAI captures every single lead now. Our revenue has grown significantly since implementing it.",
                },
                {
                  name: "Dr. Meera Kapoor",
                  role: "Gentle Touch Dental",
                  review: "The best investment we've made for our practice. The SMS follow-ups for missed calls alone have recovered dozens of patients we would have lost otherwise.",
                },
                {
                  name: "Dr. Arjun Mehta",
                  role: "Metro Dental Clinic",
                  review: "Our front desk staff can finally focus on in-office patients instead of being glued to the phone. DentAI handles the calls better than we ever expected.",
                },
              ].map((review, idx) => (
                <div
                  key={`row2-${idx}`}
                  className="w-[320px] flex-shrink-0 rounded-xl border bg-card p-6 shadow-sm md:w-[380px]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                    </svg>
                  </div>
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{review.review}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
                      {review.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ />

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white shadow-xl shadow-blue-500/20">
              <h2 className="text-3xl font-bold md:text-4xl">Ready to never miss a patient?</h2>
              <p className="mx-auto mt-4 max-w-lg text-blue-100">
                Join 50+ dental clinics using DentAI to automate their front desk and grow their practice.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-base shadow-lg hover:-translate-y-0.5">
                    Get Started Free
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
                  <span className="text-sm font-bold text-white">D</span>
                </div>
                <span className="text-xl font-bold">DentAI</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                AI-powered receptionist for modern dental clinics.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link></li>
                <li><Link href="/register" className="transition-colors hover:text-foreground">Start Free Trial</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="transition-colors hover:text-foreground">About</Link></li>
                <li><Link href="#" className="transition-colors hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="transition-colors hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="transition-colors hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DentAI Receptionist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
