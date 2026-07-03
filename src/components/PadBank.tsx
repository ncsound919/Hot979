import { motion } from 'motion/react';
import { Volume2, VolumeX, Radio, Play, Square, Newspaper, Mic } from 'lucide-react';

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
    { id: 'player', label: 'Live Stream', icon: Radio, action: () => onViewChange('player'), color: 'bg-[#E63946]', shadow: 'shadow-[0_0_8px_rgba(230,57,70,0.5)]', active: currentView === 'player' },
    { id: 'news', label: 'The Wire', icon: Newspaper, action: () => onViewChange('news'), color: 'bg-[#9D4EDD]', shadow: 'shadow-[0_0_8px_rgba(157,78,221,0.5)]', active: currentView === 'news' },
    { id: 'request', label: 'Request', icon: Mic, action: () => {}, color: 'bg-[#118AB2]', shadow: 'shadow-[0_0_8px_rgba(17,138,178,0.5)]', active: false },
    { id: 'play', label: isPlaying ? 'Stop' : 'Play', icon: isPlaying ? Square : Play, action: onPlayToggle, color: 'bg-white', shadow: 'shadow-[0_0_8px_rgba(255,255,255,0.5)]', active: isPlaying },
  ];

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between bg-[#121212] p-3 rounded-lg border border-white/5">
        <VolumeX size={16} className="text-white/40" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full mx-3 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E63946]"
        />
        <Volume2 size={16} className="text-white/40" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {pads.map((pad) => (
          <button
            key={pad.id}
            onClick={pad.action}
            className={`h-24 rounded-lg bg-[#333] border-b-4 border-[#1a1a1a] flex flex-col items-center justify-center space-y-2 hover:bg-[#3a3a3a] active:translate-y-1 active:border-b-0 transition-all ${pad.active ? 'bg-[#3a3a3a] border-b-0 translate-y-1' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full ${pad.active ? pad.color + ' ' + pad.shadow : 'bg-[#888]'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              {pad.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
