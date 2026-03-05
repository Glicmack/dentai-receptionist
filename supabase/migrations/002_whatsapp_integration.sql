-- ============================================
-- Migration 002: WhatsApp Integration
-- Adds WhatsApp support, review requests, and session tracking
-- ============================================

-- 1. Add WhatsApp columns to clinics table
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number text,
  ADD COLUMN IF NOT EXISTS google_review_url text;

-- 2. Add review tracking columns to appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS review_request_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- 3. WhatsApp sessions table: tracks per-phone-number conversation state
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  conversation_id uuid REFERENCES conversations(id),
  patient_name text,
  is_active boolean DEFAULT true,
  last_message_at timestamptz DEFAULT now(),
  qualification_data jsonb DEFAULT '{}',
  UNIQUE(clinic_id, phone_number)
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_clinic_phone
  ON whatsapp_sessions(clinic_id, phone_number);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_active
  ON whatsapp_sessions(is_active, last_message_at);

CREATE INDEX IF NOT EXISTS idx_appointments_reminders_24h
  ON appointments(appointment_datetime, status)
  WHERE reminder_24h_sent = false;

CREATE INDEX IF NOT EXISTS idx_appointments_reminders_2h
  ON appointments(appointment_datetime, status)
  WHERE reminder_2h_sent = false;

CREATE INDEX IF NOT EXISTS idx_appointments_reviews
  ON appointments(status, completed_at)
  WHERE review_request_sent = false;

CREATE INDEX IF NOT EXISTS idx_clinics_whatsapp_phone
  ON clinics(whatsapp_phone_number)
  WHERE whatsapp_enabled = true;

-- 5. RLS for whatsapp_sessions
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their clinic whatsapp sessions"
  ON whatsapp_sessions FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Service role full access to whatsapp sessions"
  ON whatsapp_sessions FOR ALL
  USING (true)
  WITH CHECK (true);
