import React, { useState, useRef, useEffect } from 'react';
import { BrutalButton } from './BrutalButton';
import { askAI, prompts } from '../services/ai';
import { storage } from '../services/storage';
import { Complaint as ComplaintType } from '../types';

export const Complaint: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [btnStyle, setBtnStyle] = useState<React.CSSProperties>({});
  const [trollCount, setTrollCount] = useState(0);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintType[]>([]);
  const [showComplaints, setShowComplaints] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = storage.subscribeToComplaints((c) => {
      console.log("📋 Complaints updated, count:", c.length);
      setComplaints(c);
    });
    return () => unsubscribe();
  }, []);

  const moveButton = () => {
    if (trollCount > 5) return; 

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxX = containerRect.width - 200; 
      const maxY = containerRect.height - 100;

      const randomX = Math.floor(Math.random() * maxX);
      const randomY = Math.floor(Math.random() * maxY);

      setBtnStyle({
        position: 'absolute',
        left: `${randomX}px`,
        top: `${randomY}px`,
        transition: 'all 0.1s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        transform: `rotate(${Math.random() * 20 - 10}deg)`
      });
      setTrollCount(c => c + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;

    setLoading(true);
    setBtnStyle({});
    setTrollCount(0);

    // AI MANAGER RESPONDS
    const reply = await askAI(prompts.roastComplaint(feedback));
    
    // Save complaint (ANONYMOUS - no user name!)
    const complaint: ComplaintType = {
      id: Date.now().toString(),
      text: feedback,
      aiReply: reply || '',
      timestamp: Date.now()
    };
    
    console.log("📝 Saving complaint (anonymous):", complaint);
    try {
      await storage.addComplaint(complaint);
      console.log("✅ Complaint saved successfully");
    } catch (error) {
      console.error("❌ Error saving complaint:", error);
    }
    
    setAiReply(reply);
    setLoading(false);
    setFeedback('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[300px] flex flex-col px-2 sm:px-4" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
      <div className="bg-rose-600 border-4 border-black p-4 shadow-[8px_8px_0px_0px_#fff] flex-1 flex flex-col relative rainbow-border" ref={containerRef}>
        
        {/* FIX CONTRAST: Better contrast with white background */}
        <div className="bg-white text-black border-4 border-black inline-block p-4 transform -skew-x-6 mb-4 shadow-[4px_4px_0px_0px_#000] hover:skew-x-0 transition-transform z-10 relative">
            <h2 className="text-3xl font-black uppercase leading-none">
            RECLAMAȚII?<br/>
            <span className="text-red-600 text-xl mt-1 block bg-yellow-300 px-2 -rotate-2 w-max border-2 border-black">N-AI TREABĂ FRA 🚫</span>
            </h2>
        </div>

        {aiReply && (
            <div className="mb-6 p-4 bg-yellow-300 border-4 border-black rotate-1 animate-bounce">
                <p className="text-xl font-mono text-black font-black mt-2 bg-white p-3 border-2 border-black">{aiReply}</p>
                <BrutalButton onClick={() => setAiReply(null)} className="mt-4 text-sm py-2 bg-black text-white border-2 border-white">AM ÎNȚELES, SUNT PROST</BrutalButton>
            </div>
        )}
        
        {!aiReply && (
            <>
            <p className="font-bold mb-4 text-lg text-black bg-yellow-300 inline-block p-3 border-3 border-black rotate-1 shadow-[3px_3px_0px_0px_black]">
              E frig? E cald? <span className="underline decoration-wavy decoration-red-600 font-black">Low key</span>, nu ne interesează. Skibidi! 🚽
            </p>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="mb-8 relative">
                <label className="block font-black mb-2 uppercase text-black bg-yellow-300 w-max px-4 py-1 border-3 border-black text-xl transform -rotate-2 absolute -top-5 left-0 z-10 shadow-[2px_2px_0px_0px_black]">
                  Zi-i lu' tati ce te doare
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full h-24 p-3 border-3 border-black font-mono text-base bg-white text-black focus:bg-lime-200 focus:ring-3 ring-black outline-none shadow-[4px_4px_0px_0px_black] mt-2 placeholder-gray-500 font-bold"
                  placeholder="Scrie romanul aici, coach... (6 7, skibidi, tralalelo, etc.)"
                />
              </div>

              <div className="relative h-24 mt-auto">
                 {loading ? (
                     <div className="text-black bg-yellow-300 font-black text-xl p-3 border-3 border-black animate-pulse shadow-[3px_3px_0px_0px_black]">SE ANALIZEAZĂ CEREREA TA (NOT)...</div>
                 ) : (
                     <div 
                       onMouseEnter={moveButton}
                       style={btnStyle}
                       className="inline-block"
                     >
                        <BrutalButton type="submit" className="bg-white text-black hover:bg-black hover:text-white border-black text-xl py-4 px-8 shadow-[8px_8px_0px_0px_black]">
                          {trollCount > 5 ? 'HAI BINE, M-AI PRINS...' : 'TRIMITE LA MANAGER'}
                        </BrutalButton>
                     </div>
                 )}
              </div>
            </form>
            </>
        )}
        
        {trollCount > 0 && trollCount <= 5 && (
           <div className="absolute top-4 right-4 text-lg font-black bg-lime-400 text-black p-3 border-4 border-black rotate-12 shadow-[4px_4px_0px_0px_black] animate-bounce z-50">
             PRINDE-MĂ DACA POȚI! 🏃‍♂️
           </div>
        )}

        {/* Button to show/hide complaints */}
        <div className="mt-4">
          <BrutalButton 
            onClick={() => setShowComplaints(!showComplaints)}
            className="bg-black text-white hover:bg-white hover:text-black border-white hover:border-black text-sm py-2 px-4 shadow-[4px_4px_0px_0px_black]"
          >
            {showComplaints ? '❌ ASCUNDE RECLAMAȚIILE' : `📋 ARATĂ TOATE RECLAMAȚIILE (${complaints.length})`}
          </BrutalButton>
        </div>

        {/* Complaints List */}
        {showComplaints && (
          <div className="mt-6 max-h-96 overflow-y-auto space-y-4">
            {complaints.length === 0 ? (
              <div className="text-center p-6 border-4 border-dashed border-black bg-yellow-300 text-black font-black text-lg">
                NIMIC AICI, COACH! NIMENI NU SE PLÂNGE. 😴
              </div>
            ) : (
              complaints.map((complaint, idx) => (
                <div 
                  key={complaint.id}
                  className={`p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_black] ${
                    idx % 2 === 0 ? 'rotate-1' : '-rotate-1'
                  }`}
                >
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-600 mb-2">
                      #{complaints.length - idx} • {new Date(complaint.timestamp).toLocaleString('ro-RO')}
                    </p>
                    <p className="text-base font-bold text-black bg-yellow-300 p-2 border-2 border-black">
                      "{complaint.text}"
                    </p>
                  </div>
                  {complaint.aiReply && (
                    <div className="mt-3 pt-3 border-t-2 border-black">
                      <p className="text-xs font-bold text-gray-600 mb-1">📢 RĂSPUNS MANAGER:</p>
                      <p className="text-sm font-mono text-black bg-lime-200 p-2 border-2 border-black">
                        {complaint.aiReply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};