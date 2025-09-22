-- Setup script for testing role management system
-- Run this in your Supabase SQL Editor to create test users with different roles

-- First, ensure the role migration has been applied
-- If not, apply the migration first: 0002_add_user_roles.sql

-- Insert test users into auth.users (simulating registered users)
-- Note: In production, users would register through the app
-- This is for testing purposes only

-- Create test admin user profile
-- You'll need to replace these UUIDs with actual user IDs from your auth.users table
-- Or create them through the Supabase Auth interface first

-- Example: Update existing user to admin role
-- Replace 'your-user-id-here' with an actual user ID from auth.users
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'your-user-id-here';

-- Example: Create additional test profiles with different roles
-- (Assuming these user IDs exist in auth.users)

-- Test moderator user
INSERT INTO public.profiles (id, full_name, role)
VALUES (
  'test-moderator-id',
  'Test Moderator',
  'moderator'
) ON CONFLICT (id) DO UPDATE SET role = 'moderator';

-- Test regular user
INSERT INTO public.profiles (id, full_name, role)
VALUES (
  'test-user-id',
  'Test User',
  'user'
) ON CONFLICT (id) DO UPDATE SET role = 'user';

-- Query to check current users and their roles
SELECT
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Grant admin privileges to the first registered user (useful for initial setup)
-- Uncomment and run this if you want to make the first user an admin
/*
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM public.profiles
  ORDER BY created_at ASC
  LIMIT 1
);
*/

-- Verify role permissions are working
SELECT
  role,
  COUNT(*) as user_count
FROM public.profiles
GROUP BY role;

-- Test the is_admin function
SELECT public.is_admin('your-admin-user-id-here') as is_user_admin;
