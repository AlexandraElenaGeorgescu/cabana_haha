// Application constants - centralized configuration

export const AI_CONFIG = {
  FALLBACK_DELAY_MS: 1000,
  TEMPERATURE: 1.8,
  TOP_P: 0.95,
  TOP_K: 40,
} as const;

export const UI_CONFIG = {
  SCALE_FACTOR: 0.8,
  EXPLOSION_DURATION_MS: 1000,
  DEBOUNCE_DELAY_MS: 500,
} as const;

export const FALLBACK_RESPONSES = {
  ROASTS: [
    "N-am buget de roast, dar arăți de parcă ai picat Bac-ul la desen. 🎨",
    "Skibidi toilet ar fi mândru de tine. 🚽",
    "6 7 vine garda să te ia pentru vibe-ul ăsta. 🚓",
    "Tralalelo tralala, dar tu ești tralala fail. 🎵"
  ],
  MANAGER_RESPONSES: [
    "Am notat pe o foaie invizibilă. Arunc-o la gunoi singur. 🚮",
    "Skibidi! Am notat, dar 6 7 vine garda să verifice. 🚽🚓",
    "Tralalelo tralala, am notat tichetul tău. 🎵",
    "Sigma rizz response: am notat, low key. 💀"
  ],
  DARES: [
    "Dansează Macarena pe silențios până observă cineva. 💃",
    "Fă skibidi dance până observă cineva. 🚽",
    "Strigă '6 7 VINE GARDA' cât mai tare. 🚓",
    "Cântă 'tralalelo tralala' în fața tuturor. 🎵"
  ],
  DEFAULT: "AI-ul e în grevă. Skibidi! 🚽",
  NO_API_KEY: "AI-ul e în grevă (Bagă API Key)."
} as const;

export const PROMPT_KEYWORDS = {
  ROAST: "roast (insultă fină)",
  MANAGER: "Manager de Cabană",
  DARE: "PROVOCARE"
} as const;
