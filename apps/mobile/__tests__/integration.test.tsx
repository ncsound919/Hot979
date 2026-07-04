import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

function renderFullTree() {
  return render(
    <SafeAreaProvider>
      <MPCPlayer />
    </SafeAreaProvider>
  );
}

describe('Full Component Tree Integration', () => {
  it('renders the complete boombox hierarchy without error', () => {
    const { toJSON } = renderFullTree();
    expect(toJSON()).not.toBeNull();
  });

  it('renders station branding: frequency, callsign, FM', () => {
    const { getByText } = renderFullTree();
    expect(getByText('97.9')).toBeTruthy();
    expect(getByText('FM')).toBeTruthy();
    expect(getByText('WAUG / W250AZ')).toBeTruthy();
  });

  it('renders station tagline', () => {
    const { getByText } = renderFullTree();
    expect(getByText("The Triangle's #1 for Hip-Hop & R&B")).toBeTruthy();
  });

  it('renders the LCD display area', () => {
    const { getByText } = renderFullTree();
    expect(getByText('READY')).toBeTruthy();
    expect(getByText('128K AAC')).toBeTruthy();
  });

  it('renders the volume controller', () => {
    const { getByText } = renderFullTree();
    expect(getByText('VOLUME')).toBeTruthy();
  });

  it('renders a play/pause button', () => {
    const { getByTestId } = renderFullTree();
    expect(getByTestId('play-pause-btn')).toBeTruthy();
  });

  it('renders without error when status transitions to playing', () => {
    const useStream = require('../src/hooks/useStream').useStream;
    useStream.mockReturnValue({
      status: 'playing',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = renderFullTree();
    expect(getByText('PLAYING')).toBeTruthy();
  });

  it('renders without error on error state with message', () => {
    const useStream = require('../src/hooks/useStream').useStream;
    useStream.mockReturnValue({
      status: 'error',
      errorMessage: 'Test error message',
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = renderFullTree();
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('renders without error on reconnecting state', () => {
    const useStream = require('../src/hooks/useStream').useStream;
    useStream.mockReturnValue({
      status: 'reconnecting',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText } = renderFullTree();
    expect(getByText('RECONNECT')).toBeTruthy();
  });

  it('renders all three badge labels in LCD', () => {
    const { getByText } = renderFullTree();
    expect(getByText('128K AAC')).toBeTruthy();
    expect(getByText('FM')).toBeTruthy();
    expect(getByText('97.9')).toBeTruthy();
  });

  it('transitions between idle and playing state without crash', () => {
    const useStream = require('../src/hooks/useStream').useStream;
    useStream.mockReturnValue({
      status: 'playing',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    const { getByText, rerender } = renderFullTree();
    expect(getByText('PLAYING')).toBeTruthy();

    useStream.mockReturnValue({
      status: 'idle',
      errorMessage: null,
      togglePlayback: jest.fn(),
      stopStream: jest.fn(),
      retryStream: jest.fn(),
    });
    rerender(
      <SafeAreaProvider>
        <MPCPlayer />
      </SafeAreaProvider>
    );
    expect(getByText('READY')).toBeTruthy();
  });

  it('matches full tree snapshot', () => {
    const { toJSON } = renderFullTree();
    expect(toJSON()).toMatchSnapshot();
  });
});
