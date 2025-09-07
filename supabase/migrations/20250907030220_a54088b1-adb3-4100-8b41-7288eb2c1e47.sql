-- Restore deleted contact_requests from the last hour using data from property_applications
-- and relink attachments (lead_documents). This keeps applications intact.
BEGIN;

-- 1) Collect the deleted contact_request IDs within the last hour
WITH deleted_ids AS (
  SELECT (details->>'contact_id')::uuid AS contact_id
  FROM public.audit_log
  WHERE table_name = 'contact_requests'
    AND operation = 'DELETE'
    AND timestamp > now() - interval '1 hour'
),
-- 2) Find property applications that currently don't have a corresponding contact_request
--    (match by same email and close created_at window to avoid duplicates)
pa_missing AS (
  SELECT pa.*
  FROM public.property_applications pa
  LEFT JOIN public.contact_requests cr
    ON lower(cr.email) = lower(pa.email)
   AND abs(extract(epoch from (cr.created_at - pa.created_at))) <= 86400 -- 24h window
  WHERE cr.id IS NULL
),
-- 3) Insert restored contact_requests from those applications
inserted AS (
  INSERT INTO public.contact_requests (
    id,
    property_id,
    created_at,
    updated_at,
    anrede,
    vorname,
    nachname,
    email,
    telefon,
    strasse,
    nummer,
    plz,
    ort,
    nachricht,
    status,
    lead_label,
    lead_stage
  )
  SELECT
    gen_random_uuid() AS id,
    pa.property_id,
    pa.created_at,
    pa.created_at,
    NULL::text AS anrede,
    pa.vorname,
    pa.nachname,
    pa.email,
    pa.telefon,
    NULL::text AS strasse,
    NULL::text AS nummer,
    pa.postleitzahl AS plz,
    pa.ort,
    pa.nachricht,
    'new'::text AS status,
    'Property Application'::text AS lead_label,
    NULL::text AS lead_stage
  FROM pa_missing pa
  RETURNING id, created_at, email
),
-- 4) Relink lead_documents belonging to the deleted contact_requests to the newly created ones
--    We match by the uploading user and the application email/created_at to ensure correct pairing
relinked AS (
  UPDATE public.lead_documents ld
  SET contact_request_id = cr_new.id
  FROM public.property_applications pa
  JOIN inserted cr_new
    ON lower(cr_new.email) = lower(pa.email)
   AND cr_new.created_at = pa.created_at
  WHERE ld.contact_request_id IN (SELECT contact_id FROM deleted_ids)
    AND ld.uploaded_by IS NOT NULL
    AND pa.user_id IS NOT NULL
    AND ld.uploaded_by = pa.user_id
  RETURNING ld.id
)
SELECT
  (SELECT count(*) FROM inserted) AS restored_leads,
  (SELECT count(*) FROM relinked) AS relinked_documents;

COMMIT;