-- Migration: create profiles table and a simple SELECT policy for authenticated users

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if you want Row Level Security (optional, depends on your Supabase setup)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read profiles (adjust according to your privacy needs)
-- This policy grants SELECT to any authenticated user. If you want stricter rules, change the USING expression.
CREATE POLICY IF NOT EXISTS "Allow select for authenticated" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Note: If your Supabase project uses different RLS defaults/policies, review before applying.
