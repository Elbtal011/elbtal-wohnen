-- Create lead_documents table for admin-uploaded documents
CREATE TABLE IF NOT EXISTS public.lead_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_request_id UUID NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage lead documents" 
ON public.lead_documents 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_lead_documents_updated_at
BEFORE UPDATE ON public.lead_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();