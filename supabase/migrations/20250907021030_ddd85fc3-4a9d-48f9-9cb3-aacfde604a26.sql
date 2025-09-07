-- Create RPC to map emails to user IDs from auth.users
CREATE OR REPLACE FUNCTION public.map_emails_to_user_ids(emails text[])
RETURNS TABLE(email text, user_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT lower(u.email) AS email, u.id AS user_id
  FROM auth.users u
  JOIN unnest(emails) e(email) ON lower(u.email) = lower(e.email);
$$;

-- Comment for clarity
COMMENT ON FUNCTION public.map_emails_to_user_ids(text[]) IS 'Maps a list of emails to auth.user IDs for admin workflows via edge functions.';