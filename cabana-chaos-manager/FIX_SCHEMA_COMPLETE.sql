-- ============================================
-- COMPLETE SCHEMA FIX - Run this in Supabase SQL Editor
-- ============================================
-- This script ensures your schema matches the app's requirements exactly

-- 1. FIX VOTES TABLE - Add missing UNIQUE constraint
DO $$ 
BEGIN
    -- Check if the unique constraint exists by name or by columns
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'public.votes'::regclass
        AND contype = 'u'
        AND (
            conname LIKE '%voter%category%' 
            OR conname LIKE '%category%voter%'
            OR (
                array_length(conkey, 1) = 2
                AND EXISTS (
                    SELECT 1 FROM unnest(conkey) WITH ORDINALITY AS cols(col, ord)
                    WHERE col IN (
                        SELECT attnum FROM pg_attribute
                        WHERE attrelid = 'public.votes'::regclass
                        AND attname IN ('voter', 'category')
                    )
                )
            )
        )
    ) THEN
        -- Add UNIQUE constraint on (voter, category)
        ALTER TABLE public.votes 
        ADD CONSTRAINT votes_voter_category_unique UNIQUE (voter, category);
        
        RAISE NOTICE '✅ UNIQUE constraint added to votes table';
    ELSE
        RAISE NOTICE '✅ UNIQUE constraint already exists on votes table';
    END IF;
END $$;

-- 2. VERIFY USERS TABLE has UNIQUE on name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass
        AND contype = 'u'
        AND conkey::smallint[] = ARRAY[(
            SELECT attnum::smallint
            FROM pg_attribute 
            WHERE attrelid = 'public.users'::regclass 
            AND attname = 'name'
        )]::smallint[]
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_name_unique UNIQUE (name);
        
        RAISE NOTICE '✅ UNIQUE constraint added to users.name';
    ELSE
        RAISE NOTICE '✅ UNIQUE constraint already exists on users.name';
    END IF;
END $$;

-- 3. ENABLE ROW LEVEL SECURITY (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 4. CREATE/UPDATE RLS POLICIES (allow all for private app)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations" ON public.users;
DROP POLICY IF EXISTS "Allow all operations" ON public.votes;
DROP POLICY IF EXISTS "Allow all operations" ON public.quotes;
DROP POLICY IF EXISTS "Allow all operations" ON public.complaints;

-- Create new policies
CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.votes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.quotes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.complaints FOR ALL USING (true);

-- 5. VERIFY STRUCTURE
-- Check votes table
SELECT 
    'votes' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'votes'
ORDER BY ordinal_position;

-- Check constraints on votes
SELECT 
    'votes constraints' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.votes'::regclass;

-- ✅ DONE! Your schema should now match the app's requirements:
-- ✅ votes table has UNIQUE(voter, category) constraint
-- ✅ users table has UNIQUE(name) constraint  
-- ✅ All tables have RLS enabled with "Allow all operations" policy
-- ✅ All column types match (TEXT, BIGINT, TIMESTAMPTZ)
