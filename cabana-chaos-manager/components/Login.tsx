import React, { useState, useEffect } from 'react';
import { BrutalButton } from './BrutalButton';
import { storage } from '../services/storage';
import { askAI, prompts } from '../services/ai';
import { hasSupabaseConfig } from '../services/supabaseConfig';

interface Props {
  onLogin: (name: string) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [existingUsers, setExistingUsers] = useState<string[]>([]);
  const [mode, setMode] = useState<'SELECT' | 'CREATE'>('CREATE');
  const [roast, setRoast] = useState<string | null>(null);
  const [loadingRoast, setLoadingRoast] = useState(false);

  useEffect(() => {
    const unsubscribe = storage.subscribeToUsers((users) => {
      setExistingUsers(users);
      if (users.length > 0 && mode === 'CREATE') {
        setMode('SELECT');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleNameBlur = async () => {
    if (name.length > 2 && !roast) {
        setLoadingRoast(true);
        const aiResponse = await askAI(prompts.roastUser(name));
        setRoast(aiResponse);
        setLoadingRoast(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nu fi npc, bagă un nume! 🤌");
      return;
    }
    onLogin(name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4" style={{ background: 'transparent' }}>
      <div className="bg-lime-400 text-black border-4 border-black p-4 shadow-[8px_8px_0px_0px_#fff] max-w-sm w-full rotate-2 animate-glitch relative overflow-hidden group" style={{ transform: 'scale(0.8)' }}>
         
         {!hasSupabaseConfig() && (
             <div className="bg-red-600 text-white text-xs font-bold p-1 text-center border-b-4 border-black mb-4 animate-pulse">
                 ⚠️ RULEZI PE LOCAL STORAGE. 
                 <br/>Adaugă VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY în .env.local!
             </div>
         )}

         <div className="absolute -top-8 -right-8 bg-yellow-300 w-16 h-16 rotate-45 border-3 border-black z-0"></div>

        <h1 className="text-3xl font-black mb-4 text-center uppercase leading-none bg-black text-white p-2 border-2 border-white -rotate-3 transform hover:scale-110 transition-transform relative z-10">
          Cine ești, <span className="text-pink-500 block text-xl mt-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">Coachul meu? 🤙</span>
        </h1>

        {existingUsers.length > 0 && mode === 'SELECT' ? (
           <div className="flex flex-col gap-4 relative z-10">
              <div className="bg-white border-3 border-black p-3 rotate-1">
                <label className="block font-black text-lg mb-1.5 uppercase">Alege-te din listă:</label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {existingUsers.map(u => (
                    <button 
                      key={u}
                      onClick={() => onLogin(u)}
                      className="text-left font-bold text-base p-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors uppercase"
                    >
                      👤 {u}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <span className="font-bold bg-black text-white px-2">SAU</span>
              </div>

              <BrutalButton 
                variant="neutral"
                onClick={() => setMode('CREATE')}
                className="text-sm py-2"
              >
                SUNT CARNE PROASPĂTĂ (User Nou) 🐣
              </BrutalButton>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-2 relative">
              <label className="absolute -top-4 left-2 font-black text-xl text-white bg-black px-2 border-2 border-pink-500 rotate-2 z-10 shadow-[2px_2px_0px_0px_white]">
                CUM TE STRIGĂ?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="Ex: Regele la Bere 🍺 (sau Skibidi Sigma 🚽)"
                className="p-3 text-lg border-2 border-black font-black focus:outline-none focus:bg-pink-300 bg-white text-black placeholder-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-1 transition-all focus:scale-105"
                autoFocus
              />
              {loadingRoast && <div className="text-xs font-bold animate-pulse">Se încarcă insulta...</div>}
              {roast && (
                  <div className="bg-black text-cyan-300 p-2 text-sm font-bold border-2 border-white -rotate-1 animate-bounce">
                      {roast}
                  </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <BrutalButton type="submit" className="w-full text-lg py-3 border-2 border-white bg-black text-lime-400 hover:bg-gray-900 hover:text-white shadow-[4px_4px_0px_0px_#ff00ff] hover:shadow-none hover:translate-x-2 hover:translate-y-2">
                INTRĂ PE ZONĂ 🤌
              </BrutalButton>
              
              {existingUsers.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setMode('SELECT')}
                  className="font-bold underline hover:text-white"
                >
                  &laquo; Înapoi la listă
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-8 text-sm text-center font-mono text-black font-bold bg-white/60 p-2 border-2 border-black rotate-1">
           {hasSupabaseConfig() ? "✅ Cloud Conectat" : "⚠️ Mod Offline"}
        </div>
      </div>
    </div>
  );
};