// Ce avem noi aici? Data structures pentru nebunie.
// Nu judeca, frate, e spaghetti code certificat.

export type CategoryId = 'MFP' | 'CRINGE' | 'DRUNK' | 'MISS' | 'DJ' | 'SIGMA' | 'RIZZ' | 'GYATT' | 'FANUM' | 'SKIBIDI' | 'DANCE' | 'PHOTO';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

export interface User {
  name: string;
  id: string; // Timestamp ca ID, ca suntem lenesi
}

export interface Vote {
  voter: string;
  candidate: string;
  category: CategoryId;
}

export interface Quote {
  id: string;
  author: string; // Cine a zis prostia
  text: string;   // Ce a zis
  addedBy: string; // Cine l-a turnat
  timestamp: number;
}

export interface Complaint {
  id: string;
  text: string;   // Textul reclamației
  aiReply: string; // Răspunsul AI
  timestamp: number;
  // NU salvăm numele utilizatorului - anonim!
}

export const CATEGORIES: Category[] = [
  { id: 'MFP', name: 'MFP (Type Shit)', description: 'Cine a dat dumele alea bune? Ha ha cee? (Skibidi edition) 🚽', emoji: '👑', color: 'bg-lime-400' },
  { id: 'CRINGE', name: 'Yakka Na (Cringe)', description: 'Momentul ăla când vrei să te ascunzi. Iaca... (6 7 vibes) 🚓', emoji: '💀', color: 'bg-orange-400' },
  { id: 'DRUNK', name: 'Daună Totală (Bere)', description: 'S-a rupt filmul, n-ai treabă fra. Tralalelo tralala! 🎵', emoji: '🍺', color: 'bg-cyan-400' },
  { id: 'MISS', name: 'Miss Cabana (Sase Sapte)', description: 'Cine e low key bombă? Sigma rizz! 🤌', emoji: '💅', color: 'bg-pink-500' },
  { id: 'DJ', name: 'DJ-ul de la 3 AM', description: 'Cine a pus muzică de înmormântare? (Skibidi toilet remix) 🎵', emoji: '🎧', color: 'bg-purple-500' },
  { id: 'SIGMA', name: 'Sigma Male', description: 'Cine e cel mai sigma? Rizz master! 💪', emoji: '🗿', color: 'bg-gray-600' },
  { id: 'RIZZ', name: 'Rizz God', description: 'Cine are rizz-ul cel mai tare? Gyatt check! 😎', emoji: '🔥', color: 'bg-red-500' },
  { id: 'GYATT', name: 'Gyatt Check', description: 'Cine a făcut cel mai bun gyatt check? (6 7 vine garda) 👀', emoji: '👀', color: 'bg-yellow-400' },
  { id: 'FANUM', name: 'Fanum Tax', description: 'Cine a dat cel mai mare fanum tax? 💸', emoji: '💰', color: 'bg-green-500' },
  { id: 'SKIBIDI', name: 'Skibidi Toilet', description: 'Cine e cel mai skibidi? 🚽', emoji: '🚽', color: 'bg-blue-500' },
  { id: 'DANCE', name: 'Dance Battle', description: 'Cine a dansat cel mai bine? Tralalelo tralala! 💃', emoji: '🕺', color: 'bg-indigo-500' },
  { id: 'PHOTO', name: 'Photo Dump', description: 'Cine a făcut cel mai bun photo dump? 📸', emoji: '📸', color: 'bg-rose-400' },
];