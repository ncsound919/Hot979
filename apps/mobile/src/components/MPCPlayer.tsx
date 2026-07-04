import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LCDScreen from './LCDScreen';
import PadBank from './PadBank';
import { useStream } from '../hooks/useStream';

function Speaker() {
  return (
    <View style={spkrStyles.outer}>
      <View style={spkrStyles.rim}>
        <View style={spkrStyles.cone}>
          <View style={spkrStyles.dustCap} />
        </View>
      </View>
      <View style={spkrStyles.screwTL} />
      <View style={spkrStyles.screwTR} />
      <View style={spkrStyles.screwBL} />
      <View style={spkrStyles.screwBR} />
      <View style={spkrStyles.grillOverlay} pointerEvents="none" />
    </View>
  );
}

export default function MPCPlayer() {
  const { top: safeTop } = useSafeAreaInsets();
  const { status, errorMessage, togglePlayback } = useStream();
  const [volume, setVolume] = useState(0.8);
  const isPlaying = status === 'playing';

  return (
    <View testID="mpc-player" style={[styles.wrapper, { paddingTop: safeTop + 4 }]}>
      <View style={styles.handle} />
      <View style={styles.antenna} />

      <View style={styles.body}>
        <View style={styles.topRim} />
        <View style={styles.brandBar}>
          <View style={styles.brandDotL} />
          <View style={styles.brandDotR} />
        </View>

        <View style={styles.mainRow}>
          <Speaker />

          <View style={styles.centerSection}>
            <View style={styles.lcdWrap}>
              <LCDScreen isPlaying={isPlaying} status={status} />
            </View>

            <View style={styles.controlPanel}>
              <PadBank
                isPlaying={isPlaying}
                onPlayToggle={togglePlayback}
                volume={volume}
                onVolumeChange={setVolume}
              />
            </View>
          </View>

          <Speaker />
        </View>

        {errorMessage && (
          <View testID="error-bar" style={styles.errorBar}>
            <View style={styles.errorInner}>
              <View style={styles.errorPip} />
          <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const spkrStyles = StyleSheet.create({
  outer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#333',
  },
  rim: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  cone: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
  },
  dustCap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
  },
  screwTL: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555',
  },
  screwTR: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555',
  },
  screwBL: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555',
  },
  screwBR: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555',
  },
  grillOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    opacity: 0.03,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 200,
    height: 28,
    borderRadius: 14,
    borderWidth: 5,
    borderColor: '#555',
    borderBottomColor: '#333',
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  antenna: {
    width: 2,
    height: 40,
    backgroundColor: '#666',
    alignSelf: 'flex-end',
    marginRight: 60,
    transform: [{ rotate: '-15deg' }],
    marginBottom: -8,
  },
  body: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  topRim: {
    height: 4,
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 2,
    backgroundColor: '#151515',
  },
  brandDotL: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E63946',
  },
  brandDotR: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E63946',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  centerSection: {
    flex: 1,
    gap: 8,
  },
  lcdWrap: {
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#2a2a2a',
  },
  controlPanel: {
    borderRadius: 8,
    padding: 8,
  },
  errorBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  errorInner: {
    backgroundColor: 'rgba(230,57,70,0.2)',
    borderRadius: 4,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E63946',
  },
  errorText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#fca5a5',
    flex: 1,
  },
});
