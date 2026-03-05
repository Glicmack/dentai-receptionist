"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClinicDetailsStep } from "@/components/onboarding/ClinicDetailsStep"
import { BusinessHoursStep } from "@/components/onboarding/BusinessHoursStep"
import { ServicesStep } from "@/components/onboarding/ServicesStep"
import { InsuranceStep } from "@/components/onboarding/InsuranceStep"
import { GoogleCalendarStep } from "@/components/onboarding/GoogleCalendarStep"
import { SetupCompleteStep } from "@/components/onboarding/SetupCompleteStep"
import { useToast } from "@/hooks/use-toast"
import type { BusinessHours, Service } from "@/types"

const STEPS = [
  { title: "Clinic Details", description: "Tell us about your practice" },
  { title: "Business Hours", description: "Set your operating hours" },
  { title: "Services", description: "What services do you offer?" },
  { title: "Insurance", description: "Which insurance do you accept?" },
  { title: "Google Calendar", description: "Connect for appointment booking" },
  { title: "All Done!", description: "Your AI receptionist is ready" },
]

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "09:00", close: "13:00", closed: false },
  sunday: { open: null, close: null, closed: true },
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [clinicId, setClinicId] = useState<string | null>(null)

  // Step data
  const [clinicDetails, setClinicDetails] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    website: "",
    timezone: "America/New_York",
  })
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS)
  const [services, setServices] = useState<Service[]>([])
  const [insurance, setInsurance] = useState<string[]>([])
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [clinicSlug, setClinicSlug] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Load existing clinic data on mount
  useEffect(() => {
    async function loadClinic() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

      if (!userData?.clinic_id) return
      setClinicId(userData.clinic_id)

      const { data: clinic } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", userData.clinic_id)
        .single()

      if (clinic) {
        setClinicDetails({
          name: clinic.name || "",
          phone: clinic.phone || "",
          address: clinic.address || "",
          city: clinic.city || "",
          state: clinic.state || "",
          zip: clinic.zip || "",
          website: clinic.website || "",
          timezone: clinic.timezone || "America/New_York",
        })
        setClinicSlug(clinic.slug || "")
        if (clinic.hours) setHours(clinic.hours)
        if (clinic.services) setServices(clinic.services)
        if (clinic.insurance_accepted) setInsurance(clinic.insurance_accepted)
        setCalendarConnected(clinic.google_calendar_connected || false)
      }
    }
    loadClinic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveStepData(): Promise<boolean> {
    if (!clinicId) return false

    setLoading(true)
    let updateData = {}

    switch (step) {
      case 0:
        updateData = clinicDetails
        break
      case 1:
        updateData = { hours }
        break
      case 2:
        updateData = { services }
        break
      case 3:
        updateData = { insurance_accepted: insurance }
        break
    }

    const { error } = await supabase
      .from("clinics")
      .update(updateData)
      .eq("id", clinicId)

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
      return false
    }
    setLoading(false)
    return true
  }

  async function handleNext() {
    if (step < 4) {
      const saved = await saveStepData()
      if (!saved) return
    }
    setStep(step + 1)
  }

  function handleBack() {
    setStep(step - 1)
  }

  function handleConnectCalendar() {
    // Redirect to Google OAuth - will be implemented in Phase 7
    window.location.href = "/api/google/connect"
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}% complete</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="mt-4 flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                  i < step
                    ? "bg-blue-500 text-white"
                    : i === step
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-110"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`hidden sm:block text-[10px] ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <ClinicDetailsStep data={clinicDetails} onChange={setClinicDetails} />
          )}
          {step === 1 && (
            <BusinessHoursStep data={hours} onChange={setHours} />
          )}
          {step === 2 && (
            <ServicesStep data={services} onChange={setServices} />
          )}
          {step === 3 && (
            <InsuranceStep data={insurance} onChange={setInsurance} />
          )}
          {step === 4 && (
            <GoogleCalendarStep
              connected={calendarConnected}
              onConnect={handleConnectCalendar}
              onSkip={() => setStep(5)}
            />
          )}
          {step === 5 && (
            <SetupCompleteStep
              clinic={{
                ...clinicDetails,
                services,
                insurance_accepted: insurance,
                google_calendar_connected: calendarConnected,
                slug: clinicSlug,
              }}
              onGoToDashboard={() => router.push("/dashboard")}
            />
          )}
        </CardContent>
        {step < 5 && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 4 && (
              <Button onClick={handleNext} disabled={loading}>
                {loading ? "Saving..." : "Next"}
              </Button>
            )}
            {step === 4 && !calendarConnected && (
              <Button onClick={handleNext}>
                Skip
              </Button>
            )}
            {step === 4 && calendarConnected && (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
