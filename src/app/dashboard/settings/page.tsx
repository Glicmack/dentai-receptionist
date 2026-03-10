"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useClinic } from "@/hooks/useClinic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PhoneInput } from "@/components/ui/phone-input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/useUser"
import { BusinessHoursStep } from "@/components/onboarding/BusinessHoursStep"
import { ServicesStep } from "@/components/onboarding/ServicesStep"
import { InsuranceStep } from "@/components/onboarding/InsuranceStep"
import type { Clinic, BusinessHours, Service } from "@/types"

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const { clinic, loading, refetch } = useClinic()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [saving, setSaving] = useState(false)

  // Team management state
  const isAdmin = currentUser && ["owner", "admin"].includes(currentUser.role)
  const [members, setMembers] = useState<Array<{
    id: string; email: string; full_name: string | null; role: string; created_at: string
  }>>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [newMember, setNewMember] = useState({ email: "", fullName: "", role: "staff" })

  // Show success toast when returning from Stripe Checkout
  useEffect(() => {
    if (searchParams.get("success") === "subscribed") {
      toast({ title: "Subscription activated! Welcome aboard." })
      refetch()
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/settings")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Local state for editing
  const [profile, setProfile] = useState({
    name: "", phone: "", address: "", city: "", state: "", zip: "", website: "", timezone: "",
  })
  const [hours, setHours] = useState<BusinessHours | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [insurance, setInsurance] = useState<string[]>([])
  const [aiSettings, setAiSettings] = useState({
    ai_greeting: "", ai_tone: "professional", ai_language: "english", emergency_policy: "",
  })
  const [whatsappSettings, setWhatsappSettings] = useState({
    whatsapp_enabled: false,
    whatsapp_phone_number: "",
    google_review_url: "",
  })

  // Load clinic data into local state
  useEffect(() => {
    if (!clinic) return
    setProfile({
      name: clinic.name || "", phone: clinic.phone || "", address: clinic.address || "",
      city: clinic.city || "", state: clinic.state || "", zip: clinic.zip || "",
      website: clinic.website || "", timezone: clinic.timezone || "America/New_York",
    })
    setHours(clinic.hours)
    setServices(clinic.services || [])
    setInsurance(clinic.insurance_accepted || [])
    setAiSettings({
      ai_greeting: clinic.ai_greeting || "",
      ai_tone: clinic.ai_tone || "professional",
      ai_language: clinic.ai_language || "english",
      emergency_policy: clinic.emergency_policy || "",
    })
    setWhatsappSettings({
      whatsapp_enabled: clinic.whatsapp_enabled || false,
      whatsapp_phone_number: clinic.whatsapp_phone_number || "",
      google_review_url: clinic.google_review_url || "",
    })
  }, [clinic])

  async function save(data: Partial<Clinic>) {
    if (!clinic) return
    setSaving(true)

    try {
      // Convert empty strings to null for nullable fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      )

      const response = await fetch(`/api/clinics/${clinic.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      })

      if (response.ok) {
        toast({ title: "Settings saved" })
        refetch()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({ title: errorData.error || "Failed to save settings", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error. Please try again.", variant: "destructive" })
    }
    setSaving(false)
  }

  // Team functions
  async function fetchMembers() {
    setMembersLoading(true)
    try {
      const res = await fetch("/api/team")
      if (res.ok) setMembers(await res.json())
    } catch { /* silent */ }
    setMembersLoading(false)
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: `Invited ${newMember.fullName}` })
        setAddDialogOpen(false)
        setNewMember({ email: "", fullName: "", role: "staff" })
        fetchMembers()
      } else {
        toast({ title: data.error || "Failed to invite", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    }
    setInviting(false)
  }

  async function removeMember(id: string, name: string) {
    if (!confirm(`Remove ${name} from the team?`)) return
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: `${name} removed` })
        fetchMembers()
      } else {
        const data = await res.json()
        toast({ title: data.error || "Failed to remove", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAdmin) fetchMembers() }, [isAdmin])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const widgetCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://app.dentai.com"}/widget-loader.js" data-clinic="${clinic?.slug}"></script>`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic configuration</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="profile">Clinic Profile</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="ai">AI Behaviour</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          {isAdmin && <TabsTrigger value="team">Team</TabsTrigger>}
        </TabsList>

        {/* Clinic Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Clinic Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clinic Name</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <PhoneInput value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input value={profile.zip} onChange={(e) => setProfile({ ...profile, zip: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
              </div>
              <Button onClick={() => save(profile)} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader><CardTitle>Business Hours</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {hours && <BusinessHoursStep data={hours} onChange={setHours} />}
              <Button onClick={() => save({ hours: hours! })} disabled={saving}>
                {saving ? "Saving..." : "Save Hours"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services">
          <Card>
            <CardHeader><CardTitle>Services</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ServicesStep data={services} onChange={setServices} />
              <Button onClick={() => save({ services })} disabled={saving}>
                {saving ? "Saving..." : "Save Services"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance */}
        <TabsContent value="insurance">
          <Card>
            <CardHeader><CardTitle>Insurance Plans Accepted</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InsuranceStep data={insurance} onChange={setInsurance} />
              <Button onClick={() => save({ insurance_accepted: insurance })} disabled={saving}>
                {saving ? "Saving..." : "Save Insurance"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Behaviour */}
        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle>AI Behaviour</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Textarea
                  value={aiSettings.ai_greeting}
                  onChange={(e) => setAiSettings({ ...aiSettings, ai_greeting: e.target.value })}
                  placeholder="Hi, thanks for calling! How can I help you today?"
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={aiSettings.ai_tone} onValueChange={(v) => setAiSettings({ ...aiSettings, ai_tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={aiSettings.ai_language} onValueChange={(v) => setAiSettings({ ...aiSettings, ai_language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="bilingual">Bilingual (English + Spanish)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emergency Policy</Label>
                <Textarea
                  value={aiSettings.emergency_policy}
                  onChange={(e) => setAiSettings({ ...aiSettings, emergency_policy: e.target.value })}
                />
              </div>
              <Button onClick={() => save(aiSettings as Partial<Clinic>)} disabled={saving}>
                {saving ? "Saving..." : "Save AI Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            {/* Voice AI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Voice AI (Vapi)
                  {(process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER || clinic?.vapi_assistant_id) ? (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Not configured</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Voice AI lets patients call your clinic and interact with an AI receptionist that can answer questions, check availability, and book appointments by phone.
                </p>

                {process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER ? (
                  <div className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Voice AI is active</span>
                    </div>
                    <p className="mt-1 text-sm text-green-700">
                      Patients can call: <strong>{process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 space-y-3">
                    <p className="text-sm font-medium">How to set up Voice AI</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>
                        Create a <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">Vapi.ai</a> account and get your API key
                      </li>
                      <li>
                        Purchase a phone number in your Vapi dashboard
                      </li>
                      <li>
                        Add these environment variables to your deployment:
                        <div className="mt-1 space-y-1">
                          <code className="block rounded bg-muted px-2 py-1 text-xs">VAPI_API_KEY=your_api_key</code>
                          <code className="block rounded bg-muted px-2 py-1 text-xs">VAPI_PHONE_NUMBER=+1234567890</code>
                          <code className="block rounded bg-muted px-2 py-1 text-xs">NEXT_PUBLIC_VAPI_PHONE_NUMBER=+1234567890</code>
                        </div>
                      </li>
                      <li>Redeploy your application</li>
                    </ol>
                    <p className="text-xs text-muted-foreground">
                      The AI voice assistant uses your clinic&apos;s services, hours, and AI settings configured in the other tabs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Google Calendar</CardTitle></CardHeader>
              <CardContent>
                {clinic?.google_calendar_connected ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Connected</Badge>
                    <span className="text-sm text-muted-foreground">Google Calendar is linked</span>
                  </div>
                ) : (
                  <Button onClick={() => window.location.href = "/api/google/connect"}>
                    Connect Google Calendar
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Widget Embed Code</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Paste this code on your website to add the chat widget:</p>
                <div className="rounded bg-muted p-3">
                  <code className="break-all text-xs">{widgetCode}</code>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(widgetCode)}>
                  Copy Code
                </Button>
              </CardContent>
            </Card>
            {clinic?.twilio_phone_number && (
              <Card>
                <CardHeader><CardTitle>Twilio Phone</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm">Your AI receptionist phone number: <strong>{clinic.twilio_phone_number}</strong></p>
                </CardContent>
              </Card>
            )}

            {/* WhatsApp Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </CardTitle>
                  <Switch
                    checked={whatsappSettings.whatsapp_enabled}
                    onCheckedChange={(checked) =>
                      setWhatsappSettings({ ...whatsappSettings, whatsapp_enabled: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enable WhatsApp to let patients message your AI receptionist, receive booking confirmations, appointment reminders, and post-visit review requests.
                </p>

                <div className="space-y-2">
                  <Label>WhatsApp Phone Number</Label>
                  <Input
                    placeholder="+1234567890"
                    value={whatsappSettings.whatsapp_phone_number}
                    onChange={(e) =>
                      setWhatsappSettings({ ...whatsappSettings, whatsapp_phone_number: e.target.value })
                    }
                    disabled={!whatsappSettings.whatsapp_enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Twilio WhatsApp-enabled number in E.164 format (e.g. +14155551234)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Google Review URL</Label>
                  <Input
                    placeholder="https://g.page/r/your-clinic/review"
                    value={whatsappSettings.google_review_url}
                    onChange={(e) =>
                      setWhatsappSettings({ ...whatsappSettings, google_review_url: e.target.value })
                    }
                    disabled={!whatsappSettings.whatsapp_enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Patients will receive this link after visits to leave a review
                  </p>
                </div>

                {whatsappSettings.whatsapp_enabled && (
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-xs break-all">
                        {typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/api/whatsapp/webhook
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/api/whatsapp/webhook`
                          )
                        }
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paste this URL in your Twilio WhatsApp Sandbox or Sender settings as the webhook
                    </p>
                  </div>
                )}

                <Separator />
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => save(whatsappSettings as Partial<Clinic>)}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save WhatsApp Settings"}
                  </Button>
                  {clinic?.whatsapp_enabled && clinic?.whatsapp_phone_number && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      WhatsApp is active
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New booking notification</p>
                  <p className="text-sm text-muted-foreground">Get notified when a patient books</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emergency inquiry alert</p>
                  <p className="text-sm text-muted-foreground">Immediate SMS for emergencies</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily summary email</p>
                  <p className="text-sm text-muted-foreground">Receive a daily recap</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly report email</p>
                  <p className="text-sm text-muted-foreground">Receive a weekly performance report</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Billing & Subscription</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current plan</p>
                    <p className="text-2xl font-bold capitalize">{clinic?.plan || "Trial"}</p>
                    {clinic?.plan === "trial" && clinic.trial_ends_at && (() => {
                      const daysLeft = Math.max(0, Math.ceil(
                        (new Date(clinic.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      ))
                      return (
                        <p className={`text-sm ${daysLeft <= 3 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {daysLeft > 0
                            ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in trial`
                            : "Trial expired"}
                        </p>
                      )
                    })()}
                  </div>
                  <Badge
                    variant={clinic?.subscription_status === "active" ? "default" : "destructive"}
                    className="mt-1"
                  >
                    {clinic?.subscription_status || "active"}
                  </Badge>
                </div>

                {/* Plan features */}
                {clinic?.plan && clinic.plan !== "trial" && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium mb-2">Plan features</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {clinic.plan === "starter" && (
                        <>
                          <li>Chat widget</li>
                          <li>500 conversations/month</li>
                          <li>Google Calendar integration</li>
                        </>
                      )}
                      {clinic.plan === "growth" && (
                        <>
                          <li>Chat + voice AI</li>
                          <li>1,000 conversations/month</li>
                          <li>SMS follow-ups & reminders</li>
                        </>
                      )}
                      {clinic.plan === "pro" && (
                        <>
                          <li>Everything unlimited</li>
                          <li>Unlimited conversations</li>
                          <li>Custom integrations</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  {clinic?.plan === "trial" ? (
                    <Button onClick={() => window.location.href = "/pricing"}>
                      Upgrade Plan
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = "/pricing"}
                      >
                        Change Plan
                      </Button>
                      {clinic?.stripe_customer_id && (
                        <Button
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/stripe/portal", { method: "POST" })
                              if (res.ok) {
                                const { url } = await res.json()
                                if (url) window.location.href = url
                              }
                            } catch {
                              toast({ title: "Failed to open billing portal", variant: "destructive" })
                            }
                          }}
                        >
                          Manage Billing
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team */}
        {isAdmin && (
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Add Member</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={inviteMember} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={newMember.fullName}
                            onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                            placeholder="Dr. Jane Smith"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            placeholder="jane@clinic.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={newMember.role}
                            onValueChange={(v) => setNewMember({ ...newMember, role: v })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={inviting}>
                          {inviting ? "Sending invite..." : "Send Invite"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.full_name || "—"}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(member.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {member.id !== currentUser?.id && member.role !== "owner" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => removeMember(member.id, member.full_name || member.email)}
                              >
                                Remove
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
