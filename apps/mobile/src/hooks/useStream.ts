import { useEffect, useRef, useState, useCallback } from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
} from 'react-native-track-player';
import { STATION } from '../config/station';
import { STREAM_URL } from '../config/env';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'reconnecting';

const MAX_RECONNECT = 5;
const RECONNECT_DELAY_MS = 2500;

export function useStream() {
  const playbackState = usePlaybackState();
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInit = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearReconnectTimer();
    };
  }, [clearReconnectTimer]);

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;
    TrackPlayer.setupPlayer({ waitForBuffer: true }).catch(() => {});
    const addTrack = async () => {
      try {
        const track = await TrackPlayer.getActiveTrack();
        if (!track && STREAM_URL) {
          await TrackPlayer.add({
            id: 'hot979-live',
            url: STREAM_URL,
            title: STATION.name,
            artist: STATION.tagline,
            isLiveStream: true,
          });
        }
      } catch {
        setStatus('error');
        setErrorMessage('Failed to initialize audio player.');
      }
    };
    addTrack();
  }, []);

  useEffect(() => {
    const s = playbackState.state;
    switch (s) {
      case State.Playing:
        setStatus('playing');
        reconnectCount.current = 0;
        setErrorMessage(null);
        break;
      case State.Paused:
        setStatus('paused');
        setErrorMessage(null);
        break;
      case State.Buffering:
      case State.Connecting:
        setStatus('loading');
        break;
      case State.Error:
        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current += 1;
          setStatus('reconnecting');
          clearReconnectTimer();
          reconnectTimer.current = setTimeout(() => {
            TrackPlayer.play().catch(() => {});
          }, RECONNECT_DELAY_MS);
        } else {
          setStatus('error');
          setErrorMessage('Lost connection. Tap play to retry.');
        }
        break;
      case State.Stopped:
      case State.None:
        break;
    }
  }, [playbackState.state]);

  const togglePlayback = useCallback(async () => {
    try {
      const state = await TrackPlayer.getPlaybackState();
      if (state.state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        reconnectCount.current = 0;
        clearReconnectTimer();
        setErrorMessage(null);
        await TrackPlayer.play();
      }
    } catch {
      setStatus('error');
      setErrorMessage('Playback control failed. Tap play to retry.');
    }
  }, [clearReconnectTimer]);

  const stopStream = useCallback(async () => {
    clearReconnectTimer();
    try {
      await TrackPlayer.stop();
    } catch {}
    reconnectCount.current = 0;
    setErrorMessage(null);
    setStatus('idle');
  }, [clearReconnectTimer]);

  const retryStream = useCallback(async () => {
    reconnectCount.current = 0;
    clearReconnectTimer();
    setErrorMessage(null);
    setStatus('loading');
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: 'hot979-live',
        url: STREAM_URL,
        title: STATION.name,
        artist: STATION.tagline,
        isLiveStream: true,
      });
      await TrackPlayer.play();
    } catch {
      setStatus('error');
      setErrorMessage('Failed to reconnect. Please try again.');
    }
  }, [clearReconnectTimer]);

  return {
    status,
    errorMessage,
    togglePlayback,
    stopStream,
    retryStream,
  };
}
