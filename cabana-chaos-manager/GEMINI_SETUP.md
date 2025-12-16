# Setup Gemini API (Free Tier) - Ghid Complet

## 🆓 Cum să obții API Key GRATUIT de la Google

### Pasul 1: Creează cont Google AI Studio
1. Mergi la: **https://aistudio.google.com/app/apikey**
2. Loghează-te cu contul tău Google
3. Dacă e prima dată, acceptă termenii și condițiile

### Pasul 2: Creează API Key
1. Click pe butonul **"Create API Key"** (sau "Get API Key")
2. Alege "Create API key in new project" (sau folosește un proiect existent)
3. **IMPORTANT**: Copiază API key-ul imediat! Nu vei mai putea să-l vezi după.

### Pasul 3: Adaugă în .env.local
Deschide fișierul `.env.local` și adaugă:
```
VITE_GEMINI_API_KEY=your-api-key-here
```

### Pasul 4: Restart Dev Server
Oprește serverul (Ctrl+C) și pornește din nou:
```bash
npm run dev
```

## 💰 Free Tier Limits (GRATUIT)

### Gemini 1.5 Flash (Recomandat - GRATUIT)
- **15 requests per minute** (RPM)
- **1,500,000 tokens per day** (TPD)
- **1,000,000 tokens per minute** (TPM)
- **Perfect pentru aplicația ta!**

### Gemini 2.0 Flash Exp (Experimental - GRATUIT)
- Similar limits
- Mai nou, dar experimental

## ⚠️ Important

1. **NU activezi facturarea** dacă vrei să rămâi pe free tier
2. **Monitorizează utilizarea** în Google AI Studio dashboard
3. **API key-ul e gratuit** - nu te costă nimic până activezi facturarea

## 🔍 Verificare

După ce adaugi API key-ul:
1. Deschide browser console (F12)
2. Caută mesajul: "✅ API Key loaded successfully"
3. Dacă vezi "⚠️ API Key not found" - verifică `.env.local` și restart server

## 🆘 Probleme?

### "Exhausted tokens" sau "Quota exceeded"
- Verifică în Google AI Studio dacă ai depășit limita zilnică
- Așteaptă până a doua zi (resetează la 00:00 UTC)
- Sau creează un API key nou

### "Invalid API key"
- Verifică că ai copiat corect key-ul (fără spații)
- Verifică că începe cu `AIzaSy...`
- Restart dev server după ce adaugi key-ul

### "Model not found"
- Aplicația va încerca automat alte modele
- Dacă toate eșuează, folosește fallback responses

## 📝 Link-uri utile

- **Google AI Studio**: https://aistudio.google.com/app/apikey
- **Documentație**: https://ai.google.dev/docs
- **Pricing (Free Tier)**: https://ai.google.dev/pricing

