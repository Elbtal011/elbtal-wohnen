-- Relink attachments from deleted contact_requests to the newly recreated ones
WITH deleted_ids AS (
  SELECT (details->>'contact_id')::uuid AS contact_id
  FROM public.audit_log
  WHERE table_name = 'contact_requests'
    AND operation = 'DELETE'
    AND timestamp > now() - interval '1 hour'
),
pairs AS (
  SELECT 
    ld.id AS lead_doc_id,
    cr.id AS new_cr_id
  FROM public.lead_documents ld
  JOIN public.property_applications pa 
    ON ld.uploaded_by IS NOT NULL 
   AND pa.user_id IS NOT NULL 
   AND ld.uploaded_by = pa.user_id
  JOIN public.contact_requests cr
    ON lower(cr.email) = lower(pa.email)
   AND cr.lead_label = 'Property Application'
   AND abs(extract(epoch from (cr.created_at - pa.created_at))) <= 3600
  WHERE ld.contact_request_id IN (SELECT contact_id FROM deleted_ids)
),
upd AS (
  UPDATE public.lead_documents ld
  SET contact_request_id = p.new_cr_id
  FROM pairs p
  WHERE ld.id = p.lead_doc_id
  RETURNING ld.id
)
SELECT count(*) AS relinked_count FROM upd;