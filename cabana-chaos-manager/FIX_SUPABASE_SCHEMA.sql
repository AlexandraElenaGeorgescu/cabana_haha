-- ============================================
-- FIX SUPABASE SCHEMA - Run this in SQL Editor
-- ============================================
-- This script fixes the existing tables to match the app's code

-- 1. FIX QUOTES TABLE
-- Drop existing quotes table if it has wrong structure
DROP TABLE IF EXISTS public.quotes CASCADE;

-- Recreate quotes table with correct structure
CREATE TABLE public.quotes (
  id TEXT PRIMARY KEY,  -- TEXT to match app's timestamp IDs
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  added_by TEXT NOT NULL,  -- Who added the quote (was missing!)
  timestamp BIGINT NOT NULL
);

-- 2. FIX VOTES TABLE
-- Drop existing votes table if it has wrong structure
DROP TABLE IF EXISTS public.votes CASCADE;

-- Recreate votes table with correct structure
CREATE TABLE public.votes (
  id BIGSERIAL PRIMARY KEY,
  voter TEXT NOT NULL,
  candidate TEXT NOT NULL,  -- Changed from 'value' to 'candidate'
  category TEXT NOT NULL,
  UNIQUE(voter, category)
);

-- 3. CREATE COMPLAINTS TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,  -- TEXT to match app's timestamp IDs
  text TEXT NOT NULL,  -- The complaint text
  ai_reply TEXT NOT NULL,  -- AI manager's response
  timestamp BIGINT NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (allow all for now)
DROP POLICY IF EXISTS "Allow all operations" ON public.users;
DROP POLICY IF EXISTS "Allow all operations" ON public.votes;
DROP POLICY IF EXISTS "Allow all operations" ON public.quotes;
DROP POLICY IF EXISTS "Allow all operations" ON public.complaints;

CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.votes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.quotes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.complaints FOR ALL USING (true);

-- ✅ Done! Your schema now matches the app's code.

