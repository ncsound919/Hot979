import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { STATION } from '../config/station';
import type { PlaybackStatus } from '../hooks/useStream';

interface LCDScreenProps {
  isPlaying: boolean;
  status: PlaybackStatus;
}

function RetroEqualizer({ isPlaying }: { isPlaying: boolean }) {
  const [bars, setBars] = useState(Array(20).fill(4));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setBars(Array.from({ length: 20 }, () => Math.floor(Math.random() * 16 + 2)));
      }, 120);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setBars(Array(20).fill(4));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <View style={eqStyles.container}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[
            eqStyles.bar,
            { height: h },
            h > 12 && eqStyles.high,
            h > 8 && h <= 12 && eqStyles.mid,
          ]}
        />
      ))}
    </View>
  );
}

export default function LCDScreen({ isPlaying, status }: LCDScreenProps) {
  const statusText = isPlaying
    ? 'PLAYING'
    : status === 'loading'
    ? 'BUFFERING'
    : status === 'reconnecting'
    ? 'RECONNECT'
    : 'READY';

  return (
    <View testID="lcd-screen" style={styles.lcd}>
      <View style={styles.scanlines} pointerEvents="none" />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.freq}>{STATION.frequency}</Text>
          <Text style={styles.band}>FM</Text>
        </View>
        <Text style={styles.callSign}>{STATION.callsign}</Text>
        <Text style={styles.tagline} numberOfLines={1}>
          {STATION.tagline}
        </Text>
        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <Text testID="status-text" style={[styles.statusText, isPlaying && styles.statusLive]}>
            {statusText}
          </Text>
          <Text testID="stream-info" style={styles.streamInfo}>128K AAC</Text>
        </View>
        <View style={styles.eqRow}>
          <RetroEqualizer isPlaying={isPlaying} />
        </View>
      </View>
    </View>
  );
}

const lcdBg = '#0a1a0a';
const lcdText = '#39ff14';
const lcdTextDim = '#1a6b1a';
const lcdBorder = '#39ff14';

const styles = StyleSheet.create({
  lcd: {
    backgroundColor: lcdBg,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#222',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    backgroundColor: 'transparent',
  },
  inner: {
    padding: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  freq: {
    fontSize: 48,
    fontWeight: '900',
    color: lcdText,
    fontFamily: 'monospace',
    letterSpacing: -2,
    textShadowColor: lcdText,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  band: {
    fontSize: 14,
    fontWeight: '700',
    color: lcdTextDim,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  callSign: {
    fontSize: 10,
    fontWeight: '700',
    color: lcdTextDim,
    fontFamily: 'monospace',
    letterSpacing: 3,
    marginTop: -2,
  },
  tagline: {
    fontSize: 8,
    color: lcdTextDim,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: lcdBorder,
    opacity: 0.3,
    marginVertical: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: lcdTextDim,
    letterSpacing: 2,
  },
  statusLive: {
    color: lcdText,
    textShadowColor: lcdText,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  streamInfo: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: lcdTextDim,
  },
  eqRow: {
    marginTop: 6,
    height: 20,
  },
});

const eqStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 20,
  },
  bar: {
    flex: 1,
    backgroundColor: lcdTextDim,
    borderRadius: 1,
  },
  mid: {
    backgroundColor: lcdText,
  },
  high: {
    backgroundColor: '#ff3333',
  },
});
