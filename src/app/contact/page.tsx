"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", clinicName: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        toast({ title: data.error || "Failed to send message", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error. Please try again.", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <span className="text-lg font-bold">D</span>
            </div>
            <span className="text-2xl font-bold">DentAI</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
              Ready to automate your front desk?
            </h2>
            <ul className="space-y-4 text-blue-100">
              {[
                "AI receptionist available 24/7",
                "Automated appointment booking",
                "Setup and onboarding support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-blue-200">
            We&apos;ll get back to you within 24 hours
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {submitted ? (
          <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm animate-scale-in">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Message Sent!</CardTitle>
              <CardDescription>
                Thank you for your interest. Our team will contact you within 24 hours to schedule a setup meeting.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Link href="/login">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm animate-scale-in">
            <CardHeader className="text-center">
              <div className="lg:hidden mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
                <span className="text-lg font-bold text-white">D</span>
              </div>
              <CardTitle className="text-2xl">Get Started with DentAI</CardTitle>
              <CardDescription>Fill out the form below and we&apos;ll set up your clinic account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. John Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@clinic.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    placeholder="Bright Smile Dental"
                    value={form.clinicName}
                    onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your clinic and what you're looking for..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
