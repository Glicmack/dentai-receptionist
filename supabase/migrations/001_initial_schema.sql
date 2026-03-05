-- DentAI Receptionist - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Clinics table (main configuration)
CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  website text,
  timezone text DEFAULT 'America/New_York',
  logo_url text,

  -- AI Configuration
  ai_greeting text DEFAULT 'Hi, thanks for calling! How can I help you today?',
  ai_tone text DEFAULT 'professional',
  ai_language text DEFAULT 'english',

  -- Business hours (JSON)
  hours jsonb DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
    "thursday": {"open": "09:00", "close": "17:00", "closed": false},
    "friday": {"open": "09:00", "close": "17:00", "closed": false},
    "saturday": {"open": "09:00", "close": "13:00", "closed": false},
    "sunday": {"open": null, "close": null, "closed": true}
  }',

  -- Services (JSON array)
  services jsonb DEFAULT '[]',

  -- Insurance accepted (JSON array)
  insurance_accepted jsonb DEFAULT '[]',

  -- Emergency policy
  emergency_policy text DEFAULT 'We accommodate dental emergencies. Please call during business hours or leave your contact details and we will call you back as soon as possible.',

  -- Integrations
  google_calendar_connected boolean DEFAULT false,
  google_calendar_token jsonb,
  vapi_assistant_id text,
  twilio_phone_number text,

  -- Subscription
  plan text DEFAULT 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'active',
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days')
);

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'owner'
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  patient_email text,
  patient_type text DEFAULT 'new',
  service_type text NOT NULL,
  duration_minutes integer DEFAULT 60,
  notes text,
  appointment_datetime timestamptz NOT NULL,
  status text DEFAULT 'confirmed',
  google_calendar_event_id text,
  reminder_24h_sent boolean DEFAULT false,
  reminder_2h_sent boolean DEFAULT false,
  booked_via text,
  conversation_id uuid
);

-- Conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  channel text NOT NULL,
  patient_name text,
  patient_phone text,
  patient_email text,
  transcript jsonb DEFAULT '[]',
  outcome text,
  duration_seconds integer,
  appointment_id uuid,
  vapi_call_id text,
  summary text
);

-- Add foreign keys that reference conversations (after both tables exist)
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_conversation
  FOREIGN KEY (conversation_id) REFERENCES conversations(id);

ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments(id);

-- Leads table
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_name text,
  patient_phone text,
  patient_email text,
  source text,
  interest text,
  status text DEFAULT 'new',
  follow_up_count integer DEFAULT 0,
  last_follow_up_at timestamptz,
  next_follow_up_at timestamptz,
  conversation_id uuid REFERENCES conversations(id),
  notes text
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_appointments_clinic_datetime ON appointments(clinic_id, appointment_datetime);
CREATE INDEX idx_appointments_status ON appointments(clinic_id, status);
CREATE INDEX idx_conversations_clinic_created ON conversations(clinic_id, created_at DESC);
CREATE INDEX idx_conversations_channel ON conversations(clinic_id, channel);
CREATE INDEX idx_leads_clinic_status ON leads(clinic_id, status);
CREATE INDEX idx_leads_follow_up ON leads(clinic_id, next_follow_up_at) WHERE status IN ('new', 'contacted');
CREATE INDEX idx_users_clinic ON users(clinic_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's clinic_id
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid()
$$;

-- CLINICS policies
CREATE POLICY "Users can view their own clinic"
  ON clinics FOR SELECT
  USING (id = get_user_clinic_id());

CREATE POLICY "Users can update their own clinic"
  ON clinics FOR UPDATE
  USING (id = get_user_clinic_id());

CREATE POLICY "Allow insert during registration"
  ON clinics FOR INSERT
  WITH CHECK (true);

-- USERS policies
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view clinic members"
  ON users FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Allow insert during registration"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- APPOINTMENTS policies
CREATE POLICY "Users can view their clinic appointments"
  ON appointments FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can create appointments for their clinic"
  ON appointments FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update their clinic appointments"
  ON appointments FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete their clinic appointments"
  ON appointments FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- CONVERSATIONS policies
CREATE POLICY "Users can view their clinic conversations"
  ON conversations FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can create conversations for their clinic"
  ON conversations FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update their clinic conversations"
  ON conversations FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

-- LEADS policies
CREATE POLICY "Users can view their clinic leads"
  ON leads FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can create leads for their clinic"
  ON leads FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update their clinic leads"
  ON leads FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete their clinic leads"
  ON leads FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- ============================================
-- SERVICE ROLE POLICIES (for API routes / widget)
-- These are automatically bypassed by the service role key,
-- so no explicit policies needed. The service role has full access.
-- ============================================
