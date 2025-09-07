-- Direct restoration approach: recreate contact_requests from property_applications
-- First, get all property applications and insert corresponding contact_requests

INSERT INTO public.contact_requests (
  id,
  property_id,
  created_at,
  updated_at,
  vorname,
  nachname,
  email,
  telefon,
  plz,
  ort,
  nachricht,
  status,
  lead_label
)
SELECT 
  gen_random_uuid() AS id,
  pa.property_id,
  pa.created_at,
  pa.updated_at,
  pa.vorname,
  pa.nachname,
  pa.email,
  pa.telefon,
  pa.postleitzahl AS plz,
  pa.ort,
  pa.nachricht,
  'new' AS status,
  'Property Application' AS lead_label
FROM public.property_applications pa
WHERE NOT EXISTS (
  SELECT 1 FROM public.contact_requests cr 
  WHERE lower(cr.email) = lower(pa.email)
    AND cr.lead_label = 'Property Application'
    AND abs(extract(epoch from (cr.created_at - pa.created_at))) <= 3600
);