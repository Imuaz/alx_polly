-- Create role enum type
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'moderator');

-- Add role column to profiles table with default role 'user'
ALTER TABLE public.profiles 
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create admin users view for easy querying
CREATE VIEW public.admin_users AS
SELECT p.*, u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- Update RLS Policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read basic profile info
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO public
USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only admins can change roles
CREATE POLICY "Only admins can update roles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on objects
COMMENT ON TYPE public.user_role IS 'User role types for the application';
COMMENT ON COLUMN public.profiles.role IS 'User role for permission management';
COMMENT ON FUNCTION public.is_admin IS 'Helper function to check if a user has admin role';

-- Trigger to update updated_at timestamp
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();