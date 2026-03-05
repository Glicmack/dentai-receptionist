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
        <section className="relative overflow-hidden bg-hero-gradient py-28 md:py-36">
          {/* Floating blur orbs */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-float" />
          <div className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl animate-float" style={{ animationDelay: "4s" }} />

          <div className="container relative mx-auto px-4 text-center">
            {/* Badge */}
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              AI-Powered Dental Reception
            </div>

            <h1 className="animate-fade-up-delay-1 mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Dental Clinic&apos;s{" "}
              <span className="text-gradient">AI Receptionist</span>
            </h1>
            <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Answer every call, book appointments 24/7, and recover missed patients automatically.
              Never miss a patient again.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                  Start Free 14-Day Trial
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base hover:-translate-y-0.5">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-up-delay-4 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["No credit card required", "14-day free trial", "Cancel anytime"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </span>
              ))}
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
        <section className="border-t border-b bg-muted/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by <span className="font-bold text-foreground">50+</span> dental clinics across the country
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
              {["SmileCare", "BrightDental", "PearlSmile", "DentaPlus", "OralFirst"].map((name) => (
                <div key={name} className="flex items-center gap-2 text-lg font-bold text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-muted-foreground/20" />
                  {name}
                </div>
              ))}
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
                { name: "Starter", price: "₹4,999", features: ["Chat widget only", "500 conversations/mo", "Google Calendar integration", "Email support"] },
                { name: "Growth", price: "₹9,999", features: ["Chat + voice AI", "1,000 conversations/mo", "SMS follow-ups", "Full dashboard", "Priority support"], popular: true },
                { name: "Pro", price: "₹19,999", features: ["Everything unlimited", "Custom integrations", "Dedicated account manager", "White-label option"] },
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
                  <Link href="/register" className="mt-8 block">
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
