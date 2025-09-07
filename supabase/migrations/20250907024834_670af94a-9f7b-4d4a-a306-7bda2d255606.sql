-- Migration to fix missing attachments for property applications
-- Move contact_requests with lead_label 'Property Application' to property_applications table

-- First, let's create a mapping function to extract data from contact requests messages
CREATE OR REPLACE FUNCTION extract_application_data(nachricht TEXT)
RETURNS TABLE(
  geburtsort TEXT,
  staatsangehoerigkeit TEXT, 
  geburtsdatum DATE,
  nettoeinkommen INTEGER,
  einzugsdatum DATE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Extract Geburtsort
    CASE 
      WHEN nachricht ~ 'Geburtsort:\s*([^\n\r]+)' THEN 
        trim(regexp_replace(nachricht, '.*Geburtsort:\s*([^\n\r]+).*', '\1', 's'))
      ELSE NULL
    END::TEXT,
    
    -- Extract Staatsangehörigkeit  
    CASE 
      WHEN nachricht ~ 'Staatsangehörigkeit:\s*([^\n\r]+)' THEN 
        trim(regexp_replace(nachricht, '.*Staatsangehörigkeit:\s*([^\n\r]+).*', '\1', 's'))
      ELSE NULL
    END::TEXT,
    
    -- Extract Geburtsdatum
    CASE 
      WHEN nachricht ~ 'Geburtsdatum:\s*(\d{1,2}\.\d{1,2}\.\d{4})' THEN 
        to_date(regexp_replace(nachricht, '.*Geburtsdatum:\s*(\d{1,2}\.\d{1,2}\.\d{4}).*', '\1', 's'), 'DD.MM.YYYY')
      WHEN nachricht ~ 'Geburtsdatum:\s*(\d{4}-\d{1,2}-\d{1,2})' THEN
        to_date(regexp_replace(nachricht, '.*Geburtsdatum:\s*(\d{4}-\d{1,2}-\d{1,2}).*', '\1', 's'), 'YYYY-MM-DD')
      ELSE NULL
    END::DATE,
    
    -- Extract Nettoeinkommen
    CASE 
      WHEN nachricht ~ 'Nettoeinkommen:\s*(\d+)' THEN 
        regexp_replace(nachricht, '.*Nettoeinkommen:\s*(\d+).*', '\1', 's')::INTEGER
      ELSE NULL
    END::INTEGER,
    
    -- Extract Einzugsdatum
    CASE 
      WHEN nachricht ~ 'Gewünschter Einzug:\s*(\d{1,2}\.\d{1,2}\.\d{4})' THEN 
        to_date(regexp_replace(nachricht, '.*Gewünschter Einzug:\s*(\d{1,2}\.\d{1,2}\.\d{4}).*', '\1', 's'), 'DD.MM.YYYY')
      WHEN nachricht ~ 'Einzugsdatum:\s*(\d{4}-\d{1,2}-\d{1,2})' THEN
        to_date(regexp_replace(nachricht, '.*Einzugsdatum:\s*(\d{4}-\d{1,2}-\d{1,2}).*', '\1', 's'), 'YYYY-MM-DD')
      ELSE NULL
    END::DATE;
END;
$$;

-- Create property applications from contact requests with lead_label 'Property Application'
-- First, let's get the user_id mappings for the emails
WITH email_to_user_mapping AS (
  SELECT DISTINCT
    cr.email,
    p.user_id
  FROM contact_requests cr
  JOIN profiles p ON lower(p.first_name) = lower(cr.vorname) 
    AND lower(p.last_name) = lower(cr.nachname)
  WHERE cr.lead_label = 'Property Application'
),
application_data AS (
  SELECT 
    cr.*,
    etu.user_id,
    ead.geburtsort,
    ead.staatsangehoerigkeit,
    ead.geburtsdatum,
    ead.nettoeinkommen,
    ead.einzugsdatum
  FROM contact_requests cr
  LEFT JOIN email_to_user_mapping etu ON lower(cr.email) = lower(etu.email)
  CROSS JOIN LATERAL extract_application_data(cr.nachricht) ead
  WHERE cr.lead_label = 'Property Application'
)
INSERT INTO property_applications (
  user_id,
  property_id, 
  vorname,
  nachname,
  email,
  telefon,
  adresse,
  postleitzahl,
  ort,
  geburtsort,
  staatsangehoerigkeit,
  geburtsdatum,
  nettoeinkommen,
  einzugsdatum,
  nachricht,
  status,
  created_at,
  updated_at
)
SELECT 
  ad.user_id,
  ad.property_id,
  ad.vorname,
  ad.nachname,
  ad.email,
  ad.telefon,
  CONCAT_WS(' ', ad.strasse, ad.nummer) as adresse,
  ad.plz as postleitzahl,
  ad.ort,
  ad.geburtsort,
  ad.staatsangehoerigkeit,
  ad.geburtsdatum,
  ad.nettoeinkommen,
  ad.einzugsdatum,
  -- Clean the message by removing the structured data that's now in separate fields
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(ad.nachricht, 
              'IMMOBILIENBEWERBUNG:\s*\n\s*', '', 'g'),
            'Geburtsort:[^\n\r]*[\n\r]?', '', 'g'),
          'Staatsangehörigkeit:[^\n\r]*[\n\r]?', '', 'g'), 
        'Geburtsdatum:[^\n\r]*[\n\r]?', '', 'g'),
      'Nettoeinkommen:[^\n\r]*[\n\r]?', '', 'g'),
    'Gewünschter Einzug:[^\n\r]*[\n\r]?', '', 'g') as nachricht,
  'pending' as status,
  ad.created_at,
  ad.updated_at
FROM application_data ad
WHERE ad.user_id IS NOT NULL;

-- Clean up the original contact_requests that were moved
DELETE FROM contact_requests 
WHERE lead_label = 'Property Application' 
AND email IN (
  SELECT DISTINCT pa.email 
  FROM property_applications pa
  WHERE pa.created_at >= (SELECT MIN(created_at) FROM contact_requests WHERE lead_label = 'Property Application')
);

-- Drop the temporary function
DROP FUNCTION extract_application_data(TEXT);

-- Log the migration
INSERT INTO audit_log (table_name, operation, details)
VALUES (
  'property_applications', 
  'DATA_MIGRATION', 
  jsonb_build_object(
    'description', 'Moved Property Application contact_requests to property_applications table',
    'timestamp', now()
  )
);