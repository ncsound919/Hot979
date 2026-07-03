import { motion } from 'motion/react';

interface LCDScreenProps {
  isPlaying: boolean;
  currentView: 'player' | 'news';
  volume: number;
}

export default function LCDScreen({ isPlaying, currentView, volume }: LCDScreenProps) {
  return (
    <div className="flex flex-col space-y-4 h-full text-white">
      <div className="flex justify-between items-center">
        <span className="text-[#FFD166] font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em]">{isPlaying ? 'Now Spinning' : 'Ready'}</span>
        <div className="flex gap-4 text-xs font-mono font-bold text-white/50">
          <span className={isPlaying ? 'text-[#06D6A0]' : 'opacity-30'}>
            {isPlaying ? '▶ PLAYING' : '■ STOPPED'}
          </span>
          <span className="hidden sm:inline">VOL: {Math.round(volume * 100)}%</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center py-4">
        {currentView === 'player' && (
          <div className="text-left flex flex-col items-start w-full overflow-hidden">
            <div className="whitespace-nowrap w-full relative">
              <motion.div
                animate={{ x: [0, -600, 0] }}
                transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none text-white inline-block"
              >
                {isPlaying ? 'HOT 97.9 - THE TRIANGLE\'S #1 FOR HIP HOP' : 'HOT 97.9 - THE TRIANGLE\'S #1 FOR HIP HOP'}
              </motion.div>
            </div>
            {isPlaying && (
              <div className="mt-8 flex items-end space-x-1 h-24">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 sm:w-3 rounded-t ${i % 4 === 0 ? 'bg-[#FFD166]' : i % 3 === 0 ? 'bg-white/20' : 'bg-[#E63946]'}`}
                    animate={{
                      height: ['20%', `${Math.random() * 80 + 20}%`, '20%']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.3 + Math.random() * 0.4,
                      ease: 'linear'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentView === 'news' && (
          <div className="text-left flex flex-col justify-center h-full">
            <h2 className="text-3xl md:text-5xl font-black mb-2 text-[#9D4EDD]">THE WIRE</h2>
            <p className="text-sm text-white/50 font-mono uppercase">HIP HOP & CULTURE NEWS...</p>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="mt-auto flex items-center space-x-2 sm:space-x-4">
        <div className="px-2 py-1 border border-white/20 rounded text-[10px] font-mono text-white/60 hidden sm:block">128KBPS AAC</div>
        <div className="px-2 py-1 border border-white/20 rounded text-[10px] font-mono text-white/60">DIGITALOCEAN</div>
        <div className="px-2 py-1 border border-[#06D6A0] text-[#06D6A0] rounded text-[10px] font-mono bg-[#06D6A0]/10">STABLE</div>
      </div>
    </div>
  );
}
