import React from 'react';
import { render } from '@testing-library/react-native';
import TrackPlayer from 'react-native-track-player';
import App from '../App';

jest.mock('../src/config/station', () => ({
  STATION: {
    frequency: '97.9',
    callsign: 'WAUG / W250AZ',
    tagline: "The Triangle's #1 for Hip-Hop & R&B",
    name: 'HOT 97.9',
    streamUrl: 'https://test-stream.example.com/live',
  },
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows splash screen while TrackPlayer initializes', () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByText } = render(<App />);
    expect(getByText('HOT 97.9')).toBeTruthy();
  });

  it('renders the main app after TrackPlayer initializes', async () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockResolvedValue(undefined);
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue(null);

    const { findByText } = render(<App />);
    const readyText = await findByText('READY');
    expect(readyText).toBeTruthy();
  });

  it('renders the app even if TrackPlayer setup fails', async () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockRejectedValue(new Error('setup failed'));
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue(null);

    const { findByText } = render(<App />);
    const readyText = await findByText('READY');
    expect(readyText).toBeTruthy();
  });

  it('renders splash screen initially', () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { toJSON } = render(<App />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders boombox container in the main view', async () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockResolvedValue(undefined);
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue(null);

    const { findByText } = render(<App />);
    const volLabel = await findByText('VOLUME');
    expect(volLabel).toBeTruthy();
  });

  it('matches snapshot when showing splash', () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { toJSON } = render(<App />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot after initialization', async () => {
    (TrackPlayer.setupPlayer as jest.Mock).mockResolvedValue(undefined);
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue(null);
    const { findByText, toJSON } = render(<App />);
    await findByText('READY');
    expect(toJSON()).toMatchSnapshot();
  });
});
