-- Create a secure function for admin access to property applications
-- This function will be called by the admin edge function after verifying admin credentials

CREATE OR REPLACE FUNCTION public.admin_get_property_applications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  property_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  geburtsdatum date,
  nettoeinkommen integer,
  einzugsdatum date,
  geburtsort text,
  staatsangehoerigkeit text,
  nachricht text,
  status text,
  vorname text,
  nachname text,
  email text,
  telefon text,
  adresse text,
  postleitzahl text,
  ort text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- This function can only be called by the service role
  -- The admin edge function will call this after verifying admin authentication
  SELECT 
    pa.id,
    pa.user_id,
    pa.property_id,
    pa.created_at,
    pa.updated_at,
    pa.geburtsdatum,
    pa.nettoeinkommen,
    pa.einzugsdatum,
    pa.geburtsort,
    pa.staatsangehoerigkeit,
    pa.nachricht,
    pa.status,
    pa.vorname,
    pa.nachname,
    pa.email,
    pa.telefon,
    pa.adresse,
    pa.postleitzahl,
    pa.ort
  FROM public.property_applications pa
  ORDER BY pa.created_at DESC;
$$;

-- Grant execute permission to service role only
GRANT EXECUTE ON FUNCTION public.admin_get_property_applications() TO service_role;