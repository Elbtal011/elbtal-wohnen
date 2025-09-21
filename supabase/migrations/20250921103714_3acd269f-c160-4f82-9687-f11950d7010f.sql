-- Add email and role columns to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN email text UNIQUE,
ADD COLUMN role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'employee'));

-- Create index for better performance
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

-- Update existing admin users to have email (you can update this manually later)
-- UPDATE public.admin_users SET email = username || '@company.com' WHERE email IS NULL;