export interface Clinic {
  id: string
  created_at: string
  name: string
  slug: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  website: string | null
  timezone: string
  logo_url: string | null

  // AI Configuration
  ai_greeting: string
  ai_tone: 'professional' | 'friendly' | 'warm'
  ai_language: 'english' | 'spanish' | 'bilingual'

  // Business hours
  hours: BusinessHours

  // Services
  services: Service[]

  // Insurance
  insurance_accepted: string[]

  // Emergency
  emergency_policy: string

  // Integrations
  google_calendar_connected: boolean
  google_calendar_token: GoogleCalendarToken | null
  vapi_assistant_id: string | null
  twilio_phone_number: string | null

  // WhatsApp
  whatsapp_enabled: boolean
  whatsapp_phone_number: string | null
  google_review_url: string | null

  // Subscription
  plan: 'trial' | 'starter' | 'growth' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  trial_ends_at: string
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string | null
  close: string | null
  closed: boolean
}

export interface Service {
  name: string
  duration: number
  price: string
}

export interface GoogleCalendarToken {
  access_token: string
  refresh_token: string
  expiry_date: number
  token_type: string
  scope: string
}

export interface Conversation {
  id: string
  created_at: string
  clinic_id: string
  channel: 'voice' | 'chat' | 'whatsapp'
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  transcript: TranscriptMessage[]
  outcome: 'booked' | 'lead_captured' | 'escalated' | 'spam' | 'answered_only' | null
  duration_seconds: number | null
  appointment_id: string | null
  vapi_call_id: string | null
  summary: string | null
}

export interface TranscriptMessage {
  role: 'assistant' | 'user'
  content: string
  timestamp?: string
}

export interface Appointment {
  id: string
  created_at: string
  clinic_id: string
  patient_name: string
  patient_phone: string
  patient_email: string | null
  patient_type: 'new' | 'existing'
  service_type: string
  duration_minutes: number
  notes: string | null
  appointment_datetime: string
  status: 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no_show'
  google_calendar_event_id: string | null
  reminder_24h_sent: boolean
  reminder_2h_sent: boolean
  review_request_sent: boolean
  completed_at: string | null
  booked_via: 'voice' | 'chat' | 'whatsapp' | 'manual' | null
  conversation_id: string | null
}

export interface Lead {
  id: string
  created_at: string
  clinic_id: string
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  source: 'missed_call' | 'chat' | 'voice_no_book' | 'form' | 'whatsapp' | null
  interest: string | null
  status: 'new' | 'contacted' | 'booked' | 'lost'
  follow_up_count: number
  last_follow_up_at: string | null
  next_follow_up_at: string | null
  conversation_id: string | null
  notes: string | null
}

export interface User {
  id: string
  created_at: string
  clinic_id: string
  email: string
  full_name: string | null
  role: 'owner' | 'staff' | 'admin'
}

// API Types
export interface ChatRequest {
  clinicSlug: string
  message: string
  sessionId: string
  conversationHistory: TranscriptMessage[]
}

export interface ChatResponse {
  message: string
  intent: 'booking_flow' | 'question' | 'lead_capture' | 'escalate' | 'general'
  appointmentBooked: boolean
  appointment: Appointment | null
}

export interface AvailabilityRequest {
  clinicId: string
  preferredDay: string
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'any'
  serviceType?: string
}

export interface AvailableSlot {
  datetime: string
  displayTime: string
  displayDate: string
}

// WhatsApp Types
export interface WhatsAppSession {
  id: string
  created_at: string
  updated_at: string
  clinic_id: string
  phone_number: string
  conversation_id: string | null
  patient_name: string | null
  is_active: boolean
  last_message_at: string
  qualification_data: Record<string, unknown>
}
