import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-xl font-bold">DentAI</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Dental Clinic&apos;s AI Receptionist
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Answer every call, book appointments 24/7, and recover missed patients automatically.
            Never miss a patient again.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Start Free 14-Day Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-base">
                View Pricing
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Answers Every Call</h3>
                <p className="text-sm text-muted-foreground">
                  24/7 AI voice receptionist that handles calls professionally, even after hours.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Books Appointments</h3>
                <p className="text-sm text-muted-foreground">
                  Direct Google Calendar integration. Patients book instantly during the conversation.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Recovers Missed Leads</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic SMS follow-up for every missed call and interested patient.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Trusted by <span className="font-bold text-foreground">50+</span> dental clinics across the country
            </p>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Simple, Transparent Pricing</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { name: "Starter", price: "$297", features: ["Chat widget only", "500 conversations/mo", "Google Calendar integration", "Email support"] },
                { name: "Growth", price: "$497", features: ["Chat + voice AI", "1,000 conversations/mo", "SMS follow-ups", "Full dashboard", "Priority support"], popular: true },
                { name: "Pro", price: "$797", features: ["Everything unlimited", "Custom integrations", "Dedicated account manager", "White-label option"] },
              ].map((plan) => (
                <div key={plan.name} className={`rounded-lg border bg-card p-8 ${plan.popular ? "ring-2 ring-primary" : ""}`}>
                  {plan.popular && (
                    <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
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
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "How does the AI receptionist work?", a: "Our AI uses advanced language models to understand patient requests, answer questions about your clinic, and book appointments directly into your Google Calendar. It handles calls via voice AI and chats via an embeddable widget on your website." },
                { q: "Can patients really book appointments through the AI?", a: "Yes! The AI checks your real-time availability in Google Calendar and books confirmed appointments. Patients receive an SMS confirmation immediately." },
                { q: "What happens after hours?", a: "The AI works 24/7. After hours, it can still answer questions, capture lead information, and let patients know when to expect a callback." },
                { q: "Is my patient data secure?", a: "Absolutely. All data is encrypted in transit and at rest. We follow strict data handling practices and never share patient information with third parties." },
                { q: "Can I customize what the AI says?", a: "Yes. You can customize the greeting, tone, language, emergency policy, and add custom FAQ responses through your dashboard settings." },
              ].map((faq) => (
                <div key={faq.q} className="rounded-lg border p-6">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DentAI Receptionist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
