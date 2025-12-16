import React, { useState } from 'react';
import { BrutalButton } from './BrutalButton';
import { askAI, prompts } from '../services/ai';

const STATIC_DARES = [
  "Baga un shot. Fără discuții. 🥃",
  "Dansează pe manele 1 minut. 💃",
  "Sun-o pe fosta. (Glumesc, doar un shot)",
  "Fă 10 flotări, coachul meu. 💪",
  "Imită-l pe organizator cum se enervează.",
  "Nu mai ai voie să zici 'nu' timp de 10 min.",
  "Fă cinste cu o bere la primul venit. 🍺",
  "Povestește cel mai cringe moment al tău. 💀",
  "Arată ultima poză din galerie. Fără trișat. 📸",
  "Bea apă. Hidratează-te, ești praf. 💧",
  "Fă skibidi dance până observă cineva. 🚽",
  "Strigă '6 7 VINE GARDA' cât mai tare. 🚓",
  "Cântă 'tralalelo tralala' în fața tuturor. 🎵",
  "Imită un skibidi toilet character. 🚽",
  "Spune 'sigma rizz' la fiecare răspuns 5 minute. 💀",
  "Fă gyatt check la toată lumea. 👀",
  "Povestește despre fanum tax-ul tău. 💸",
  "Dansează ca un sigma male. 🕺"
];

export const Roata: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [loadingText, setLoadingText] = useState("Se încarcă nebunia...");

  const spin = async () => {
    setSpinning(true);
    setResult(null);
    
    // Fun loading messages with brainrot
    const loaders = [
        "Întrebăm sateliții lui Bill Gates... 📡",
        "Se calculează cât ești de praf... 🧮",
        "Vorbesc cu Dani Mocanu... 📞",
        "Se generează umilința... 💀",
        "Skibidi toilet se gândește... 🚽",
        "6 7 vine garda să verifice... 🚓",
        "Tralalelo tralala se procesează... 🎵",
        "Sigma rizz calculator activ... 💀",
        "Gyang verifică vibe-ul... 👀",
        "Fanum tax se calculează... 💸"
    ];
    
    let step = 0;
    const interval = setInterval(() => {
        setLoadingText(loaders[step % loaders.length]);
        step++;
    }, 500);

    // Call AI with UNLOCKED safety settings
    const aiResult = await askAI(prompts.pacaneleDare());
    
    clearInterval(interval);
    
    setTimeout(() => {
        setSpinning(false);
        if (aiResult) {
            setResult(aiResult);
        } else {
            // Fallback to static
            const randomDare = STATIC_DARES[Math.floor(Math.random() * STATIC_DARES.length)];
            setResult(randomDare + " (AI-ul e mort, asta e de la noi)");
        }
    }, 500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center px-2 sm:px-4" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
       <div className="bg-yellow-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
          <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 bg-black text-white p-2 border-2 border-white inline-block -rotate-2">
            Păcănelele <span className="text-lime-400">AI</span> 🤖 (Skibidi Brainrot)
          </h2>
          
          <p className="mb-4 font-bold text-base uppercase bg-white border-2 border-black inline-block p-2 rotate-1 shadow-[2px_2px_0px_0px_black]">
            Provocări generate de <span className="text-purple-600 font-black">INTELIGENȚA ARTIFICIALĂ</span> (6 7, Skibidi, Tralalelo Edition 🚽🎵)
          </p>

          <div className="min-h-[150px] flex items-center justify-center mb-4 relative">
             {spinning ? (
               <div className="flex flex-col items-center gap-4">
                   <div className="text-5xl animate-spin">😵‍💫</div>
                   <div className="text-lg font-black bg-black text-white px-2 py-1.5 animate-pulse border-2 border-white">
                       {loadingText}
                   </div>
               </div>
             ) : result ? (
                <div className="relative group w-full">
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative bg-white border-4 border-black p-4 md:p-6 rotate-1 animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                       <p className="text-lg md:text-2xl lg:text-3xl font-black uppercase text-black leading-relaxed break-words whitespace-pre-wrap">
                           {result}
                       </p>
                    </div>
                </div>
             ) : (
               <div className="text-6xl animate-bounce cursor-pointer hover:scale-110 transition-transform" onClick={spin}>
                   🎲
               </div>
             )}
          </div>

          <BrutalButton 
            onClick={spin} 
            disabled={spinning}
            className="w-full text-lg md:text-xl py-3 bg-purple-600 text-white hover:bg-purple-500 border-white shadow-[4px_4px_0px_0px_black] relative overflow-hidden"
          >
            {spinning ? 'SE PRĂJEȘTE PROCESORUL...' : 'DĂ-I SĂ ZÂZÂIE! 🚀'}
            
            {/* Gloss effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 -skew-x-12 translate-x-full hover:translate-x-[-200%] transition-transform duration-1000"></div>
          </BrutalButton>

          <div className="mt-6 opacity-70 font-mono text-sm font-bold bg-black/10 inline-block p-2">
            * 100% Chaos Powered.
          </div>
       </div>
    </div>
  );
};