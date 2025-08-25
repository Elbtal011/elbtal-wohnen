-- Create property applications table
CREATE TABLE public.property_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Personal information
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT NOT NULL,
  adresse TEXT NOT NULL,
  postleitzahl TEXT NOT NULL,
  ort TEXT NOT NULL,
  geburtsort TEXT NOT NULL,
  staatsangehoerigkeit TEXT NOT NULL,
  geburtsdatum DATE NOT NULL,
  
  -- Financial and move-in information
  nettoeinkommen INTEGER NOT NULL,
  einzugsdatum DATE NOT NULL,
  nachricht TEXT NOT NULL,
  
  -- Application status
  status TEXT NOT NULL DEFAULT 'pending',
  
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE public.property_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own applications" 
ON public.property_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" 
ON public.property_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.property_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin access (for leads management)
CREATE POLICY "Admins can view all applications" 
ON public.property_applications 
FOR SELECT 
USING (
  (auth.uid() IS NULL AND current_setting('role', true) = 'service_role') OR
  (auth.uid() = user_id)
);

-- Create updated_at trigger
CREATE TRIGGER update_property_applications_updated_at
BEFORE UPDATE ON public.property_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();