-- X-Ray Analyses table
CREATE TABLE xray_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  xray_type text NOT NULL CHECK (xray_type IN ('periapical', 'panoramic', 'bitewing', 'cbct')),
  findings jsonb NOT NULL DEFAULT '[]',
  severity text NOT NULL CHECK (severity IN ('normal', 'monitor', 'urgent')),
  treatments jsonb NOT NULL DEFAULT '[]',
  confidence integer NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100)
);

CREATE INDEX idx_xray_analyses_clinic ON xray_analyses(clinic_id);
CREATE INDEX idx_xray_analyses_created ON xray_analyses(clinic_id, created_at DESC);

ALTER TABLE xray_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their clinic xray analyses"
  ON xray_analyses FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can create xray analyses for their clinic"
  ON xray_analyses FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete their clinic xray analyses"
  ON xray_analyses FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- Storage bucket for X-ray images
INSERT INTO storage.buckets (id, name, public)
VALUES ('xray-images', 'xray-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload and read their clinic's images
CREATE POLICY "Authenticated users can upload xray images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'xray-images');

CREATE POLICY "Authenticated users can view xray images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'xray-images');
