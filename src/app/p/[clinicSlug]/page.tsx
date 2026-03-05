"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneInput } from "@/components/ui/phone-input"
import { OTPInput } from "@/components/patient/OTPInput"
import { useToast } from "@/hooks/use-toast"

type Step = "phone" | "otp" | "verifying"

export default function PatientPortalLoginPage() {
  const params = useParams()
  const clinicSlug = params.clinicSlug as string
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [clinicName, setClinicName] = useState("")
  const [cooldown, setCooldown] = useState(0)

  // Load clinic name
  useEffect(() => {
    fetch(`/api/patient/${clinicSlug}/clinic`)
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setClinicName(data.name)
      })
      .catch(() => {})
  }, [clinicSlug])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSendOTP() {
    if (!phone) {
      toast({ title: "Please enter your phone number", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/patient/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, clinicSlug }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || "Failed to send code", variant: "destructive" })
      } else {
        setStep("otp")
        setCooldown(60)
        toast({ title: "Verification code sent!" })
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" })
    }
    setLoading(false)
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) {
      toast({ title: "Please enter the 6-digit code", variant: "destructive" })
      return
    }
    setStep("verifying")
    setLoading(true)
    try {
      const res = await fetch("/api/patient/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, clinicSlug }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: data.error || "Invalid code",
          description:
            data.attemptsRemaining !== undefined
              ? `${data.attemptsRemaining} attempts remaining`
              : undefined,
          variant: "destructive",
        })
        setStep("otp")
      } else {
        toast({ title: `Welcome back, ${data.patientName}!` })
        router.push(`/p/${clinicSlug}/appointments`)
        router.refresh()
      }
    } catch {
      toast({ title: "Verification failed", variant: "destructive" })
      setStep("otp")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <CardTitle className="text-xl">
            {clinicName || "Patient Portal"}
          </CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Enter your phone number to view your appointments"
              : "Enter the verification code sent to your phone"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "phone" && (
            <>
              <div className="space-y-2">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="Your phone number"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendOTP}
                disabled={loading || !phone}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We&apos;ll send a 6-digit code to verify your identity
              </p>
            </>
          )}

          {(step === "otp" || step === "verifying") && (
            <>
              <div className="rounded-lg bg-muted/50 p-3 text-center text-sm">
                Code sent to <span className="font-medium">{phone}</span>
                <button
                  onClick={() => { setStep("phone"); setOtp("") }}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Change
                </button>
              </div>
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={step === "verifying"}
              />
              <Button
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {step === "verifying" ? "Verifying..." : "Verify Code"}
              </Button>
              <div className="text-center">
                <button
                  onClick={handleSendOTP}
                  disabled={cooldown > 0 || loading}
                  className="text-sm text-blue-600 hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
