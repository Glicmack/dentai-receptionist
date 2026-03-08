-- ============================================
-- DentAI 3-Layer System Migration
-- Layer 1: Admin/GOD Panel
-- Layer 2: Doctor Panel
-- Layer 3: Patient Portal
-- ============================================

-- ============================================
-- NEW TABLES
-- ============================================

-- Platform admins (GOD panel access)
CREATE TABLE IF NOT EXISTS platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Patient accounts (email/password auth)
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  phone_verified boolean DEFAULT false,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patient-Clinic links (many-to-many)
CREATE TABLE IF NOT EXISTS patient_clinic_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  first_contact_at timestamptz DEFAULT now(),
  last_contact_at timestamptz DEFAULT now(),
  is_blocked boolean DEFAULT false,
  UNIQUE(patient_id, clinic_id)
);

-- Conversation messages (individual messages for live chat)
CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('patient', 'ai', 'doctor')),
  sender_id uuid,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Doctor websites (landing page configs)
CREATE TABLE IF NOT EXISTS doctor_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  template text DEFAULT 'modern',
  custom_domain text UNIQUE,
  is_published boolean DEFAULT false,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  about_text text,
  services_override jsonb,
  gallery_images jsonb DEFAULT '[]',
  theme_colors jsonb DEFAULT '{"primary": "#1B56DB", "secondary": "#0F2B6B"}',
  custom_css text,
  github_repo text,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- MODIFY EXISTING TABLES
-- ============================================

-- Add new columns to clinics
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS is_listed boolean DEFAULT true;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS specialty text;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 5.0;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS description text;
-- city and state already exist in clinics table

-- Add new columns to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS patient_id uuid REFERENCES patients(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_paused boolean DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_paused_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_paused_by uuid;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add review_request_sent to appointments if not exists
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS review_request_sent boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patient_clinic_links_patient ON patient_clinic_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_clinic_links_clinic ON patient_clinic_links(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_clinic ON conversation_messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(clinic_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_doctor_websites_slug ON doctor_websites(slug);
CREATE INDEX IF NOT EXISTS idx_doctor_websites_domain ON doctor_websites(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinics_listed ON clinics(is_listed) WHERE is_listed = true;
CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON platform_admins(email);

-- ============================================
-- RLS HELPER FUNCTIONS
-- ============================================

-- Check if current user is a platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_clinic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_websites ENABLE ROW LEVEL SECURITY;

-- PLATFORM_ADMINS policies
CREATE POLICY "Admins can view all platform admins"
  ON platform_admins FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Admins can manage platform admins"
  ON platform_admins FOR ALL
  USING (is_platform_admin());

-- PATIENTS policies (accessed via service role / admin client)
CREATE POLICY "Admins can view all patients"
  ON patients FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Admins can manage patients"
  ON patients FOR ALL
  USING (is_platform_admin());

-- PATIENT_CLINIC_LINKS policies
CREATE POLICY "Admins can view all patient links"
  ON patient_clinic_links FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Doctors can view their clinic patient links"
  ON patient_clinic_links FOR SELECT
  USING (clinic_id = get_user_clinic_id());

-- CONVERSATION_MESSAGES policies
CREATE POLICY "Admins can view all messages"
  ON conversation_messages FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Doctors can view their clinic messages"
  ON conversation_messages FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Doctors can insert messages for their clinic"
  ON conversation_messages FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

-- DOCTOR_WEBSITES policies
CREATE POLICY "Admins can manage all websites"
  ON doctor_websites FOR ALL
  USING (is_platform_admin());

CREATE POLICY "Doctors can view their own website"
  ON doctor_websites FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Doctors can update their own website"
  ON doctor_websites FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

-- Add admin override policies to existing tables
-- Admins can see all clinics
CREATE POLICY "Admins can view all clinics"
  ON clinics FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Admins can update all clinics"
  ON clinics FOR UPDATE
  USING (is_platform_admin());

-- Admins can see all appointments
CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (is_platform_admin());

-- Admins can see all conversations
CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Admins can update all conversations"
  ON conversations FOR UPDATE
  USING (is_platform_admin());

-- Admins can see all leads
CREATE POLICY "Admins can view all leads"
  ON leads FOR SELECT
  USING (is_platform_admin());

-- Admins can see all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_platform_admin());

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Website assets bucket (for doctor website images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;
