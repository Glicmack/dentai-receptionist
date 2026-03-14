-- Migration: WhatsApp AI Receptionist tables
-- Tables: whatsapp_conversations, whatsapp_messages, whatsapp_appointments, patient_intake_forms

-- Table: whatsapp_conversations
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  session_state TEXT DEFAULT 'active',
  current_flow TEXT DEFAULT 'general',
  conversation_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_conversations_phone
   ON whatsapp_conversations(patient_phone);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: whatsapp_messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_body TEXT NOT NULL,
  twilio_message_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_conversation
   ON whatsapp_messages(conversation_id);

-- Table: whatsapp_appointments
CREATE TABLE IF NOT EXISTS whatsapp_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  patient_phone TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  treatment_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_2h_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_whatsapp_appointments_updated_at
  BEFORE UPDATE ON whatsapp_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: patient_intake_forms
CREATE TABLE IF NOT EXISTS patient_intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  date_of_birth DATE,
  email TEXT,
  medical_conditions TEXT[],
  current_medications TEXT[],
  allergies TEXT[],
  last_dental_visit TEXT,
  dental_concerns TEXT,
  gp_name TEXT,
  emergency_contact TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
