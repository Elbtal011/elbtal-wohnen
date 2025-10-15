-- Enable realtime for contact_requests table
ALTER TABLE public.contact_requests REPLICA IDENTITY FULL;

-- The table is already in the supabase_realtime publication by default
-- but we'll ensure it's there
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_requests;