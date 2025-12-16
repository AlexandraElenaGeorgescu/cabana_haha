-- ============================================
-- MIGRATE EXISTING DATA (Optional - if you have data to preserve)
-- ============================================
-- Run this ONLY if you have existing data in quotes/votes that you want to keep
-- Otherwise, just run FIX_SUPABASE_SCHEMA.sql

-- WARNING: This will convert existing quotes from BIGSERIAL id to TEXT id
-- If you don't have important data, just run FIX_SUPABASE_SCHEMA.sql instead

-- Step 1: Create temporary table with old quotes data
CREATE TEMP TABLE quotes_backup AS 
SELECT * FROM public.quotes;

-- Step 2: Drop and recreate quotes table (see FIX_SUPABASE_SCHEMA.sql)
-- (Run the DROP and CREATE from FIX_SUPABASE_SCHEMA.sql first)

-- Step 3: Migrate quotes data (convert id from bigint to text)
-- INSERT INTO public.quotes (id, text, author, added_by, timestamp)
-- SELECT 
--   id::TEXT as id,  -- Convert bigint to text
--   text,
--   author,
--   'Unknown' as added_by,  -- Default value since it was missing
--   timestamp
-- FROM quotes_backup;

-- Step 4: Migrate votes data (convert value to candidate)
-- CREATE TEMP TABLE votes_backup AS 
-- SELECT * FROM public.votes;

-- (Run the DROP and CREATE from FIX_SUPABASE_SCHEMA.sql for votes first)

-- INSERT INTO public.votes (voter, candidate, category)
-- SELECT 
--   voter,
--   value::TEXT as candidate,  -- Convert value to candidate
--   category
-- FROM votes_backup;

-- Note: If you don't have important data, it's easier to just run FIX_SUPABASE_SCHEMA.sql
-- which will drop and recreate everything fresh.

