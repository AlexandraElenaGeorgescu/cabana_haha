-- ============================================
-- FIX VOTES TABLE - Add UNIQUE constraint
-- ============================================
-- This script adds the missing UNIQUE constraint on votes table
-- which is required for upsert operations to work correctly

-- Check if constraint already exists, if not add it
DO $$ 
BEGIN
    -- Check if the unique constraint exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'votes_voter_category_key' 
        OR conname = 'votes_voter_category_unique'
    ) THEN
        -- Add UNIQUE constraint on (voter, category)
        ALTER TABLE public.votes 
        ADD CONSTRAINT votes_voter_category_unique UNIQUE (voter, category);
        
        RAISE NOTICE '✅ UNIQUE constraint added to votes table';
    ELSE
        RAISE NOTICE '✅ UNIQUE constraint already exists on votes table';
    END IF;
END $$;

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.votes'::regclass
AND contype = 'u';

-- ✅ Done! Your votes table now has the UNIQUE constraint needed for upsert.
