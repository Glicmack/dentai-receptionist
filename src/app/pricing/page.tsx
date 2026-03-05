"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useClinic } from "@/hooks/useClinic"

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    monthlyPrice: 297,
    annualPrice: 237,
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
    monthlyPrice: 497,
    annualPrice: 397,
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
    monthlyPrice: 797,
    annualPrice: 637,
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

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const { clinic, loading } = useClinic()
  const router = useRouter()

  const isLoggedIn = !!clinic
  const currentPlan = clinic?.plan || "trial"

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
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
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
                  <Button size="sm">Start Free Trial</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {isLoggedIn
              ? "Choose the plan that fits your clinic"
              : "Start with a 14-day free trial. No credit card required."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Label htmlFor="annual" className="text-sm">Monthly</Label>
            <Switch id="annual" checked={annual} onCheckedChange={setAnnual} />
            <Label htmlFor="annual" className="text-sm">
              Annual <span className="text-primary font-medium">(Save 20%)</span>
            </Label>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.key

            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border bg-card p-8 ${
                  plan.popular && !isCurrentPlan ? "ring-2 ring-primary shadow-lg" : ""
                } ${isCurrentPlan ? "ring-2 ring-green-500 shadow-lg" : ""}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
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
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </p>
                {annual && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    ${plan.annualPrice * 12}/year (save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year)
                  </p>
                )}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
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
