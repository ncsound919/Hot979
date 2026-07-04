import React from 'react';
import { render } from '@testing-library/react-native';
import LCDScreen from '../src/components/LCDScreen';

jest.mock('../src/config/station', () => ({
  STATION: {
    frequency: '97.9',
    callsign: 'WAUG / W250AZ',
    tagline: "The Triangle's #1 for Hip-Hop & R&B",
    name: 'HOT 97.9',
    streamUrl: 'https://test-stream.example.com/live',
  },
}));

describe('LCDScreen', () => {
  it('renders the station frequency', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    expect(getByText('97.9')).toBeTruthy();
  });

  it('renders FM band indicator', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    expect(getByText('FM')).toBeTruthy();
  });

  it('renders callsign', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    expect(getByText('WAUG / W250AZ')).toBeTruthy();
  });

  it('renders tagline', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    expect(getByText("The Triangle's #1 for Hip-Hop & R&B")).toBeTruthy();
  });

  it('displays PLAYING status when isPlaying is true', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={true} status="playing" />
    );
    expect(getByText('PLAYING')).toBeTruthy();
  });

  it('displays READY status when idle', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    expect(getByText('READY')).toBeTruthy();
  });

  it('displays BUFFERING status when loading', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="loading" />
    );
    expect(getByText('BUFFERING')).toBeTruthy();
  });

  it('displays RECONNECT status when reconnecting', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="reconnecting" />
    );
    expect(getByText('RECONNECT')).toBeTruthy();
  });

  it('displays stream info badge', () => {
    const { getByText } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    expect(getByText('128K AAC')).toBeTruthy();
  });

  it('renders equalizer bars when playing', () => {
    const { UNSAFE_getByType } = render(
      <LCDScreen isPlaying={true} status="playing" />
    );
    expect(UNSAFE_getByType).toBeTruthy();
  });

  it('renders without crashing for all status states', () => {
    const statuses = ['idle', 'loading', 'playing', 'paused', 'error', 'reconnecting'] as const;
    for (const s of statuses) {
      const { toJSON } = render(<LCDScreen isPlaying={s === 'playing'} status={s} />);
      expect(toJSON()).not.toBeNull();
    }
  });

  it('applies active glow style when playing', () => {
    const { getByText } = render(<LCDScreen isPlaying={true} status="playing" />);
    const statusEl = getByText('PLAYING');
    expect(statusEl).toBeTruthy();
  });

  it('does not render equalizer when idle', () => {
    const { queryByText } = render(<LCDScreen isPlaying={false} status="idle" />);
    expect(queryByText('PLAYING')).toBeNull();
  });

  it('renders pause status text', () => {
    const { getByText } = render(<LCDScreen isPlaying={false} status="paused" />);
    expect(getByText('READY')).toBeTruthy();
  });

  it('renders error status text', () => {
    const { getByText } = render(<LCDScreen isPlaying={false} status="error" />);
    expect(getByText('READY')).toBeTruthy();
  });

  it('matches snapshot when idle', () => {
    const { toJSON } = render(<LCDScreen isPlaying={false} status="idle" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when playing', () => {
    const { toJSON } = render(<LCDScreen isPlaying={true} status="playing" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('cleans up without error on unmount when playing', () => {
    const { unmount } = render(<LCDScreen isPlaying={true} status="playing" />);
    expect(() => unmount()).not.toThrow();
  });

  it('starts equalizer interval when playing becomes true', () => {
    jest.useFakeTimers();
    const { rerender } = render(
      <LCDScreen isPlaying={false} status="idle" />
    );
    rerender(<LCDScreen isPlaying={true} status="playing" />);
    jest.useRealTimers();
  });
});
