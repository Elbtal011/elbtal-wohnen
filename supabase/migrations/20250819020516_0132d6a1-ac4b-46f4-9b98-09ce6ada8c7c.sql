-- Create storage bucket for lead documents
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-documents', 'lead-documents', false);

-- Create table to track uploaded documents
CREATE TABLE public.lead_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_request_id UUID NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'personalausweis', 'einkommensnachweis', 'schufa'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  uploaded_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lead_documents table
ALTER TABLE public.lead_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_documents (admin only access)
CREATE POLICY "Admin only access to lead documents" 
ON public.lead_documents 
FOR ALL 
USING (false);

-- Storage policies for lead-documents bucket
CREATE POLICY "Admin can view lead documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lead-documents');

CREATE POLICY "Admin can upload lead documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'lead-documents');

CREATE POLICY "Admin can update lead documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'lead-documents');

CREATE POLICY "Admin can delete lead documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'lead-documents');

-- Add indexes for performance
CREATE INDEX idx_lead_documents_contact_request_id ON public.lead_documents(contact_request_id);
CREATE INDEX idx_lead_documents_type ON public.lead_documents(document_type);

-- Add trigger for updated_at
CREATE TRIGGER update_lead_documents_updated_at
BEFORE UPDATE ON public.lead_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();