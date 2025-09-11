-- Fix security issue: Remove overly permissive service role policy
-- Drop the service role policy that allows unrestricted access
DROP POLICY IF EXISTS "Service role can view all applications" ON public.property_applications;

-- The table should now only allow users to access their own applications
-- Admin access will be handled through properly authenticated edge functions
-- that use the service role key only after verifying admin credentials

-- Ensure RLS is enabled (it should be already)
ALTER TABLE public.property_applications ENABLE ROW LEVEL SECURITY;

-- Add audit logging for property_applications access
CREATE OR REPLACE FUNCTION public.audit_property_applications_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    details
  ) VALUES (
    'property_applications',
    TG_OP,
    jsonb_build_object(
      'application_id', COALESCE(NEW.id, OLD.id),
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'accessed_at', now()
    )
  );
  
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_property_applications_trigger ON public.property_applications;
CREATE TRIGGER audit_property_applications_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.property_applications
  FOR EACH ROW EXECUTE FUNCTION public.audit_property_applications_access();