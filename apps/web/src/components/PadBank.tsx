import { motion } from 'motion/react';
import { Volume2, VolumeX, Volume1, Radio, Play, Square, Newspaper, Mic } from 'lucide-react';

interface PadBankProps {
  currentView: 'player' | 'news';
  onViewChange: (view: 'player' | 'news') => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export default function PadBank({ currentView, onViewChange, isPlaying, onPlayToggle, volume, onVolumeChange }: PadBankProps) {
  const pads = [
    {
      id: 'player',
      label: 'Live Stream',
      icon: Radio,
      action: () => onViewChange('player'),
      color: 'bg-[#E63946]',
      textColor: 'text-[#E63946]',
      shadow: 'shadow-[0_0_12px_rgba(230,57,70,0.6)]',
      active: currentView === 'player',
    },
    {
      id: 'news',
      label: 'The Wire',
      icon: Newspaper,
      action: () => onViewChange('news'),
      color: 'bg-[#9D4EDD]',
      textColor: 'text-[#9D4EDD]',
      shadow: 'shadow-[0_0_12px_rgba(157,78,221,0.6)]',
      active: currentView === 'news',
    },
    {
      id: 'request',
      label: 'Request',
      icon: Mic,
      action: () => {},
      color: 'bg-[#118AB2]',
      textColor: 'text-[#118AB2]',
      shadow: 'shadow-[0_0_12px_rgba(17,138,178,0.6)]',
      active: false,
    },
    {
      id: 'play',
      label: isPlaying ? 'Stop' : 'Play',
      icon: isPlaying ? Square : Play,
      action: onPlayToggle,
      color: 'bg-white',
      textColor: 'text-white',
      shadow: 'shadow-[0_0_12px_rgba(255,255,255,0.6)]',
      active: isPlaying,
    },
  ];

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between bg-[#121212] p-3 rounded-lg border border-white/5">
        <motion.div
          key={volume === 0 ? 'muted' : 'unmuted'}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <VolumeIcon size={16} className="text-white/40" />
        </motion.div>

        <div className="relative w-full mx-3 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E63946] relative z-10"
          />
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#E63946] rounded-lg pointer-events-none"
            style={{ width: `${volume * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <Volume2 size={16} className="text-white/40" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {pads.map((pad, index) => {
          const Icon = pad.icon;
          return (
            <motion.button
              key={pad.id}
              onClick={pad.action}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.96, y: 2 }}
              className={`relative h-24 rounded-lg bg-[#333] border-b-4 border-[#1a1a1a] flex flex-col items-center justify-center space-y-2 transition-colors overflow-hidden ${
                pad.active ? 'bg-[#3a3a3a] border-b-0' : ''
              }`}
              style={pad.active ? { transform: 'translateY(2px)' } : undefined}
            >
              {pad.active && (
                <motion.div
                  layoutId={`glow-${pad.id}`}
                  className={`absolute inset-0 opacity-10 ${pad.color}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                />
              )}

              <motion.div
                animate={pad.active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ repeat: pad.active ? Infinity : 0, duration: 1.8, ease: 'easeInOut' }}
                className={`relative z-10 ${pad.active ? pad.textColor : 'text-white/50'}`}
              >
                <Icon size={20} className={pad.active ? `drop-shadow-[0_0_6px_currentColor]` : ''} />
              </motion.div>

              <span
                className={`relative z-10 text-[10px] font-bold uppercase tracking-wider ${
                  pad.active ? 'text-white' : 'text-white/70'
                }`}
              >
                {pad.label}
              </span>

              <motion.div
                className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${pad.active ? pad.color + ' ' + pad.shadow : 'bg-[#666]'}`}
                animate={pad.active ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                transition={{ repeat: pad.active ? Infinity : 0, duration: 1.5, ease: 'easeInOut' }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
