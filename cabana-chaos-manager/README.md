<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wgj5bMs6IzfcluZKyncbvdZ5QEsEDK0F

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your Gemini API key (FREE):
   - **Get FREE API key**: Go to https://aistudio.google.com/app/apikey
   - Click "Create API Key" → "Create API key in new project"
   - Copy the key (starts with `AIzaSy...`)
   - Open `.env.local` file
   - Add: `VITE_GEMINI_API_KEY=your-api-key-here`
   - **FREE TIER**: 15 requests/min, 1.5M tokens/day - perfect for this app!
   - See `GEMINI_SETUP.md` for detailed instructions

3. Database Setup (Supabase - FREE):
   - ✅ **Supabase is configured!** Your app uses Supabase (PostgreSQL), which is a persistent cloud database.
   - Add to `.env.local`: 
     - `VITE_SUPABASE_URL=your-project-url`
     - `VITE_SUPABASE_ANON_KEY=your-anon-key`
   - Get credentials from: https://supabase.com/dashboard
   - See `SUPABASE_SETUP.md` for detailed instructions
   - **FREE TIER**: 500MB database, 2GB bandwidth - perfect for this app!

4. Run the app:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`
