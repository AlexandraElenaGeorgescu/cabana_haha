import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { storage } from '../services/storage';
import { BrutalButton } from './BrutalButton';

interface Props {
  currentUser: string;
}

export const Wall: React.FC<Props> = ({ currentUser }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    console.log("🔔 Wall: Setting up subscriptions");
    const unsubQuotes = storage.subscribeToQuotes((q) => {
      console.log("📋 Wall: Quotes updated, count:", q.length);
      setQuotes(q);
    });
    const unsubUsers = storage.subscribeToUsers((u) => {
      console.log("👥 Wall: Users updated, count:", u.length);
      setUsers(u);
    });
    return () => {
        console.log("🔕 Wall: Cleaning up subscriptions");
        unsubQuotes();
        unsubUsers();
    };
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote || !author) {
      console.warn("⚠️ Cannot post: missing quote or author");
      alert("⚠️ Completează toate câmpurile, fra! (Skibidi edition)");
      return;
    }

    setIsPosting(true);
    const q: Quote = {
      id: Date.now().toString(),
      text: newQuote,
      author: author,
      addedBy: currentUser,
      timestamp: Date.now()
    };

    console.log("📝 Adding quote:", q);
    try {
      await storage.addQuote(q);
      console.log("✅ Quote added successfully");
      setNewQuote('');
      setAuthor('');
      // Force update by re-reading from storage
      setTimeout(() => {
        const updatedQuotes = storage.subscribeToQuotes((q) => setQuotes(q));
        // The subscription will update automatically, but we trigger it manually too
      }, 100);
    } catch (error) {
      console.error("❌ Error adding quote:", error);
      alert("❌ Eroare la salvare! Verifică consola pentru detalii. (6 7 vine garda să investigheze)");
    } finally {
      setIsPosting(false);
    }
  };

  // Generate random rotation for sticker effect
  const getRandomRotation = (index: number) => {
    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-3', 'rotate-6', '-rotate-6'];
    return rotations[index % rotations.length];
  };

  const getRandomColor = (index: number) => {
    const colors = ['bg-yellow-300', 'bg-lime-300', 'bg-pink-300', 'bg-cyan-300', 'bg-orange-400'];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
      {/* Input Section */}
      <div className="mb-12 bg-cyan-400 border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_0px_#ff00ff] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply"></div>

        <h2 className="text-4xl md:text-5xl font-black uppercase mb-8 text-white bg-black inline-block px-4 py-2 border-4 border-white -rotate-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
          6 7 VINE GARDA 🚓 (Skibidi Edition)
        </h2>
        
        <div className="mb-8">
            <p className="font-black bg-white border-4 border-black inline-block p-2 text-lg transform rotate-1 shadow-[4px_4px_0px_0px_black]">
                Toarnă tot, <span className="text-red-600">n-ai treabă fra</span>. Tralalelo tralala! 🎵
            </p>
        </div>

        <form onSubmit={handlePost} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2 relative group">
                 <label className="font-black bg-black text-white border-2 border-white w-max px-3 py-1 text-sm uppercase transform -rotate-1 absolute -top-3 left-2 z-10 group-focus-within:bg-pink-500 transition-colors">
                     Cine a comis-o?
                 </label>
                 <select 
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="p-4 border-4 border-black font-bold text-xl bg-white text-black focus:bg-yellow-200 outline-none shadow-[6px_6px_0px_0px_black] focus:shadow-[2px_2px_0px_0px_black] focus:translate-x-1 focus:translate-y-1 transition-all appearance-none rounded-none"
                 >
                    <option value="">-- Alege făptașul --</option>
                    {users.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                 </select>
             </div>
             <div className="flex flex-col gap-2 relative">
                 <label className="font-black bg-white text-black border-2 border-black w-max px-3 py-1 text-sm uppercase transform rotate-1 absolute -top-3 left-2 z-10">
                     Sifonarul (Tu)
                 </label>
                 <div className="p-4 border-4 border-black bg-black text-lime-400 font-black text-xl flex items-center shadow-[6px_6px_0px_0px_white]">
                    👮‍♂️ {currentUser}
                 </div>
             </div>
          </div>
          <div className="flex flex-col gap-2 relative group">
            <label className="font-black bg-red-600 text-white border-2 border-black w-max px-3 py-1 text-sm uppercase transform -rotate-1 absolute -top-3 left-2 z-10 group-focus-within:scale-110 transition-transform">
                Dovada (Quote)
            </label>
            <textarea
                value={newQuote}
                onChange={e => setNewQuote(e.target.value)}
                placeholder="Yakka na, ce a scos pe gură? Zi-le pe alea grele... (Skibidi, 6 7, tralalelo, etc.)"
                className="p-4 border-4 border-black font-bold h-32 text-xl bg-white text-black focus:bg-pink-100 placeholder-gray-500 outline-none resize-none shadow-[6px_6px_0px_0px_black] focus:shadow-[2px_2px_0px_0px_black] focus:translate-x-1 focus:translate-y-1 transition-all"
            />
          </div>
          <BrutalButton 
            type="submit" 
            disabled={isPosting}
            className="bg-black text-white hover:bg-white hover:text-black border-white hover:border-black text-xl py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
              {isPosting ? "LIPEȘTE... 🚽" : "LIPEȘTE PE PERETE 🧱"}
          </BrutalButton>
        </form>
      </div>

      {/* Wall Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20">
        {quotes.map((q, idx) => (
          <div 
            key={q.id} 
            className={`
              break-inside-avoid 
              p-6 border-4 border-black 
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
              ${getRandomRotation(idx)}
              ${getRandomColor(idx)}
              transition-transform hover:scale-110 hover:z-50 relative group
            `}
          >
            {/* Pin/Tape Effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/40 border-l-2 border-r-2 border-white/60 transform -rotate-2"></div>
            
            <p className="text-2xl font-black mb-6 font-mono leading-tight text-black uppercase break-words">
              "{q.text}"
            </p>
            <div className="text-right border-t-4 border-black pt-3">
              <p className="font-black uppercase text-xl text-white bg-black inline-block px-2 py-1 border-2 border-white transform -rotate-2 group-hover:rotate-0 transition-transform">
                  - {q.author}
              </p>
              <div className="mt-3 flex justify-end">
                  <span className="text-xs text-black font-bold bg-white px-2 py-1 border border-black shadow-[2px_2px_0px_0px_black]">Turnat de {q.addedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {quotes.length === 0 && (
        <div className="text-center p-12 border-8 border-dashed border-white bg-black text-lime-400 font-black text-3xl -rotate-1 animate-pulse shadow-[0px_0px_20px_#39ff14]">
          NIMENI? NIMIC? SLAB, COACHUL MEU. 😴
        </div>
      )}
    </div>
  );
};