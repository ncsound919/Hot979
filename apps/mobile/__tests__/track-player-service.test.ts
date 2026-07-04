import TrackPlayer, { Event } from 'react-native-track-player';
import { playbackService } from '../track-player-service';

describe('playbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers remote play handler', () => {
    playbackService();
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(
      Event.RemotePlay,
      expect.any(Function)
    );
  });

  it('registers remote pause handler', () => {
    playbackService();
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(
      Event.RemotePause,
      expect.any(Function)
    );
  });

  it('registers remote stop handler', () => {
    playbackService();
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(
      Event.RemoteStop,
      expect.any(Function)
    );
  });

  it('registers remote next handler (no-op)', () => {
    playbackService();
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(
      Event.RemoteNext,
      expect.any(Function)
    );
  });

  it('registers remote previous handler (no-op)', () => {
    playbackService();
    expect(TrackPlayer.addEventListener).toHaveBeenCalledWith(
      Event.RemotePrevious,
      expect.any(Function)
    );
  });

  it('returns an unsubscribe function for each listener', () => {
    (TrackPlayer.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });
    playbackService();
    const calls = (TrackPlayer.addEventListener as jest.Mock).mock.results;
    calls.forEach((call: any) => {
      expect(call.value).toHaveProperty('remove');
    });
  });

  it('remote play callback calls TrackPlayer.play', () => {
    playbackService();
    const playCall = (TrackPlayer.addEventListener as jest.Mock).mock.calls.find(
      ([event]: any) => event === Event.RemotePlay
    );
    const handler = playCall[1];
    handler();
    expect(TrackPlayer.play).toHaveBeenCalled();
  });

  it('remote pause callback calls TrackPlayer.pause', () => {
    playbackService();
    const pauseCall = (TrackPlayer.addEventListener as jest.Mock).mock.calls.find(
      ([event]: any) => event === Event.RemotePause
    );
    const handler = pauseCall[1];
    handler();
    expect(TrackPlayer.pause).toHaveBeenCalled();
  });

  it('remote stop callback calls TrackPlayer.stop', () => {
    playbackService();
    const stopCall = (TrackPlayer.addEventListener as jest.Mock).mock.calls.find(
      ([event]: any) => event === Event.RemoteStop
    );
    const handler = stopCall[1];
    handler();
    expect(TrackPlayer.stop).toHaveBeenCalled();
  });
});
