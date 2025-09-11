-- Fix security issue with property_applications table
-- Remove existing potentially problematic policies
DROP POLICY IF EXISTS "Admins can view all applications" ON public.property_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.property_applications;

-- Create secure policies that prevent public access
-- Policy for users to view only their own applications
CREATE POLICY "Users can view own applications only" 
ON public.property_applications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy for admin access via edge functions only (service role)
CREATE POLICY "Service role can view all applications" 
ON public.property_applications 
FOR SELECT 
TO service_role
USING (true);

-- Ensure the existing INSERT and UPDATE policies are still secure
-- (They should already be fine, but let's verify they exist)
DO $$
BEGIN
  -- Recreate INSERT policy if it doesn't exist or is problematic
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_applications' 
    AND policyname = 'Users can insert their own applications'
    AND cmd = 'INSERT'
  ) THEN
    CREATE POLICY "Users can insert their own applications" 
    ON public.property_applications 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Recreate UPDATE policy if it doesn't exist or is problematic
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_applications' 
    AND policyname = 'Users can update their own applications'
    AND cmd = 'UPDATE'
  ) THEN
    CREATE POLICY "Users can update their own applications" 
    ON public.property_applications 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;