-- Add verified field to profiles table
ALTER TABLE public.profiles ADD COLUMN verified boolean DEFAULT false NOT NULL;

-- Create admin function to update user verification status
CREATE OR REPLACE FUNCTION public.admin_update_user_verification(
  target_user_id uuid,
  is_verified boolean,
  admin_token text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify admin token exists and is valid
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_sessions 
    WHERE token = admin_token 
    AND is_active = true 
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;

  -- Update the verification status
  UPDATE public.profiles 
  SET verified = is_verified, updated_at = now()
  WHERE user_id = target_user_id;

  -- Log the admin action
  INSERT INTO public.audit_log (table_name, operation, details)
  VALUES (
    'profiles', 
    'ADMIN_UPDATE_VERIFICATION', 
    jsonb_build_object(
      'target_user_id', target_user_id,
      'verified_status', is_verified,
      'admin_token', admin_token,
      'timestamp', now()
    )
  );

  RETURN true;
END;
$$;