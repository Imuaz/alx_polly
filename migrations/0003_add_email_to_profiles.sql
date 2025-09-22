-- Migration 0003: Add email to profiles for better user management
-- This fixes the issue with joining auth.users table

-- Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on email for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with emails from auth.users
-- This is a one-time data migration
UPDATE public.profiles
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE public.profiles.id = auth_users.id
AND public.profiles.email IS NULL;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old admin_users view that used auth.users join
DROP VIEW IF EXISTS public.admin_users;

-- Create new admin_users view using email from profiles
CREATE VIEW public.admin_users AS
SELECT p.id, p.full_name, p.email, p.role, p.created_at
FROM public.profiles p
WHERE p.role IN ('admin', 'moderator');

-- Add RLS policy to allow users to see email in profiles (needed for admin panel)
CREATE POLICY "Allow email access for admin users"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Users can see their own email
  auth.uid() = id
  OR
  -- Admins can see all emails
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Comment on new column
COMMENT ON COLUMN public.profiles.email IS 'User email address copied from auth.users for easier querying';

-- Verify the migration worked by selecting a sample
-- This will show in the migration output
DO $$
DECLARE
    profile_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO admin_count FROM public.admin_users;

    RAISE NOTICE 'Migration completed: % profiles have emails, % admin/moderator users found', profile_count, admin_count;
END
$$;
