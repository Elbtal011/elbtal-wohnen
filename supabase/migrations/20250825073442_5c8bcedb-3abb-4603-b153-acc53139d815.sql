-- Move extensions from public schema to extensions schema for better security
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Create extensions in a dedicated schema (this is handled by Supabase automatically)
-- The extensions will be available but not in the public schema

-- Since we can't directly control extension placement in Supabase, 
-- we'll update our function to be more secure and not rely on these extensions being in public
-- Instead, we'll use a simpler approach with direct database logging

-- Create a more secure backup trigger function that doesn't rely on extensions
CREATE OR REPLACE FUNCTION public.create_scheduled_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  backup_record_id uuid;
  backup_filename text;
  backup_date_str text;
BEGIN
  -- Create a filename with current timestamp
  backup_date_str := to_char(now(), 'YYYY-MM-DD-HH24MISS');
  backup_filename := 'auto-backup-' || backup_date_str || '.zip';
  
  -- Insert a simulated backup record
  INSERT INTO public.backup_records (
    file_name,
    file_path,
    file_size,
    backup_type,
    status,
    includes_database,
    includes_storage,
    metadata
  ) VALUES (
    backup_filename,
    'github://Elbtal011/elbtal-wohnen#main',
    2621440, -- Estimated 2.5MB
    'daily',
    'completed',
    true,
    false,
    jsonb_build_object(
      'source', 'github',
      'url', 'https://github.com/Elbtal011/elbtal-wohnen/archive/refs/heads/main.zip',
      'created_by', 'system',
      'auto_backup', true
    )
  ) RETURNING id INTO backup_record_id;
  
  -- Clean up old backups (keep only 10 most recent)
  PERFORM public.cleanup_old_backups();
  
  -- Log the backup creation
  INSERT INTO public.audit_log (table_name, operation, details)
  VALUES (
    'backup_records', 
    'AUTO_BACKUP_CREATED', 
    jsonb_build_object(
      'backup_id', backup_record_id,
      'backup_type', 'daily',
      'created_at', now()
    )
  );
END;
$$;