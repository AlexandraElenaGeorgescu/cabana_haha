import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Voting } from './components/Voting';
import { Wall } from './components/Wall';
import { Complaint } from './components/Complaint';
import { Roata } from './components/Roata';
import { storage } from './services/storage';

type View = 'VOTE' | 'WALL' | 'ROATA' | 'COMPLAINT';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('VOTE');

  useEffect(() => {
    const savedUser = storage.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (name: string) => {
    storage.login(name);
    setUser(name);
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 pb-32 sm:pb-4 relative overflow-x-hidden" style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* Header / Nav */}
      <header className="mb-8 sm:mb-12 w-full flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 bg-purple-600 border-8 border-black p-4 sm:p-6 shadow-[12px_12px_0px_0px_#39ff14] transform rotate-1 relative z-20 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-2 bg-white p-3 border-4 border-black -rotate-2 hover:rotate-2 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
           <div className="text-4xl animate-bounce">🤙</div>
           <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black leading-none">
             Cabana <span className="text-white bg-black px-2 border-2 border-transparent hover:border-lime-400 block md:inline-block animate-glitch">Chaos</span> <span className="text-xs">(Skibidi Edition 🚽)</span>
           </h1>
        </div>
        
        <div className="flex items-center gap-4 font-bold text-sm md:text-base">
          <div className="bg-cyan-300 text-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_black] font-black uppercase transform -skew-x-12 hover:skew-x-0 transition-transform hover:bg-cyan-200">
             👤 {user}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-black hover:text-red-500 px-4 py-2 font-black border-4 border-black shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase"
          >
            Ieși acas'
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mb-24 md:mb-0 relative z-10">
        {currentView === 'VOTE' && <Voting currentUser={user} />}
        {currentView === 'WALL' && <Wall currentUser={user} />}
        {currentView === 'ROATA' && <Roata />}
        {currentView === 'COMPLAINT' && <Complaint />}
      </main>

      {/* Mobile-First Sticky Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black p-4 border-t-8 border-lime-400 flex justify-around z-50 md:static md:bg-transparent md:border-none md:justify-center md:gap-4 md:mt-16 md:p-0 overflow-x-auto">
        <NavButton 
          active={currentView === 'VOTE'} 
          onClick={() => setCurrentView('VOTE')}
          icon="🏆"
          label="Gala"
          color="bg-lime-400"
        />
        <NavButton 
          active={currentView === 'WALL'} 
          onClick={() => setCurrentView('WALL')}
          icon="🧱"
          label="Perete"
          color="bg-cyan-400"
        />
        <NavButton 
          active={currentView === 'ROATA'} 
          onClick={() => setCurrentView('ROATA')}
          icon="🎰"
          label="Păcănele"
          color="bg-yellow-400"
        />
        <NavButton 
          active={currentView === 'COMPLAINT'} 
          onClick={() => setCurrentView('COMPLAINT')}
          icon="🤬"
          label="Reclamații"
          color="bg-rose-500"
          textColor="text-white"
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string; color?: string; textColor?: string }> = ({ active, onClick, icon, label, color = 'bg-white', textColor = 'text-black' }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-2 p-3 min-w-[80px]
      font-black uppercase text-xs md:text-sm tracking-widest
      border-4 border-black transition-all
      ${active 
        ? `${color} ${textColor} -translate-y-6 md:-translate-y-3 shadow-[6px_6px_0px_0px_white] scale-110 z-10 rotate-1 ring-2 ring-white` 
        : 'bg-white text-black translate-y-0 md:hover:-translate-y-2 md:hover:rotate-2 md:shadow-[6px_6px_0px_0px_black] opacity-90'}
    `}
  >
    <span className="text-2xl md:text-3xl filter drop-shadow-md">{icon}</span>
    <span className={`px-1 leading-none py-0.5 md:bg-transparent ${active ? 'bg-black/20 rounded' : ''} md:text-inherit`}>{label}</span>
  </button>
);

export default App;