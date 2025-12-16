-- ============================================
-- VERIFY SCHEMA - Check if everything matches
-- ============================================
-- Run this to verify your schema matches the app's requirements

-- 1. Check votes table structure and constraints
SELECT 
    'votes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'votes'
ORDER BY ordinal_position;

-- Check for UNIQUE constraint on votes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.votes'::regclass
AND contype = 'u';

-- 2. Check users table
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check for UNIQUE constraint on users.name
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
AND contype = 'u';

-- 3. Check quotes table
SELECT 
    'quotes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'quotes'
ORDER BY ordinal_position;

-- 4. Check complaints table
SELECT 
    'complaints' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'votes', 'quotes', 'complaints');

-- ✅ Expected results:
-- votes table should have: id (bigint), voter (text), candidate (text), category (text)
-- votes table should have UNIQUE constraint on (voter, category)
-- users table should have: id (bigint), name (text UNIQUE), joined_at (timestamptz)
-- quotes table should have: id (text), text (text), author (text), added_by (text), timestamp (bigint)
-- complaints table should have: id (text), text (text), ai_reply (text), timestamp (bigint)
-- All tables should have RLS enabled with "Allow all operations" policy
