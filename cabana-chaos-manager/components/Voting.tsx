import React, { useState, useEffect } from 'react';
import { CATEGORIES, CategoryId, Vote } from '../types';
import { storage } from '../services/storage';
import { BrutalButton } from './BrutalButton';

interface Props {
  currentUser: string;
}

export const Voting: React.FC<Props> = ({ currentUser }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('MFP');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [explosion, setExplosion] = useState(false);

  useEffect(() => {
    const unsubUsers = storage.subscribeToUsers((u) => setUsers(u));
    const unsubVotes = storage.subscribeToVotes((v) => setVotes(v));
    return () => {
        unsubUsers();
        unsubVotes();
    };
  }, []);

  const handleVote = async () => {
    if (!selectedUser) {
      alert('Alo, n-ai treabă fra? Alege pe cineva!');
      return;
    }
    
    const newVote: Vote = {
      voter: currentUser,
      candidate: selectedUser,
      category: activeCategory
    };

    await storage.addVote(newVote);
    
    // TRASH EXPLOSION FX
    setExplosion(true);
    setTimeout(() => setExplosion(false), 1000);
  };

  const getResults = (catId: CategoryId) => {
    const catVotes = votes.filter(v => v.category === catId);
    const counts: Record<string, number> = {};
    
    // Initialize counts with existing users to handle 0 votes properly if needed,
    // but here we just map candidates.
    catVotes.forEach(v => counts[v.candidate] = (counts[v.candidate] || 0) + 1);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a);
  };

  const activeCatData = CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-2 sm:px-4" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-4 justify-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              p-3 border-4 border-black font-black uppercase text-sm md:text-base transition-all transform
              ${activeCategory === cat.id 
                ? `${cat.color} text-black -translate-y-2 scale-110 shadow-[6px_6px_0px_0px_white] z-10 rotate-2 ring-2 ring-black` 
                : 'bg-white text-black shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:rotate-1 hover:bg-gray-100'}
            `}
          >
            <span className="text-xl block animate-bounce">{cat.emoji}</span> {cat.id}
          </button>
        ))}
      </div>

      <div className={`border-4 border-black p-4 ${activeCatData.color} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-colors duration-300`}>
        {/* Background Noise visual element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>

        <div className="bg-black text-white p-3 border-2 border-white -rotate-1 mb-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform hover:rotate-2">
            <h2 className="text-2xl md:text-4xl font-black uppercase leading-none rainbow-border border-b-2">
            Gala: <span className="text-yellow-400">{activeCatData.name}</span>
            </h2>
        </div>
        
        <div className="block mb-4">
            <p className="font-bold text-lg md:text-xl text-black bg-white/90 p-2 border-2 border-black inline-block transform rotate-1 shadow-[3px_3px_0px_0px_black]">
                "{activeCatData.description}"
            </p>
        </div>

        {/* Voting Mechanism - SUPER HIGH CONTRAST */}
        <div className="bg-blue-600 border-4 border-black p-4 mb-6 -rotate-1 shadow-[6px_6px_0px_0px_#ff00ff] relative group hover:rotate-0 transition-transform">
          <div className="absolute -top-6 left-3 bg-black text-lime-400 font-black text-2xl px-4 py-1.5 border-2 border-white transform -rotate-2 animate-pulse shadow-[3px_3px_0px_0px_lime]">
              NASUL SAU PULA? 🎰
          </div>
          <div className="mt-4 flex gap-3 flex-col sm:flex-row">
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 p-3 border-2 border-black bg-white text-black font-black text-lg focus:outline-none focus:bg-lime-300 focus:text-black focus:ring-2 ring-black shadow-[3px_3px_0px_0px_black] cursor-pointer"
            >
              <option value="" className="bg-white text-black">-- CINE ȘI-O IA? --</option>
              {users.map(u => (
                <option key={u} value={u} className="bg-white text-black font-bold">{u}</option>
              ))}
            </select>
            <BrutalButton onClick={handleVote} className="bg-red-600 text-white hover:bg-red-500 border-black text-lg shadow-[4px_4px_0px_0px_white] hover:shadow-[3px_3px_0px_0px_black] hover:scale-105">
              DĂ-I FRATE 💣
            </BrutalButton>
          </div>
          
          {explosion && (
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
               <div className="animate-bounce text-8xl font-black text-yellow-400 absolute transform rotate-12 drop-shadow-[0_10px_10px_rgba(255,255,0,0.8)]">BOOM!</div>
               <div className="animate-ping text-6xl font-black text-lime-400 absolute">TYPE SHIT!</div>
               <div className="text-9xl absolute top-1/4 right-1/4 animate-spin">🍺</div>
               <div className="text-9xl absolute bottom-1/4 left-1/4 animate-spin" style={{animationDirection: 'reverse'}}>🤌</div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase bg-white text-black border-2 border-black inline-block px-3 py-1.5 transform skew-x-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
            Fii pe faza ce urmează 👇 (6 7 vibes)
          </h3>
          
          <div className="bg-black/40 border-2 border-black p-4 shadow-inner backdrop-blur-sm">
            {getResults(activeCategory).length === 0 ? (
              <div className="text-center font-black text-lg text-black bg-white p-3 border-2 border-black rotate-1 animate-pulse">
                  Liniște totală. Hai cu votul ăla, <span className="text-purple-600">low key</span>. Skibidi! 🚽
              </div>
            ) : (
              getResults(activeCategory).map(([user, count], idx) => {
                 const maxVotes = Math.max(...getResults(activeCategory).map(([,c]) => c));
                 const percentage = (count / maxVotes) * 100;
                 
                 return (
                  <div key={user} className="mb-6 last:mb-0 relative group">
                    <div className="flex justify-between items-end font-black mb-2 text-black z-10 relative">
                      <span className="bg-white px-3 py-1 border-4 border-black text-xl transform -rotate-1 group-hover:rotate-0 transition-transform shadow-[2px_2px_0px_0px_black]">
                         #{idx + 1} {user}
                      </span>
                      <span className="bg-black text-lime-400 px-3 py-1 border-4 border-white text-xl transform rotate-1 group-hover:rotate-0 transition-transform shadow-[2px_2px_0px_0px_lime]">
                         {count} PCT
                      </span>
                    </div>
                    {/* Retro HP Bar */}
                    <div className="h-12 w-full border-4 border-black bg-gray-800 relative overflow-hidden shadow-[4px_4px_0px_0px_black]">
                       <div 
                         className="h-full border-r-4 border-black transition-all duration-500 ease-out"
                         style={{ 
                             width: `${percentage}%`, 
                             backgroundImage: idx === 0 
                                ? 'repeating-linear-gradient(45deg, #facc15, #facc15 20px, #000 20px, #000 40px)' 
                                : 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                         }}
                       >
                         {/* Scanline effect on bar */}
                         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/scan-lines.png')] opacity-50"></div>
                       </div>
                    </div>
                  </div>
                 );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};