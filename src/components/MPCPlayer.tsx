import { useState, useRef, useEffect } from 'react';
import LCDScreen from './LCDScreen';
import PadBank from './PadBank';
import NewsView from './NewsView';

export default function MPCPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentView, setCurrentView] = useState<'player' | 'news'>('player');
  
  // We use a real audio element, but point it to a placeholder internet radio stream 
  // since we don't have the real Hot 97.9 Icecast stream URL.
  // Using a generic high-uptime public stream for demonstration.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamUrl = "https://ice55.securenetsystems.net/WAUG"; // This is just a placeholder, in reality this would be the DigitalOcean Icecast URL

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(streamUrl);
      audioRef.current.crossOrigin = "anonymous";
    }
    
    audioRef.current.volume = volume;
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      // To properly "stop" a live stream and not buffer endlessly in the background:
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setIsPlaying(false);
    } else {
      audioRef.current.src = streamUrl;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Audio playback failed:", err);
          // Auto-play policies might block this, in a real app we'd show an error state
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      {/* The Main Container */}
      <div className="bg-[#0A0A0A] md:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/5 relative">
        
        {/* Header (Inspired by the elegant dark design) */}
        <header className="h-24 flex items-center justify-between px-6 md:px-8 border-b-2 border-white/10 bg-[#121212] relative overflow-hidden">
          {/* Subtle graffiti/grunge texture background overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgoJPHJlY3Qgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwMCIvPgoJPHJlY3Qgd2lkdGg9IjMiIGhlaWdodD0iMyIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=')]"></div>
          
          <div className="flex items-center space-x-4 z-10">
            <div className="bg-[#E63946] px-4 py-2 text-black font-black italic text-3xl tracking-tighter hidden sm:block transform -skew-x-12 shadow-[4px_4px_0px_rgba(255,255,255,0.9)]">HOT 97.9</div>
            <div className="flex flex-col ml-2">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#E63946] uppercase">WAUG / W250AZ</span>
              <span className="text-xs sm:text-sm text-white/80 font-bold uppercase tracking-wide">The Triangle's #1 for Hip-Hop & R&B</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 z-10">
            <div className="flex items-center space-x-2 text-[#E63946]">
              <span className={`w-2 h-2 rounded-full bg-[#E63946] ${isPlaying ? 'animate-pulse' : 'opacity-50'}`}></span>
              <span className="font-mono text-[10px] sm:text-sm uppercase font-bold tracking-widest">Studio Live</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8">
          
          {/* Main Player Area */}
          <div className="flex-1 flex flex-col space-y-8">
            <div className="bg-[#181818] rounded-2xl border border-white/5 p-6 md:p-8 flex-grow shadow-2xl relative overflow-hidden flex flex-col min-h-[350px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E63946] to-transparent opacity-50"></div>
              
              <LCDScreen 
                isPlaying={isPlaying} 
                currentView={currentView}
                volume={volume}
              />
              
              {currentView === 'player' && (
                <div className="mt-8 flex justify-end relative z-10">
                   <button 
                     className="w-20 h-20 bg-[#E63946] flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(230,57,70,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer" 
                     onClick={togglePlay}
                   >
                     {isPlaying ? (
                        <svg width="40" height="40" fill="white" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                     ) : (
                        <svg width="40" height="40" fill="white" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                     )}
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar / Controls */}
          <aside className="w-full md:w-[360px] flex flex-col space-y-6">
            <div className="bg-[#222] p-6 rounded-2xl shadow-inner border border-white/5">
               <span className="text-[10px] font-bold text-[#888] tracking-widest uppercase mb-6 block">Studio Command Center</span>
               <PadBank 
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  isPlaying={isPlaying}
                  onPlayToggle={togglePlay}
                  volume={volume}
                  onVolumeChange={setVolume}
                />
            </div>
            
            <div className="flex-1 bg-[#181818] rounded-2xl border border-white/5 p-6 flex flex-col overflow-hidden min-h-[300px]">
              {currentView === 'player' && (
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-[#1a1a1a] bg-[#111] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-2 rounded-full border border-[#222]"></div>
                    <div className="absolute inset-4 rounded-full border border-[#222]"></div>
                    <div className="absolute inset-6 rounded-full border border-[#222]"></div>
                    <div className="absolute inset-8 rounded-full border border-[#222]"></div>
                    <div className="absolute inset-10 rounded-full border border-[#222]"></div>
                    <div className="absolute inset-[44px] rounded-full border border-[#222]"></div>
                    <div className="absolute inset-[52px] rounded-full border border-[#222]"></div>
                    {/* Record Label */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E63946] flex items-center justify-center border-2 border-[#333] shadow-inner relative overflow-hidden">
                       {/* Label Design */}
                       <div className="absolute inset-0 flex items-center justify-center opacity-50 font-black italic text-[8px] md:text-[10px] transform -rotate-45 text-black">HOT 97.9</div>
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white border border-gray-400"></div>
                    </div>
                  </div>
                  <p className={`font-mono text-xs font-bold uppercase tracking-widest mt-8 ${isPlaying ? 'text-[#E63946] animate-pulse' : 'text-white/30'}`}>
                    {isPlaying ? 'ON AIR / SPINNING' : 'TURNTABLE IDLE'}
                  </p>
                </div>
              )}
              {currentView === 'news' && <NewsView />}
            </div>
          </aside>

        </div>
        
        {/* Footer Marquee */}
        <footer className="h-12 bg-[#E63946] flex items-center overflow-hidden flex-shrink-0">
          <div className="flex whitespace-nowrap animate-marquee-text">
            <span className="px-8 text-black font-black uppercase text-sm italic tracking-wide">NOW GIVING AWAY TICKETS TO THE RALEIGH MUSIC FESTIVAL — TEXT 'HOT' TO 919-979-9799 TO WIN! — JOIN DJ JAY BEE LIVE AT THE LINCOLN THEATRE TONIGHT AT 9 PM —</span>
            <span className="px-8 text-black font-black uppercase text-sm italic tracking-wide">NOW GIVING AWAY TICKETS TO THE RALEIGH MUSIC FESTIVAL — TEXT 'HOT' TO 919-979-9799 TO WIN! — JOIN DJ JAY BEE LIVE AT THE LINCOLN THEATRE TONIGHT AT 9 PM —</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
