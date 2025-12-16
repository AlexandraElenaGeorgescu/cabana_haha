# Deploy pe Vercel - Ghid Complet

## 1. Pregătire

Asigură-te că ai:
- ✅ Cont Vercel (gratuit): https://vercel.com
- ✅ Proiectul push-at pe GitHub/GitLab/Bitbucket
- ✅ Environment variables pregătite

## 2. Deploy prin Vercel Dashboard

### Pasul 1: Import Project
1. Mergi pe https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Importă repository-ul tău (GitHub/GitLab/Bitbucket)
4. Vercel va detecta automat că e un proiect Vite

### Pasul 2: Configure Build Settings
Vercel ar trebui să detecteze automat:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Dacă nu detectează automat, setează manual:
- Framework: **Vite**
- Root Directory: `.` (sau lasă gol)

### Pasul 3: Environment Variables (IMPORTANT!)

Click pe "Environment Variables" și adaugă:

```
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**⚠️ IMPORTANT:**
- Toate variabilele trebuie să înceapă cu `VITE_` pentru Vite!
- Nu adăuga `.env.local` în git (e deja în .gitignore)
- După ce adaugi variabilele, **redeploy** proiectul!

### Pasul 4: Deploy
1. Click "Deploy"
2. Așteaptă build-ul (1-2 minute)
3. Gata! 🎉

## 3. Deploy prin CLI (Alternativ)

```bash
# Instalează Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Pentru production
vercel --prod
```

## 4. Troubleshooting

### Eroare 404 NOT_FOUND
✅ **REZOLVAT** - Am creat `vercel.json` cu configurația corectă!

Dacă tot primești 404:
1. Verifică că `vercel.json` e în root-ul proiectului
2. Verifică că build-ul produce folderul `dist`
3. Verifică că `outputDirectory` în `vercel.json` e `dist`

### Environment Variables nu funcționează
1. Verifică că toate încep cu `VITE_`
2. Redeploy după ce adaugi variabile noi
3. Verifică în Vercel Dashboard → Settings → Environment Variables

### Build fails
1. Verifică logs în Vercel Dashboard
2. Rulează `npm run build` local pentru a vedea erorile
3. Verifică că toate dependențele sunt în `package.json`

### Routing nu funcționează (404 pe refresh)
✅ **REZOLVAT** - `vercel.json` include `rewrites` pentru SPA routing!

## 5. Verificare după deploy

1. Deschide URL-ul de la Vercel
2. Verifică consola browserului (F12) pentru erori
3. Testează funcționalitățile:
   - Login
   - Adăugare quote pe perete
   - Voting
   - Reclamații

## 6. Update-uri viitoare

Când faci modificări:
1. Push pe GitHub
2. Vercel va face auto-deploy automat
3. Sau rulează `vercel --prod` manual

---

**Succes! 🚀**

