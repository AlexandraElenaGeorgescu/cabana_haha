import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ SAFETY OFF: Lăsăm AI-ul să fie "unhinged".
// @ts-ignore - Safety settings for unrestricted content
const safetyConfig: any = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

// Get API key from environment - Vite automatically loads .env.local
// Variables prefixed with VITE_ are exposed via import.meta.env
const getApiKey = (): string => {
  try {
    // Vite's standard way: use import.meta.env for environment variables
    // Check both VITE_GEMINI_API_KEY (standard) and GEMINI_API_KEY (fallback)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
    return apiKey || '';
  } catch (e) {
    console.warn("Error reading API key:", e);
    return '';
  }
};

export const askAI = async (prompt: string, maxTokens = 250) => {
  const apiKey = getApiKey();
  
  // Debug log to help troubleshoot
  if (apiKey) {
      console.log("✅ API Key loaded successfully (Free Tier Ready)");
      console.log("🔑 Key starts with:", apiKey.substring(0, 10) + "...");
  } else {
      console.warn("⚠️ API Key not found. Check .env.local file and restart dev server.");
      console.warn("📝 Get FREE API key from: https://aistudio.google.com/app/apikey");
      console.warn("💡 Add to .env.local: VITE_GEMINI_API_KEY=your-key-here");
  }

  // FALLBACK PENTRU SARAKI (Fara API Key)
  if (!apiKey) {
      console.warn("⚠️ Lipsă API KEY. Folosim răspunsuri 'din burtă' ca să meargă aplicația.");
      
      // Simulam un delay ca sa para ca gandeste
      await new Promise(r => setTimeout(r, 1000));

      if (prompt.includes("roast (insultă fină)")) {
          return "N-am buget de roast, dar arăți de parcă ai picat Bac-ul la desen. 🎨";
      }
      if (prompt.includes("Manager de Cabană")) {
          return "Am notat pe o foaie invizibilă. Arunc-o la gunoi singur. 🚮";
      }
      if (prompt.includes("PROVOCARE")) {
          return "Dansează Macarena pe silențios până observă cineva. 💃";
      }
      return "AI-ul e în grevă (Bagă API Key).";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try multiple models in order - starting with free tier models
    // Using correct model names that exist in Google AI Studio
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.0-pro'];
    let lastError: any = null;
    
    for (const modelName of models) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          safetySettings: safetyConfig,
          generationConfig: {
            temperature: 1.6,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: maxTokens,
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text && text.trim()) {
          console.log(`✅ Success with model: ${modelName}`);
          return text.trim();
        }
      } catch (modelError: any) {
        console.warn(`⚠️ Model ${modelName} failed:`, modelError?.message || modelError);
        console.warn(`📋 Error details:`, {
          code: modelError?.code,
          status: modelError?.status,
          statusText: modelError?.statusText
        });
        lastError = modelError;
        continue;
      }
    }
    
    throw lastError || new Error('All models failed');
    
  } catch (e: any) {
    console.error("❌ AI Error Details:", {
      message: e?.message,
      status: e?.status,
      statusText: e?.statusText,
      code: e?.code,
      error: e
    });
    console.error("💡 Troubleshooting tips:");
    console.error("   1. Check if API key is correct in .env.local (VITE_GEMINI_API_KEY)");
    console.error("   2. Verify API key at: https://aistudio.google.com/app/apikey");
    console.error("   3. Check if you've exceeded free tier quota (15 req/min, 1.5M tokens/day)");
    console.error("   4. Restart dev server after changing .env.local");
    
    // Helper function for fallback
    const getFallback = () => {
      if (prompt.includes("roast (insultă fină)")) {
        const roasts = [
          "N-am buget de roast, dar arăți de parcă ai picat Bac-ul la desen. 🎨",
          "Skibidi toilet ar fi mândru de tine. 🚽",
          "6 7 vine garda să te ia pentru vibe-ul ăsta. 🚓",
          "Tralalelo tralala, dar tu ești tralala fail. 🎵"
        ];
        return roasts[Math.floor(Math.random() * roasts.length)];
      }
      if (prompt.includes("Manager de Cabană")) {
        const responses = [
          "Am notat pe o foaie invizibilă. Arunc-o la gunoi singur. 🚮",
          "Skibidi! Am notat, dar 6 7 vine garda să verifice. 🚽🚓",
          "Tralalelo tralala, am notat tichetul tău. 🎵",
          "Sigma rizz response: am notat, low key. 💀"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      if (prompt.includes("PROVOCARE")) {
        const dares = [
          "Dansează Macarena pe silențios până observă cineva. 💃",
          "Fă skibidi dance până observă cineva. 🚽",
          "Strigă '6 7 VINE GARDA' cât mai tare. 🚓",
          "Cântă 'tralalelo tralala' în fața tuturor. 🎵"
        ];
        return dares[Math.floor(Math.random() * dares.length)];
      }
      return "AI-ul e în grevă. Skibidi! 🚽";
    };
    
    // Check error type
    const errorMsg = (e?.message || '').toLowerCase();
    const errorStr = JSON.stringify(e || {}).toLowerCase();
    
    if (errorMsg.includes('quota') || errorMsg.includes('exhausted') || errorMsg.includes('429') || errorStr.includes('quota')) {
      console.warn("⚠️ API quota exceeded. Using fallback.");
      return getFallback();
    }
    
    if (errorMsg.includes('api key') || errorMsg.includes('invalid') || errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('permission')) {
      console.warn("⚠️ Invalid API key or permission denied. Using fallback.");
      return getFallback();
    }
    
    if (errorMsg.includes('model') || errorMsg.includes('not found') || errorMsg.includes('404')) {
      console.warn("⚠️ Model not found. Using fallback.");
      return getFallback();
    }
    
    // Generic fallback for any error
    console.warn("⚠️ Unknown AI error. Using fallback.");
    return getFallback();
  }
};

export const prompts = {
  roastUser: (name: string) => `
    Ești "Ceață", un Gen Z arogant cu TikTok brainrot care judecă oamenii după nume.
    Tocmai a intrat unul pe nume "${name}".
    Dă-i un roast (insultă fină) scurtă cu referințe la skibidi, "6 7 vine garda", tralalelo tralala, sau alte meme-uri TikTok.
    
    REGULI STRICTE:
    1. Folosește "rom-gleză" (mix română-engleză), slang de cartier, sau referințe la skibidi toilet, "6 7 vine garda", tralalelo.
    2. Fii amuzant, nu doar răutăcios. Brainrot energy.
    3. MAXIM 80 CARACTERE (inclusiv spații și emoji-uri). RESPECTĂ ACEASTĂ LIMITĂ - nu depăși sub nicio formă.
    4. Poți folosi: "skibidi", "6 7", "tralalelo tralala", "sigma", "rizz", "gyatt", "fanum tax", etc.
    5. IMPORTANT: Răspunsul tău trebuie să fie EXACT sub 80 de caractere. Verifică înainte să răspunzi.
    
    OUTPUT FINAL: Doar textul roast-ului, fără ghilimele, fără explicații, fără text suplimentar. Doar roast-ul.
  `,
  
  roastComplaint: (complaint: string) => `
    Ești un Manager de Cabană cu atitudine de "Corporatist Bombardier" care știe toate meme-urile TikTok.
    Clientul se plânge: "${complaint}".
    Răspunde-i că ai notat, dar folosește un limbaj de lemn amestecat cu nepăsare totală și referințe la skibidi, "6 7 vine garda", tralalelo tralala.
    
    REGULI STRICTE:
    1. Folosește cuvinte gen: "tichet", "escaladăm", "vibe check", "nu e în buget", "skill issue", "low key", "skibidi", "6 7", "tralalelo", "sigma", "rizz".
    2. Răspunsul trebuie să fie o propoziție completă cu brainrot energy.
    3. MAXIM 120 CARACTERE (inclusiv spații și emoji-uri). RESPECTĂ ACEASTĂ LIMITĂ - nu depăși sub nicio formă.
    4. Poți menționa "6 7 vine garda" sau alte meme-uri relevante.
    5. IMPORTANT: Răspunsul tău trebuie să fie EXACT sub 120 de caractere. Verifică înainte să răspunzi.

    OUTPUT FINAL: Doar textul răspunsului, fără ghilimele, fără explicații, fără text suplimentar. Doar răspunsul.
  `,

  pacaneleDare: () => `
    Ești maestrul de ceremonii la o petrecere de tineri, beat și haotic, cu TikTok brainrot complet.
    Generează o PROVOCARE (Dare) completă și clară pentru cineva de la masă.
    
    REGULI STRICTE:
    1. Să fie o frază completă! Nu da doar un cuvânt.
    2. Stil: Gen Z, TikTok brainrot, "Bombă", Amuzant, Slang, Skibidi energy.
    3. Teme: Dans penibil, telefon (foste/grupuri), imitații, recunoașteri, skibidi, "6 7 vine garda", tralalelo tralala.
    4. Poți include referințe la: skibidi toilet, "6 7 vine garda", tralalelo tralala, sigma, rizz, gyatt, fanum tax, sau alte meme-uri TikTok.
    5. Fii creativ și haotic!
    6. MAXIM 150 CARACTERE (inclusiv spații și emoji-uri). RESPECTĂ ACEASTĂ LIMITĂ - nu depăși sub nicio formă.
    7. IMPORTANT: Provocarea ta trebuie să fie EXACT sub 150 de caractere. Verifică înainte să răspunzi.

    OUTPUT FINAL: Doar provocarea, fără ghilimele, fără explicații, fără text suplimentar. Doar provocarea.
  `
};