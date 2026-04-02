-- Public bucket for site images (logos, hero, products, collections)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Anyone can read objects in uploads (public bucket)
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
CREATE POLICY "Public read uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Authenticated admin users can upload/update/delete
DROP POLICY IF EXISTS "Admin insert uploads" ON storage.objects;
CREATE POLICY "Admin insert uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads'
  AND EXISTS (SELECT 1 FROM admin_user au WHERE au.email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Admin update uploads" ON storage.objects;
CREATE POLICY "Admin update uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND EXISTS (SELECT 1 FROM admin_user au WHERE au.email = (auth.jwt() ->> 'email'))
)
WITH CHECK (
  bucket_id = 'uploads'
  AND EXISTS (SELECT 1 FROM admin_user au WHERE au.email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Admin delete uploads" ON storage.objects;
CREATE POLICY "Admin delete uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND EXISTS (SELECT 1 FROM admin_user au WHERE au.email = (auth.jwt() ->> 'email'))
);

INSERT INTO site_setting (key, value) VALUES
  ('pdp_template', '{"layout":"split","imagePosition":"left","showSustainability":true,"showCare":true,"showFitNotes":true,"variantPickerStyle":"select"}')
ON CONFLICT (key) DO NOTHING;
