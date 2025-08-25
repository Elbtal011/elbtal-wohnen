-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to trigger backup via edge function
CREATE OR REPLACE FUNCTION public.trigger_daily_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Make HTTP request to our backup edge function
  PERFORM net.http_post(
    url := 'https://msujaimgdxhxmtlaabvn.supabase.co/functions/v1/backup-system',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdWphaW1nZHhoeG10bGFhYnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTEwNzAsImV4cCI6MjA2OTU4NzA3MH0.r2wm1BkUkjjt7aJ01ScecH1Z067uFwrpn9U3rSTewYo"}'::jsonb,
    body := '{"action": "create_simulated_backup", "backup_type": "daily"}'::jsonb
  );
  
  -- Log the backup trigger
  INSERT INTO public.audit_log (table_name, operation, details)
  VALUES ('backup_records', 'CRON_BACKUP', jsonb_build_object('triggered_at', now()));
END;
$$;

-- Schedule daily backup at 2:00 AM every day
SELECT cron.schedule(
  'daily-backup',
  '0 2 * * *', -- Daily at 2:00 AM
  $$SELECT public.trigger_daily_backup();$$
);