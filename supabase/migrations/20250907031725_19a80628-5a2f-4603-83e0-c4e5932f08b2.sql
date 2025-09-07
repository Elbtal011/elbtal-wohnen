-- Remove duplicates by keeping the earliest created record for each unique combination
WITH duplicates AS (
  SELECT 
    email,
    property_id,
    vorname,
    nachname,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at) as all_ids
  FROM public.contact_requests
  WHERE lead_label = 'Property Application'
  GROUP BY email, property_id, vorname, nachname
  HAVING COUNT(*) > 1
),
ids_to_delete AS (
  SELECT unnest(all_ids[2:]) as id_to_delete
  FROM duplicates
)
DELETE FROM public.contact_requests
WHERE id IN (SELECT id_to_delete FROM ids_to_delete);