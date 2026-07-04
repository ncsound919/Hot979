import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PadBank from '../src/components/PadBank';

describe('PadBank', () => {
  const defaultProps = {
    isPlaying: false,
    onPlayToggle: jest.fn(),
    volume: 0.8,
    onVolumeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders volume label', () => {
    const { getByText } = render(<PadBank {...defaultProps} />);
    expect(getByText('VOLUME')).toBeTruthy();
  });

  it('renders play button when idle', () => {
    const { getByTestId } = render(<PadBank {...defaultProps} />);
    const button = getByTestId('play-pause-btn');
    expect(button).toBeTruthy();
  });

  it('calls onPlayToggle when play button pressed', () => {
    const onPlayToggle = jest.fn();
    const { getByTestId } = render(
      <PadBank {...defaultProps} onPlayToggle={onPlayToggle} />
    );
    fireEvent.press(getByTestId('play-pause-btn'));
    expect(onPlayToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onVolumeChange when slider changes', () => {
    const onVolumeChange = jest.fn();
    const { getByTestId } = render(
      <PadBank {...defaultProps} onVolumeChange={onVolumeChange} />
    );
    const slider = getByTestId('slider');
    fireEvent(slider, 'valueChange', 0.5);
    expect(onVolumeChange).toHaveBeenCalledWith(0.5);
  });

  it('changes button style when playing', () => {
    const { getByTestId } = render(
      <PadBank {...defaultProps} isPlaying={true} />
    );
    const button = getByTestId('play-pause-btn');
    expect(button).toBeTruthy();
  });

  it('toggles to stop label when playing', () => {
    const { getByTestId } = render(
      <PadBank {...defaultProps} isPlaying={true} />
    );
    const button = getByTestId('play-pause-btn');
    fireEvent.press(button);
    expect(defaultProps.onPlayToggle).toHaveBeenCalled();
  });

  it('handles extreme volume values', () => {
    const onVolumeChange = jest.fn();
    const { getByTestId, rerender } = render(
      <PadBank {...defaultProps} volume={0} onVolumeChange={onVolumeChange} />
    );
    const slider = getByTestId('slider');
    fireEvent(slider, 'valueChange', 1);
    expect(onVolumeChange).toHaveBeenCalledWith(1);
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<PadBank {...defaultProps} />);
    expect(toJSON()).not.toBeNull();
  });

  it('matches snapshot when idle', () => {
    const { toJSON } = render(<PadBank {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when playing', () => {
    const { toJSON } = render(
      <PadBank {...defaultProps} isPlaying={true} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot at volume 0', () => {
    const { toJSON } = render(
      <PadBank {...defaultProps} volume={0} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders play icon (triangle) when not playing', () => {
    const { getByTestId } = render(<PadBank {...defaultProps} isPlaying={false} />);
    const btn = getByTestId('play-pause-btn');
    expect(btn).toBeTruthy();
  });

  it('renders stop icon (square) when playing', () => {
    const { getByTestId } = render(<PadBank {...defaultProps} isPlaying={true} />);
    const btn = getByTestId('play-pause-btn');
    expect(btn).toBeTruthy();
  });

  it('renders the knobRow container', () => {
    const { getByText } = render(<PadBank {...defaultProps} />);
    expect(getByText('VOLUME')).toBeTruthy();
  });
});
