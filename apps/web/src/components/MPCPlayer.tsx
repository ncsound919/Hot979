import { useState, useRef, useEffect, useCallback } from 'react';
import LCDScreen from './LCDScreen';
import PadBank from './PadBank';
import NewsView from './NewsView';
import { STATION } from '@shared/content/station';

type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'error' | 'reconnecting';

const STALL_TIMEOUT_MS = 8000;
const MAX_RECONNECT_ATTEMPTS = 5;

export default function MPCPlayer() {
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [volume, setVolume] = useState(0.8);
  const [currentView, setCurrentView] = useState<'player' | 'news'>('player');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeUpdateRef = useRef<number>(Date.now());
  const stallCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const streamUrl = STATION.streamUrl;
  const isPlaying = status === 'playing';

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  const setupMediaSession = useCallback(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: STATION.tagline || 'Live Stream',
      artist: STATION.name,
      album: STATION.callsign,
      artwork: [
        { src: STATION.logoUrl || '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: STATION.logoUrl || '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    });
    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('stop', () => stopStream());
  }, []);

  const updatePlaybackState = (state: 'playing' | 'paused' | 'none') => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state;
  };

  const startStallWatch = useCallback(() => {
    stopStallWatch();
    lastTimeUpdateRef.current = Date.now();
    stallCheckRef.current = setInterval(() => {
      const elapsed = Date.now() - lastTimeUpdateRef.current;
      if (elapsed > STALL_TIMEOUT_MS && status === 'playing') reconnect();
    }, 3000);
  }, [status]);

  const stopStallWatch = () => {
    if (stallCheckRef.current) {
      clearInterval(stallCheckRef.current);
      stallCheckRef.current = null;
    }
  };

  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setStatus('error');
      setErrorMessage('Lost connection to the stream. Tap play to retry.');
      stopStallWatch();
      return;
    }
    reconnectAttemptsRef.current += 1;
    setStatus('reconnecting');
    hardResetAudio();
    startStream();
  }, []);

  const hardResetAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.removeAttribute('src');
    audioRef.current.load();
  };

  const startStream = useCallback(() => {
    if (!audioRef.current) return;
    setStatus('loading');
    setErrorMessage(null);
    audioRef.current.src = `${streamUrl}?_=${Date.now()}`;
    audioRef.current
      .play()
      .then(() => {
        setStatus('playing');
        reconnectAttemptsRef.current = 0;
        updatePlaybackState('playing');
        startStallWatch();
        requestWakeLock();
      })
      .catch((err) => {
        console.error('Audio playback failed:', err);
        setStatus('error');
        setErrorMessage('Playback blocked or failed. Tap play to try again.');
        updatePlaybackState('none');
      });
  }, [streamUrl, startStallWatch, requestWakeLock]);

  const stopStream = useCallback(() => {
    hardResetAudio();
    stopStallWatch();
    releaseWakeLock();
    reconnectAttemptsRef.current = 0;
    setStatus('idle');
    setErrorMessage(null);
    updatePlaybackState('none');
  }, [releaseWakeLock]);

  const togglePlay = useCallback(() => {
    if (status === 'playing' || status === 'reconnecting' || status === 'loading') {
      stopStream();
    } else {
      startStream();
    }
  }, [status, startStream, stopStream]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.preload = 'none';
      audioRef.current.addEventListener('timeupdate', () => {
        lastTimeUpdateRef.current = Date.now();
      });
      audioRef.current.addEventListener('error', () => {
        if (status === 'playing' || status === 'loading') reconnect();
      });
      audioRef.current.addEventListener('stalled', () => {
        if (status === 'playing') reconnect();
      });
    }
    audioRef.current.volume = volume;
    setupMediaSession();

    const handleOnline = () => {
      if (status === 'error' || status === 'reconnecting') reconnect();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      stopStallWatch();
      releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && status === 'playing') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, requestWakeLock]);

  const marqueeText = STATION.promoMessage;

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      <div
        className="p-[2px] md:rounded-[20px] relative"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 30%, rgba(0,0,0,0.4) 70%, rgba(255,255,255,0.08))',
        }}
      >
        <div className="bg-[#0A0A0A] md:rounded-[18px] flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-black/40 relative">
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/15 z-20 pointer-events-none rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/15 z-20 pointer-events-none rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/10 z-20 pointer-events-none rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/10 z-20 pointer-events-none rounded-br-sm" />

          <header
            className="h-24 flex items-center justify-between px-6 md:px-8 border-b-2 border-black/60 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, #1a1a1a 0%, #121212 45%, #0d0d0d 100%), repeating-linear-gradient(100deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgoJPHJlY3Qgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwMCIvPgoJPHJlY3Qgd2lkdGg9IjMiIGhlaWdodD0iMyIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=')]"></div>

            <div className="flex items-center space-x-4 z-10">
              <div
                className="bg-[#E63946] px-4 py-2 text-black font-black italic text-3xl tracking-tighter hidden sm:block transform -skew-x-12 relative"
                style={{
                  boxShadow: '4px 4px 0px rgba(255,255,255,0.9), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.25)',
                }}
              >
                {STATION.name}
              </div>
              <div className="flex flex-col ml-2">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#E63946] uppercase drop-shadow-[0_0_4px_rgba(230,57,70,0.4)]">
                  {STATION.callsign}
                </span>
                <span className="text-xs sm:text-sm text-white/80 font-bold uppercase tracking-wide">{STATION.tagline}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 z-10">
              <div
                className="flex items-center space-x-2 text-[#E63946] px-3 py-1.5 rounded-full border border-white/5"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
              >
                <span
                  className={`w-2 h-2 rounded-full bg-[#E63946] ${
                    isPlaying ? 'animate-pulse shadow-[0_0_8px_rgba(230,57,70,0.8)]' : status === 'reconnecting' ? 'animate-ping' : 'opacity-50'
                  }`}
                ></span>
                <span className="font-mono text-[10px] sm:text-sm uppercase font-bold tracking-widest">
                  {status === 'reconnecting' ? 'Reconnecting…' : status === 'loading' ? 'Connecting…' : 'Studio Live'}
                </span>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 relative">
            <div className="flex-1 flex flex-col space-y-8">
              <div
                className="rounded-2xl border border-black/60 p-6 md:p-8 flex-grow relative overflow-hidden flex flex-col min-h-[350px]"
                style={{
                  background: 'linear-gradient(160deg, #1c1c1c 0%, #161616 50%, #101010 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.03), 0 10px 30px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E63946] to-transparent opacity-60" />
                <div className="absolute inset-4 rounded-xl pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' }} />

                <LCDScreen isPlaying={isPlaying} currentView={currentView} volume={volume} />

                {errorMessage && (
                  <div className="mt-4 px-4 py-2 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-xs font-mono relative z-10">
                    {errorMessage}
                  </div>
                )}

                {currentView === 'player' && (
                  <div className="mt-8 flex justify-end relative z-10">
                    <button
                      className="w-20 h-20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-60 relative"
                      style={{
                        background: 'radial-gradient(circle at 35% 30%, #ff5c68, #E63946 55%, #b8202c 100%)',
                        boxShadow:
                          '0 0 30px rgba(230,57,70,0.4), inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.35), 0 6px 10px rgba(0,0,0,0.5)',
                      }}
                      onClick={togglePlay}
                      disabled={status === 'loading'}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      <div className="absolute top-2 left-3 w-8 h-3 rounded-full bg-white/25 blur-[3px]" />
                      {status === 'loading' || status === 'reconnecting' ? (
                        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      ) : isPlaying ? (
                        <svg width="40" height="40" fill="white" viewBox="0 0 24 24" className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                          <rect x="6" y="4" width="4" height="16"></rect>
                          <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                      ) : (
                        <svg width="40" height="40" fill="white" viewBox="0 0 24 24" className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside className="w-full md:w-[360px] flex flex-col space-y-6">
              <div
                className="p-6 rounded-2xl border border-black/60 relative"
                style={{
                  background: 'linear-gradient(160deg, #262626 0%, #1e1e1e 60%, #181818 100%)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <span className="text-[10px] font-bold text-[#999] tracking-widest uppercase mb-6 block drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                  Studio Command Center
                </span>
                <PadBank
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  isPlaying={isPlaying}
                  onPlayToggle={togglePlay}
                  volume={volume}
                  onVolumeChange={setVolume}
                />
              </div>

              <div
                className="flex-1 rounded-2xl border border-black/60 p-6 flex flex-col overflow-hidden min-h-[300px] relative"
                style={{
                  background: 'linear-gradient(160deg, #1c1c1c 0%, #161616 50%, #101010 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
                }}
              >
                {currentView === 'player' && (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <div
                      className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-[#1a1a1a] bg-[#111] flex items-center justify-center relative ${
                        isPlaying ? 'animate-spin-slow' : ''
                      }`}
                      style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.04)' }}
                    >
                      <div className="absolute inset-2 rounded-full border border-[#222]"></div>
                      <div className="absolute inset-4 rounded-full border border-[#222]"></div>
                      <div className="absolute inset-6 rounded-full border border-[#222]"></div>
                      <div className="absolute inset-8 rounded-full border border-[#222]"></div>
                      <div className="absolute inset-10 rounded-full border border-[#222]"></div>
                      <div className="absolute inset-[44px] rounded-full border border-[#222]"></div>
                      <div className="absolute inset-[52px] rounded-full border border-[#222]"></div>
                      <div
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E63946] flex items-center justify-center border-2 border-[#333] relative overflow-hidden"
                        style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.3)' }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-50 font-black italic text-[8px] md:text-[10px] transform -rotate-45 text-black">
                          {STATION.name}
                        </div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white border border-gray-400"></div>
                      </div>
                    </div>
                    <p
                      className={`font-mono text-xs font-bold uppercase tracking-widest mt-8 ${
                        isPlaying ? 'text-[#E63946] animate-pulse drop-shadow-[0_0_6px_rgba(230,57,70,0.5)]' : 'text-white/30'
                      }`}
                    >
                      {isPlaying ? 'ON AIR / SPINNING' : status === 'reconnecting' ? 'RECONNECTING' : 'TURNTABLE IDLE'}
                    </p>
                  </div>
                )}
                {currentView === 'news' && <NewsView />}
              </div>
            </aside>
          </div>

          {marqueeText && (
            <footer
              className="h-12 flex items-center overflow-hidden flex-shrink-0 relative border-t border-black/40"
              style={{ background: 'linear-gradient(180deg, #ff4655, #E63946 60%, #c92836)' }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
              <div className="flex whitespace-nowrap animate-marquee-text">
                <span className="px-8 text-black font-black uppercase text-sm italic tracking-wide">{marqueeText}</span>
                <span className="px-8 text-black font-black uppercase text-sm italic tracking-wide">{marqueeText}</span>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
