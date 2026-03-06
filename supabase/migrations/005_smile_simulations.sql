-- Smile Simulations table
CREATE TABLE smile_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  before_image_url text NOT NULL,
  after_image_url text NOT NULL,
  treatment_type text NOT NULL,
  notes text,
  patient_ref text
);

CREATE INDEX idx_smile_simulations_clinic ON smile_simulations(clinic_id);
CREATE INDEX idx_smile_simulations_created ON smile_simulations(clinic_id, created_at DESC);

ALTER TABLE smile_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their clinic smile simulations"
  ON smile_simulations FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can create smile simulations for their clinic"
  ON smile_simulations FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete their clinic smile simulations"
  ON smile_simulations FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- Storage bucket for smile simulation images
INSERT INTO storage.buckets (id, name, public)
VALUES ('smile-simulations', 'smile-simulations', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload smile simulation images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'smile-simulations');

CREATE POLICY "Authenticated users can view smile simulation images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'smile-simulations');
