import { renderHook, act } from '@testing-library/react-hooks';
import TrackPlayer from 'react-native-track-player';
import { useStream } from '../src/hooks/useStream';

jest.mock('../src/config/station', () => ({
  STATION: {
    streamUrl: 'https://test-stream.example.com/live',
    name: 'HOT 97.9',
    tagline: "The Triangle's #1 for Hip-Hop & R&B",
    callsign: 'WAUG / W250AZ',
    frequency: '97.9',
  },
}));

describe('useStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue(null);
    (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({ state: 'none' });
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'none' });
  });

  it('initializes with idle status', () => {
    const { result } = renderHook(() => useStream());
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('sets up TrackPlayer on mount', () => {
    renderHook(() => useStream());
    expect(TrackPlayer.setupPlayer).toHaveBeenCalledWith({ waitForBuffer: true });
  });

  it('adds the stream track on mount when no active track exists', async () => {
    renderHook(() => useStream());
    await act(() => Promise.resolve());
    expect(TrackPlayer.add).toHaveBeenCalledWith({
      id: 'hot979-live',
      url: 'https://test-stream.example.com/live',
      title: 'HOT 97.9',
      artist: "The Triangle's #1 for Hip-Hop & R&B",
      isLiveStream: true,
    });
  });

  it('does not add duplicate track when one already exists', async () => {
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue({ id: 'hot979-live', url: 'test' });
    renderHook(() => useStream());
    await act(() => Promise.resolve());
    expect(TrackPlayer.add).not.toHaveBeenCalled();
  });

  it('toggles from idle to playing', async () => {
    (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({ state: 'none' });
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.togglePlayback();
    });
    expect(TrackPlayer.play).toHaveBeenCalled();
  });

  it('toggles from playing to paused', async () => {
    (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({ state: 'playing' });
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'playing' });
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.togglePlayback();
    });
    expect(TrackPlayer.pause).toHaveBeenCalled();
  });

  it('stops the stream and resets state', async () => {
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.stopStream();
    });
    expect(TrackPlayer.stop).toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('retries stream by resetting and re-adding track', async () => {
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.retryStream();
    });
    expect(TrackPlayer.reset).toHaveBeenCalled();
    expect(TrackPlayer.add).toHaveBeenCalled();
    expect(TrackPlayer.play).toHaveBeenCalled();
    expect(result.current.status).toBe('loading');
  });

  it('cleans up reconnect timer on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = renderHook(() => useStream());
    unmount();
    jest.useRealTimers();
  });

  it('handles togglePlayback failure gracefully', async () => {
    (TrackPlayer.play as jest.Mock).mockRejectedValue(new Error('play failed'));
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.togglePlayback();
    });
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Playback control failed. Tap play to retry.');
  });

  it('sets error when addTrack fails during init', async () => {
    (TrackPlayer.add as jest.Mock).mockRejectedValue(new Error('add failed'));
    const { result } = renderHook(() => useStream());
    await act(() => Promise.resolve());
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Failed to initialize audio player.');
  });

  it('handles stopStream failure gracefully', async () => {
    (TrackPlayer.add as jest.Mock).mockResolvedValue(undefined);
    (TrackPlayer.stop as jest.Mock).mockRejectedValue(new Error('stop failed'));
    const { result } = renderHook(() => useStream());
    await act(() => Promise.resolve());
    await act(async () => {
      await result.current.stopStream();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('handles retryStream failure gracefully', async () => {
    (TrackPlayer.add as jest.Mock).mockResolvedValue(undefined);
    (TrackPlayer.reset as jest.Mock).mockRejectedValue(new Error('reset failed'));
    const { result } = renderHook(() => useStream());
    await act(() => Promise.resolve());
    await act(async () => {
      await result.current.retryStream();
    });
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Failed to reconnect. Please try again.');
  });

  it('reconnects on error state', async () => {
    jest.useFakeTimers();
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'error' });
    renderHook(() => useStream());
    act(() => { jest.advanceTimersByTime(2500); });
    expect(TrackPlayer.play).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('transitions to paused when playback state is paused', () => {
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'paused' });
    const { result } = renderHook(() => useStream());
    expect(result.current.status).toBe('paused');
    expect(result.current.errorMessage).toBeNull();
  });

  it('transitions to loading when playback state is buffering', () => {
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'buffering' });
    const { result } = renderHook(() => useStream());
    expect(result.current.status).toBe('loading');
  });

  it('transitions to loading when playback state is connecting', () => {
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'connecting' });
    const { result } = renderHook(() => useStream());
    expect(result.current.status).toBe('loading');
  });

  it('resets reconnect count on successful transition to playing', () => {
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'error' });
    const { result, rerender } = renderHook(() => useStream());
    (TrackPlayer as any).usePlaybackState.mockReturnValue({ state: 'playing' });
    rerender();
    expect(result.current.status).toBe('playing');
    expect(result.current.errorMessage).toBeNull();
  });

  it('gives up reconnecting after max attempts and shows error', () => {
    jest.useFakeTimers();
    let errorCount = 0;
    (TrackPlayer as any).usePlaybackState.mockImplementation(() => {
      return { state: 'error' };
    });
    const { result, rerender } = renderHook(() => useStream());
    for (let i = 0; i < 10; i++) {
      errorCount++;
      act(() => { jest.advanceTimersByTime(2500); });
      rerender();
    }
    expect(TrackPlayer.play).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('cleans up without error when unmounting', () => {
    const { unmount } = renderHook(() => useStream());
    expect(() => unmount()).not.toThrow();
  });

  it('handles getPlaybackState rejection in togglePlayback', async () => {
    (TrackPlayer.getPlaybackState as jest.Mock).mockRejectedValue(new Error('state failed'));
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.togglePlayback();
    });
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Playback control failed. Tap play to retry.');
  });

  it('handles rapid togglePlayback calls gracefully', async () => {
    (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({ state: 'playing' });
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.togglePlayback();
      await result.current.togglePlayback();
    });
    expect(TrackPlayer.pause).toHaveBeenCalledTimes(2);
  });

  it('does not crash when setupPlayer is called multiple times', () => {
    const { rerender } = renderHook(() => useStream());
    rerender();
    expect(TrackPlayer.setupPlayer).toHaveBeenCalledTimes(1);
  });
});
