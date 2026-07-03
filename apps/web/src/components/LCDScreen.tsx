import { motion, AnimatePresence } from 'motion/react';

interface LCDScreenProps {
  isPlaying: boolean;
  currentView: 'player' | 'news';
  volume: number;
}

export default function LCDScreen({ isPlaying, currentView, volume }: LCDScreenProps) {
  return (
    <div className="flex flex-col space-y-4 h-full text-white relative">
      {/* Subtle scanline / glass overlay for LCD feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        }}
      />

      <div className="flex justify-between items-center relative z-10">
        <motion.span
          key={isPlaying ? 'spinning' : 'ready'}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-[#FFD166] font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] drop-shadow-[0_0_6px_rgba(255,209,102,0.5)]"
        >
          {isPlaying ? 'Now Spinning' : 'Ready'}
        </motion.span>

        <div className="flex gap-4 text-xs font-mono font-bold text-white/50">
          <motion.span
            key={isPlaying ? 'playing' : 'stopped'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={isPlaying ? 'text-[#06D6A0] drop-shadow-[0_0_6px_rgba(6,214,160,0.5)]' : 'opacity-30'}
          >
            {isPlaying ? '▶ PLAYING' : '■ STOPPED'}
          </motion.span>
          <span className="hidden sm:inline tabular-nums">VOL: {Math.round(volume * 100)}%</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center py-4 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'player' && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-left flex flex-col items-start w-full"
            >
              <div className="whitespace-nowrap w-full relative overflow-hidden">
                <motion.div
                  animate={{ x: [0, -600, 0] }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                  className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none text-white inline-block drop-shadow-[0_0_18px_rgba(230,57,70,0.25)]"
                >
                  HOT 97.9 - THE TRIANGLE'S #1 FOR HIP HOP
                </motion.div>
              </div>

              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 96 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mt-8 flex items-end space-x-1 w-full overflow-hidden"
                  >
                    {[...Array(16)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 sm:w-3 rounded-t ${
                          i % 4 === 0 ? 'bg-[#FFD166]' : i % 3 === 0 ? 'bg-white/20' : 'bg-[#E63946]'
                        } shadow-[0_0_8px_rgba(255,255,255,0.15)]`}
                        animate={{ height: ['20%', `${Math.random() * 80 + 20}%`, '20%'] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.5 + Math.random() * 0.5,
                          ease: 'easeInOut',
                          type: 'tween',
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentView === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-left flex flex-col justify-center h-full"
            >
              <h2 className="text-3xl md:text-5xl font-black mb-2 text-[#9D4EDD] drop-shadow-[0_0_16px_rgba(157,78,221,0.4)]">
                THE WIRE
              </h2>
              <p className="text-sm text-white/50 font-mono uppercase tracking-wide">Hip hop &amp; culture news...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="mt-auto flex items-center space-x-2 sm:space-x-4 relative z-10">
        <div className="px-2 py-1 border border-white/15 rounded-md text-[10px] font-mono text-white/60 hidden sm:block bg-white/[0.02]">
          128KBPS AAC
        </div>
        <div className="px-2 py-1 border border-white/15 rounded-md text-[10px] font-mono text-white/60 bg-white/[0.02]">
          DIGITALOCEAN
        </div>
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="px-2 py-1 border border-[#06D6A0] text-[#06D6A0] rounded-md text-[10px] font-mono bg-[#06D6A0]/10 shadow-[0_0_10px_rgba(6,214,160,0.25)]"
        >
          STABLE
        </motion.div>
      </div>
    </div>
  );
}
