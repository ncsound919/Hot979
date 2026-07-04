// react-native-reanimated jest setup
try {
  require('react-native-reanimated/lib/module/reanimated2/jestUtils').setUpTests();
} catch {
  try {
    require('react-native-reanimated/src/jestUtils').setUpTests();
  } catch {}
}

// Mock react-native-svg (used by lucide-react-native)
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  Rect: 'Rect',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  Line: 'Line',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
  G: 'G',
  Text: 'Text',
  TSpan: 'TSpan',
  TextPath: 'TextPath',
  Defs: 'Defs',
  ClipPath: 'ClipPath',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
  Use: 'Use',
  Symbol: 'Symbol',
  Image: 'Image',
}));

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(undefined),
  add: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
  getActiveTrack: jest.fn().mockResolvedValue(null),
  getPlaybackState: jest.fn().mockResolvedValue({ state: 'none' }),
  registerPlaybackService: jest.fn(),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  State: {
    None: 'none',
    Playing: 'playing',
    Paused: 'paused',
    Buffering: 'buffering',
    Connecting: 'connecting',
    Error: 'error',
    Stopped: 'stopped',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteStop: 'remote-stop',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    PlaybackState: 'playback-state',
    PlaybackError: 'playback-error',
    PlaybackQueueEnded: 'playback-queue-ended',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
  },
  usePlaybackState: jest.fn().mockReturnValue({ state: 'none' }),
  useProgress: jest.fn().mockReturnValue({ position: 0, duration: 0, buffered: 0 }),
}));

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return (props) => <View testID="slider" {...props} />;
});

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    SafeAreaView: ({ children }) => children,
    initialWindowMetrics: { insets: inset, frame },
  };
});

// Mock expo-keep-awake
jest.mock('expo-keep-awake', () => ({
  useKeepAwake: jest.fn(),
  activateKeepAwakeAsync: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));
