# Supabase Setup (Super Easy!)

## 1. Create Free Supabase Account
1. Go to https://supabase.com
2. Sign up (free forever)
3. Click "New Project"
4. Fill in:
   - Name: `cabana-chaos` (or whatever you want)
   - Database Password: (choose a strong password, save it!)
   - Region: Choose closest to you
5. Wait 2 minutes for project to be created

## 2. Get Your Credentials
1. Go to Settings (gear icon) → API
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 3. Add to .env.local
Open `.env.local` and add:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Tables

### ⚠️ IMPORTANT: If you already have tables with wrong structure

**If your tables look like this (WRONG):**
- `quotes` has `id BIGSERIAL` and NO `added_by` column
- `votes` has `value` instead of `candidate`
- No `complaints` table

**Then run `FIX_SUPABASE_SCHEMA.sql` first!** (This will fix everything)

### For NEW installations:

1. Go to SQL Editor in Supabase dashboard
2. Run this SQL:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  voter TEXT NOT NULL,
  candidate TEXT NOT NULL,  -- NOT 'value'!
  category TEXT NOT NULL,
  UNIQUE(voter, category)
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,  -- TEXT, NOT BIGSERIAL!
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  added_by TEXT NOT NULL,  -- This column is REQUIRED!
  timestamp BIGINT NOT NULL
);

-- Complaints table (ANONYMOUS - no user name stored!)
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,  -- TEXT, NOT BIGSERIAL!
  text TEXT NOT NULL,  -- The complaint text
  ai_reply TEXT NOT NULL,  -- AI manager's response
  timestamp BIGINT NOT NULL
);

-- Enable Row Level Security (allow all for now)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON votes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON quotes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON complaints FOR ALL USING (true);
```

3. Click "Run" - Done! ✅

## That's it!
Restart your dev server and you're good to go!

