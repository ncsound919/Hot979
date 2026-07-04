import React from 'react';
import { render } from '@testing-library/react-native';
import MPCPlayer from '../src/components/MPCPlayer';

jest.mock('../src/hooks/useStream', () => ({
  useStream: jest.fn(() => ({
    status: 'idle',
    errorMessage: null,
    togglePlayback: jest.fn(),
    stopStream: jest.fn(),
    retryStream: jest.fn(),
  })),
}));

jest.mock('../src/config/station', () => ({
  STATION: {
    frequency: '97.9',
    callsign: 'WAUG / W250AZ',
    tagline: "The Triangle's #1 for Hip-Hop & R&B",
    name: 'HOT 97.9',
    streamUrl: 'https://test-stream.example.com/live',
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockUseStream = () => {
  const useStream = require('../src/hooks/useStream').useStream;
  return useStream;
};

const defaultMock = {
  status: 'idle',
  errorMessage: null,
  togglePlayback: jest.fn(),
  stopStream: jest.fn(),
  retryStream: jest.fn(),
};

describe('MPCPlayer (Boombox)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStream().mockReturnValue(defaultMock);
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<MPCPlayer />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders LCD display with station frequency', () => {
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('97.9')).toBeTruthy();
  });

  it('renders volume controls', () => {
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('VOLUME')).toBeTruthy();
  });

  it('shows PLAYING status when useStream reports playing', () => {
    mockUseStream().mockReturnValue({
      status: 'playing',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('PLAYING')).toBeTruthy();
  });

  it('shows BUFFERING status when loading', () => {
    mockUseStream().mockReturnValue({
      status: 'loading',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('BUFFERING')).toBeTruthy();
  });

  it('shows RECONNECT status when reconnecting', () => {
    mockUseStream().mockReturnValue({
      status: 'reconnecting',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('RECONNECT')).toBeTruthy();
  });

  it('shows READY status when idle', () => {
    mockUseStream().mockReturnValue({
      status: 'idle',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('READY')).toBeTruthy();
  });

  it('displays error bar with message when error occurs', () => {
    mockUseStream().mockReturnValue({
      status: 'error',
      errorMessage: 'Lost connection. Tap play to retry.',
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('Lost connection. Tap play to retry.')).toBeTruthy();
  });

  it('does not display error bar when no error', () => {
    const { queryByText } = render(<MPCPlayer />);
    expect(queryByText('Lost connection. Tap play to retry.')).toBeNull();
  });

  it('renders FM band indicator', () => {
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('FM')).toBeTruthy();
  });

  it('renders station callsign', () => {
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('WAUG / W250AZ')).toBeTruthy();
  });

  it('matches snapshot when idle', () => {
    const { toJSON } = render(<MPCPlayer />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when playing', () => {
    mockUseStream().mockReturnValue({
      status: 'playing',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { toJSON } = render(<MPCPlayer />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when error state', () => {
    mockUseStream().mockReturnValue({
      status: 'error',
      errorMessage: 'Connection lost.',
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { toJSON } = render(<MPCPlayer />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders with loading status', () => {
    mockUseStream().mockReturnValue({
      status: 'loading',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('BUFFERING')).toBeTruthy();
  });

  it('renders with reconnecting status', () => {
    mockUseStream().mockReturnValue({
      status: 'reconnecting',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('RECONNECT')).toBeTruthy();
  });

  it('renders with paused status', () => {
    mockUseStream().mockReturnValue({
      status: 'paused',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = render(<MPCPlayer />);
    expect(getByText('READY')).toBeTruthy();
  });
});
