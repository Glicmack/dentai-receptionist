"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useClinic } from "@/hooks/useClinic"

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    monthlyPrice: 4999,
    annualPrice: 3999,
    features: [
      "Chat widget only",
      "500 conversations/month",
      "Google Calendar integration",
      "Appointment booking",
      "Lead capture",
      "Email support",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    monthlyPrice: 9999,
    annualPrice: 7999,
    popular: true,
    features: [
      "Chat + voice AI",
      "1,000 conversations/month",
      "SMS follow-ups & reminders",
      "Full analytics dashboard",
      "Lead management",
      "Priority support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthlyPrice: 19999,
    annualPrice: 15999,
    features: [
      "Everything unlimited",
      "Unlimited conversations",
      "Custom AI personality",
      "Custom integrations",
      "Dedicated account manager",
      "White-label option",
    ],
  },
]

function PricingContent() {
  const [annual, setAnnual] = useState(false)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null)
  const { clinic, loading } = useClinic()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isLoggedIn = !!clinic
  const currentPlan = clinic?.plan || "trial"

  // Handle ?plan= query param - highlight and scroll to selected plan
  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam && PLANS.some((p) => p.key === planParam)) {
      setHighlightedPlan(planParam)
      // Scroll to plan card after a short delay for rendering
      setTimeout(() => {
        planRefs.current[planParam]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 300)
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => setHighlightedPlan(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  async function handleSubscribe(planKey: string) {
    if (!isLoggedIn) {
      router.push("/register")
      return
    }

    // If already on this plan, go to billing portal
    if (currentPlan === planKey) {
      await openBillingPortal()
      return
    }

    setSubscribing(planKey)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, annual }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Failed to start checkout")
        return
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setSubscribing(null)
    }
  }

  async function openBillingPortal() {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Failed to open billing portal")
        return
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch {
      alert("Something went wrong. Please try again.")
    }
  }

  function getButtonText(planKey: string) {
    if (subscribing === planKey) return "Redirecting..."
    if (!isLoggedIn || loading) return "Start Free 14-Day Trial"
    if (currentPlan === planKey) return "Manage Billing"
    if (currentPlan === "trial") return "Subscribe"
    return "Switch Plan"
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="text-xl font-bold">DentAI</span>
          </Link>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="shadow-md shadow-primary/20">Start Free Trial</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Gradient Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 py-16 text-center text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Simple, Transparent Pricing</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
            {isLoggedIn
              ? "Choose the plan that fits your clinic"
              : "Start with a 14-day free trial. No credit card required."}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Label htmlFor="annual" className="text-sm text-blue-100 cursor-pointer">Monthly</Label>
            <Switch id="annual" checked={annual} onCheckedChange={setAnnual} />
            <Label htmlFor="annual" className="text-sm text-blue-100 cursor-pointer">
              Annual <span className="font-medium text-white">(Save 20%)</span>
            </Label>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.key

            const isHighlighted = highlightedPlan === plan.key

            return (
              <div
                key={plan.name}
                ref={(el) => { planRefs.current[plan.key] = el }}
                className={`group relative rounded-xl border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular && !isCurrentPlan && !isHighlighted
                    ? "scale-[1.02] border-primary/30 shadow-lg shadow-primary/10 md:scale-105"
                    : "hover:border-primary/20"
                } ${isCurrentPlan ? "ring-2 ring-green-500 shadow-lg" : ""} ${
                  isHighlighted ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 scale-[1.03] -translate-y-1" : ""
                }`}
              >
                {plan.popular && !isCurrentPlan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-1 text-xs font-medium text-white shadow-md">
                    Most Popular
                  </span>
                )}
                {isCurrentPlan && (
                  <Badge className="mb-4 bg-green-500 hover:bg-green-600">
                    Current Plan
                  </Badge>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-5xl font-bold">
                    ₹{(annual ? plan.annualPrice : plan.monthlyPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </p>
                {annual && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    ₹{(plan.annualPrice * 12).toLocaleString("en-IN")}/year (save ₹{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString("en-IN")}/year)
                  </p>
                )}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 w-full ${plan.popular ? "shadow-md shadow-primary/20" : ""}`}
                  variant={plan.popular || isCurrentPlan ? "default" : "outline"}
                  size="lg"
                  disabled={!!subscribing || loading}
                  onClick={() => handleSubscribe(plan.key)}
                >
                  {getButtonText(plan.key)}
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  )
}
