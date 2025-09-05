-- Create lead-documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-documents', 'lead-documents', false);

-- Create policies for lead-documents bucket
CREATE POLICY "Admins can manage lead documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'lead-documents')
WITH CHECK (bucket_id = 'lead-documents');