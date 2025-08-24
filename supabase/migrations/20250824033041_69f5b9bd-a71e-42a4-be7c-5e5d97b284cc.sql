-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false);

-- Create backup_records table to track backup metadata
CREATE TABLE public.backup_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  backup_date date NOT NULL DEFAULT current_date,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  backup_type text NOT NULL DEFAULT 'daily',
  status text NOT NULL DEFAULT 'completed',
  includes_database boolean NOT NULL DEFAULT true,
  includes_storage boolean NOT NULL DEFAULT true,
  metadata jsonb
);

-- Enable RLS on backup_records
ALTER TABLE public.backup_records ENABLE ROW LEVEL SECURITY;

-- Create policy for admin-only access to backup records
CREATE POLICY "Admin only access to backup records" 
ON public.backup_records 
FOR ALL 
USING (false);

-- Create storage policies for backup bucket
CREATE POLICY "Admin can view backup files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'backups' AND auth.uid() IS NULL);

CREATE POLICY "Admin can upload backup files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'backups' AND auth.uid() IS NULL);

CREATE POLICY "Admin can delete backup files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'backups' AND auth.uid() IS NULL);

-- Create function to cleanup old backups (keep only 10 most recent)
CREATE OR REPLACE FUNCTION public.cleanup_old_backups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  old_backup RECORD;
BEGIN
  -- Delete backup records older than the 10 most recent
  FOR old_backup IN 
    SELECT id, file_path 
    FROM public.backup_records 
    WHERE id NOT IN (
      SELECT id 
      FROM public.backup_records 
      ORDER BY created_at DESC 
      LIMIT 10
    )
  LOOP
    -- Delete the file from storage
    DELETE FROM storage.objects 
    WHERE bucket_id = 'backups' AND name = old_backup.file_path;
    
    -- Delete the backup record
    DELETE FROM public.backup_records WHERE id = old_backup.id;
  END LOOP;
END;
$$;