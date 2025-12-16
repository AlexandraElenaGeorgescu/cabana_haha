import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";
import { AI_CONFIG, FALLBACK_RESPONSES, PROMPT_KEYWORDS } from "../constants";

// Type definitions for safety settings
type SafetySetting = {
  category: string;
  threshold: string;
};

// ⚠️ SAFETY OFF: Lăsăm AI-ul să fie "unhinged".
// NOTE: All safety filters are disabled for unrestricted content generation.
// This is intentional for the app's humor style but should be documented.
const safetyConfig: SafetySetting[] = [
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
    logger.warn("Error reading API key:", e);
    return '';
  }
};

// Extract fallback logic to shared function
const getFallbackResponse = (prompt: string): string => {
  if (prompt.includes(PROMPT_KEYWORDS.ROAST)) {
    return FALLBACK_RESPONSES.ROASTS[Math.floor(Math.random() * FALLBACK_RESPONSES.ROASTS.length)];
  }
  if (prompt.includes(PROMPT_KEYWORDS.MANAGER)) {
    return FALLBACK_RESPONSES.MANAGER_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.MANAGER_RESPONSES.length)];
  }
  if (prompt.includes(PROMPT_KEYWORDS.DARE)) {
    return FALLBACK_RESPONSES.DARES[Math.floor(Math.random() * FALLBACK_RESPONSES.DARES.length)];
  }
  return FALLBACK_RESPONSES.DEFAULT;
};

export const askAI = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  // Debug log to help troubleshoot
  if (apiKey) {
      logger.debug("✅ API Key loaded successfully (Free Tier Ready)");
      logger.debug("🔑 Key starts with:", apiKey.substring(0, 10) + "...");
  } else {
      logger.warn("⚠️ API Key not found. Check .env.local file and restart dev server.");
      logger.info("📝 Get FREE API key from: https://aistudio.google.com/app/apikey");
      logger.info("💡 Add to .env.local: VITE_GEMINI_API_KEY=your-key-here");
  }

  // FALLBACK PENTRU SARAKI (Fara API Key)
  if (!apiKey) {
      logger.warn("⚠️ Lipsă API KEY. Folosim răspunsuri 'din burtă' ca să meargă aplicația.");
      
      // Simulam un delay ca sa para ca gandeste
      await new Promise(r => setTimeout(r, AI_CONFIG.FALLBACK_DELAY_MS));

      return getFallbackResponse(prompt) || FALLBACK_RESPONSES.NO_API_KEY;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try multiple models in order - starting with free tier models
    // Using correct model names that exist in Google AI Studio
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.0-pro'];
    let lastError: Error | null = null;
    
    for (const modelName of models) {
      try {
        logger.debug(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          safetySettings: safetyConfig,
          generationConfig: {
            temperature: AI_CONFIG.TEMPERATURE,
            topP: AI_CONFIG.TOP_P,
            topK: AI_CONFIG.TOP_K,
            // NO LIMITS - Let AI respond freely
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text && text.trim()) {
          logger.debug(`✅ Success with model: ${modelName}`);
          // Return raw response - no cleaning, no limits
          return text.trim();
        }
      } catch (modelError: unknown) {
        const error = modelError as { message?: string; code?: string; status?: number; statusText?: string };
        logger.warn(`⚠️ Model ${modelName} failed:`, error?.message || modelError);
        logger.debug(`📋 Error details:`, {
          code: error?.code,
          status: error?.status,
          statusText: error?.statusText
        });
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError));
        continue;
      }
    }
    
    throw lastError || new Error('All models failed');
    
  } catch (e: unknown) {
    const error = e as { message?: string; status?: number; statusText?: string; code?: string };
    logger.error("❌ AI Error Details:", {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      code: error?.code,
    });
    logger.info("💡 Troubleshooting tips:");
    logger.info("   1. Check if API key is correct in .env.local (VITE_GEMINI_API_KEY)");
    logger.info("   2. Verify API key at: https://aistudio.google.com/app/apikey");
    logger.info("   3. Check if you've exceeded free tier quota (15 req/min, 1.5M tokens/day)");
    logger.info("   4. Restart dev server after changing .env.local");
    
    // Check error type
    const errorMsg = (error?.message || '').toLowerCase();
    const errorStr = JSON.stringify(error || {}).toLowerCase();
    
    if (errorMsg.includes('quota') || errorMsg.includes('exhausted') || errorMsg.includes('429') || errorStr.includes('quota')) {
      logger.warn("⚠️ API quota exceeded. Using fallback.");
      return getFallbackResponse(prompt);
    }
    
    if (errorMsg.includes('api key') || errorMsg.includes('invalid') || errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('permission')) {
      logger.warn("⚠️ Invalid API key or permission denied. Using fallback.");
      return getFallbackResponse(prompt);
    }
    
    if (errorMsg.includes('model') || errorMsg.includes('not found') || errorMsg.includes('404')) {
      logger.warn("⚠️ Model not found. Using fallback.");
      return getFallbackResponse(prompt);
    }
    
    // Generic fallback for any error
    logger.warn("⚠️ Unknown AI error. Using fallback.");
    return getFallbackResponse(prompt);
  }
};

export const prompts = {
  roastUser: (name: string) => `
    Ești "Ceață", un Gen Z arogant cu TikTok brainrot care judecă oamenii după nume.
    Tocmai a intrat unul pe nume "${name}".
    Dă-i un roast (insultă fină) cu referințe la skibidi, "6 7 vine garda", tralalelo tralala, sau alte meme-uri TikTok.
    
    Folosește "rom-gleză" (mix română-engleză), slang de cartier, referințe la skibidi toilet, "6 7 vine garda", tralalelo.
    Fii amuzant, nu doar răutăcios. Brainrot energy.
    Poți folosi: "skibidi", "6 7", "tralalelo tralala", "sigma", "rizz", "gyatt", "fanum tax", etc.
    
    Răspunde doar cu roast-ul, fără explicații suplimentare.
  `,
  
  roastComplaint: (complaint: string) => `
    Ești un Manager de Cabană cu atitudine de "Corporatist Bombardier" care știe toate meme-urile TikTok.
    Clientul se plânge: "${complaint}".
    Răspunde-i că ai notat, dar folosește un limbaj de lemn amestecat cu nepăsare totală și referințe la skibidi, "6 7 vine garda", tralalelo tralala.
    
    Folosește cuvinte gen: "tichet", "escaladăm", "vibe check", "nu e în buget", "skill issue", "low key", "skibidi", "6 7", "tralalelo", "sigma", "rizz".
    Răspunsul trebuie să fie o propoziție completă cu brainrot energy.
    Poți menționa "6 7 vine garda" sau alte meme-uri relevante.
    
    Răspunde doar cu textul răspunsului, fără explicații suplimentare.
  `,

  pacaneleDare: () => `
    Ești maestrul de ceremonii la o petrecere de tineri, beat și haotic, cu TikTok brainrot complet.
    Generează o PROVOCARE (Dare) completă și clară pentru cineva de la masă.
    
    Să fie o frază completă! Nu da doar un cuvânt.
    Stil: Gen Z, TikTok brainrot, "Bombă", Amuzant, Slang, Skibidi energy.
    Teme: Dans penibil, telefon (foste/grupuri), imitații, recunoașteri, skibidi, "6 7 vine garda", tralalelo tralala.
    Poți include referințe la: skibidi toilet, "6 7 vine garda", tralalelo tralala, sigma, rizz, gyatt, fanum tax, sau alte meme-uri TikTok.
    Fii creativ și haotic!
    
    Răspunde doar cu provocarea, fără explicații suplimentare.
  `
};