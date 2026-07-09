import { motion, AnimatePresence } from 'motion/react';
import { STATION } from '@shared/content/station';

interface LCDScreenProps {
  isPlaying: boolean;
  currentView: 'player' | 'news';
  volume: number;
  status?: string;
}

export default function LCDScreen({ isPlaying, currentView, volume, status }: LCDScreenProps) {
  // Derive a human-readable marquee label from STATION config
  const marqueeLabel = `${STATION.name} - ${STATION.tagline.toUpperCase()}`;

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
            {isPlaying ? '\u25B6 PLAYING' : '\u25A0 STOPPED'}
          </motion.span>
          <span className="hidden sm:inline tabular-nums">VOL: {Math.round(volume * 100)}%</span>
        </div>
      </div>

      {currentView === 'player' && (
        <AnimatePresence>
          <motion.div
            key="player-display"
            className="flex-1 flex flex-col items-center justify-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Station name + tagline pulled from STATION config */}
            <div className="text-center">
              <p className="font-mono text-xs tracking-[0.4em] text-white/40 uppercase">
                {STATION.callsign}
              </p>
              <p className="font-mono font-bold text-sm sm:text-base tracking-widest text-white uppercase">
                {STATION.name}
              </p>
              <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-white/50 uppercase mt-1">
                {STATION.tagline.toUpperCase()}
              </p>
            </div>

            {isPlaying && (
              <div className="flex gap-[3px] items-end h-6">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[#06D6A0] rounded-full"
                    animate={{ height: ['4px', `${8 + Math.random() * 16}px`, '4px'] }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {currentView === 'news' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2">
          <p className="font-mono text-xs tracking-[0.4em] text-white/40 uppercase">THE WIRE</p>
          <p className="font-mono font-bold text-sm tracking-widest text-white uppercase">HIP HOP NEWS</p>
          <p className="font-mono text-[10px] text-white/40">Hip hop &amp; culture news...</p>
        </div>
      )}

      {/* Status Bar — badges are conditional on actual stream state */}
      <div className="flex justify-between items-center text-[9px] font-mono text-white/30 border-t border-white/10 pt-2">
        <span>128KBPS AAC</span>
        <span>{isPlaying ? 'STREAMING' : 'STANDBY'}</span>
        <motion.span
          className={isPlaying
            ? 'text-[#06D6A0] drop-shadow-[0_0_4px_rgba(6,214,160,0.6)]'
            : 'text-white/20'}
        >
          {isPlaying ? 'LIVE' : 'OFFLINE'}
        </motion.span>
      </div>
    </div>
  );
}
