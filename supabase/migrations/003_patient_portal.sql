-- Patient OTP verification table
CREATE TABLE IF NOT EXISTS patient_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_patient_otps_expires ON patient_otps(expires_at);
CREATE INDEX idx_patient_otps_lookup ON patient_otps(clinic_id, phone, verified);

-- Indexes for phone-based patient lookups (portal queries)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_phone
  ON appointments(clinic_id, patient_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_patient_phone
  ON conversations(clinic_id, patient_phone);
CREATE INDEX IF NOT EXISTS idx_leads_patient_phone
  ON leads(clinic_id, patient_phone);

-- RLS enabled, only accessed via admin client (service role bypasses)
ALTER TABLE patient_otps ENABLE ROW LEVEL SECURITY;
