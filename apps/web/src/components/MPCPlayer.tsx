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

  // Store latest versions of callbacks in refs so audio event listeners
  // registered once (on mount) always call the current implementation without
  // stale closures.
  const statusRef = useRef<PlaybackStatus>('idle');
  useEffect(() => { statusRef.current = status; }, [status]);

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

  const stopStallWatch = useCallback(() => {
    if (stallCheckRef.current) {
      clearInterval(stallCheckRef.current);
      stallCheckRef.current = null;
    }
  }, []);

  // reconnectRef allows event listeners set up once on mount to always call
  // the latest reconnect without capturing a stale closure.
  const reconnectRef = useRef<() => void>(() => {});
  const startStreamRef = useRef<() => void>(() => {});
  const stopStreamRef = useRef<() => void>(() => {});
  const togglePlayRef = useRef<() => void>(() => {});

  const hardResetAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.removeAttribute('src');
    audioRef.current.load();
  }, []);

  const updatePlaybackState = (state: 'playing' | 'paused' | 'none') => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state;
  };

  const startStallWatch = useCallback(() => {
    stopStallWatch();
    lastTimeUpdateRef.current = Date.now();
    stallCheckRef.current = setInterval(() => {
      const elapsed = Date.now() - lastTimeUpdateRef.current;
      if (elapsed > STALL_TIMEOUT_MS && statusRef.current === 'playing') {
        reconnectRef.current();
      }
    }, 3000);
  }, [stopStallWatch]);

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
    startStreamRef.current();
  }, [stopStallWatch, hardResetAudio]);

  // Keep reconnectRef current
  useEffect(() => { reconnectRef.current = reconnect; }, [reconnect]);

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

  // Keep startStreamRef current
  useEffect(() => { startStreamRef.current = startStream; }, [startStream]);

  const stopStream = useCallback(() => {
    hardResetAudio();
    stopStallWatch();
    releaseWakeLock();
    reconnectAttemptsRef.current = 0;
    setStatus('idle');
    setErrorMessage(null);
    updatePlaybackState('none');
  }, [hardResetAudio, stopStallWatch, releaseWakeLock]);

  // Keep stopStreamRef current
  useEffect(() => { stopStreamRef.current = stopStream; }, [stopStream]);

  const togglePlay = useCallback(() => {
    if (status === 'playing' || status === 'reconnecting' || status === 'loading') {
      stopStream();
    } else {
      startStream();
    }
  }, [status, startStream, stopStream]);

  // Keep togglePlayRef current
  useEffect(() => { togglePlayRef.current = togglePlay; }, [togglePlay]);

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
    // Use refs so the Media Session handlers always call the latest callbacks
    navigator.mediaSession.setActionHandler('play', () => togglePlayRef.current());
    navigator.mediaSession.setActionHandler('pause', () => togglePlayRef.current());
    navigator.mediaSession.setActionHandler('stop', () => stopStreamRef.current());
  }, []);

  // Mount-time setup: create Audio element and register stable event listeners
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = 'anonymous';
    audioRef.current.preload = 'none';

    audioRef.current.addEventListener('timeupdate', () => {
      lastTimeUpdateRef.current = Date.now();
    });
    // Use refs so the handlers always invoke the latest reconnect
    audioRef.current.addEventListener('error', () => {
      const s = statusRef.current;
      if (s === 'playing' || s === 'loading') reconnectRef.current();
    });
    audioRef.current.addEventListener('stalled', () => {
      if (statusRef.current === 'playing') reconnectRef.current();
    });

    audioRef.current.volume = volume;
    setupMediaSession();

    const handleOnline = () => {
      const s = statusRef.current;
      if (s === 'error' || s === 'reconnecting') reconnectRef.current();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      stopStallWatch();
      releaseWakeLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between border-b border-zinc-700">
          <span className="text-white font-bold text-sm tracking-widest">{STATION.name}</span>
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <span>{STATION.callsign}</span>
            <span>&nbsp;·&nbsp;</span>
            <span>{STATION.tagline}</span>
          </div>
        </div>

        {/* Status bar */}
        <div className="bg-zinc-900 px-4 py-1 text-center">
          <span className="text-xs text-zinc-400">
            {status === 'reconnecting'
              ? 'Reconnecting…'
              : status === 'loading'
              ? 'Connecting…'
              : 'Studio Live'}
          </span>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-950 border-b border-red-800 px-4 py-2">
            <p className="text-red-300 text-xs text-center">{errorMessage}</p>
          </div>
        )}

        {/* LCD + Pads */}
        {currentView === 'player' && (
          <div className="p-4 space-y-4">
            <LCDScreen status={status} isPlaying={isPlaying} />
            <div className="flex justify-center">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 transition-all flex items-center justify-center shadow-lg"
                aria-label={isPlaying ? 'Stop stream' : 'Play stream'}
              >
                {status === 'loading' || status === 'reconnecting' ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <span className="w-4 h-4 bg-white rounded-sm" />
                ) : (
                  <span className="w-0 h-0 border-l-[18px] border-l-white border-y-[11px] border-y-transparent ml-1" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="border-t border-zinc-700 px-4 py-2">
          <p className="text-zinc-500 text-xs text-center tracking-widest uppercase">Studio Command Center</p>
        </div>

        {/* Pad bank */}
        {currentView === 'player' && (
          <div className="px-4 pb-4">
            <PadBank
              status={status}
              onViewChange={setCurrentView}
              currentView={currentView}
            />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-zinc-500 text-xs">{STATION.name}</span>
              <span className="text-zinc-500 text-xs">
                {isPlaying
                  ? 'ON AIR / SPINNING'
                  : status === 'reconnecting'
                  ? 'RECONNECTING'
                  : 'TURNTABLE IDLE'}
              </span>
            </div>
          </div>
        )}

        {/* News view */}
        {currentView === 'news' && <NewsView />}

        {/* Promo marquee */}
        {marqueeText && (
          <div className="bg-zinc-800 border-t border-zinc-700 overflow-hidden py-1">
            <div className="whitespace-nowrap animate-marquee text-xs text-zinc-400 inline-block">
              &nbsp;&nbsp;{marqueeText}&nbsp;&nbsp;&nbsp;&nbsp;{marqueeText}&nbsp;&nbsp;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
