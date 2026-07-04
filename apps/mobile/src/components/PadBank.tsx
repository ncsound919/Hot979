import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Play, Square } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface PadBankProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export default function PadBank({
  isPlaying,
  onPlayToggle,
  volume,
  onVolumeChange,
}: PadBankProps) {
  return (
    <View style={styles.container}>
      <View style={styles.knobRow}>
        <View style={styles.knobSection}>
          <Text style={styles.knobLabel}>VOLUME</Text>
          <View style={styles.knobWrap}>
            <Slider
              testID="volume-slider"
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={onVolumeChange}
              minimumTrackTintColor="#888"
              maximumTrackTintColor="#333"
              thumbTintColor="#ccc"
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Pressable
            testID="play-pause-btn"
            onPress={onPlayToggle}
            style={({ pressed }) => [
              styles.playBtn,
              isPlaying && styles.playBtnActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            {isPlaying ? (
              <Square size={22} color="#fff" fill="#fff" />
            ) : (
              <Play size={26} color="#fff" fill="#fff" />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  knobRow: {
    marginBottom: 16,
  },
  knobSection: {
    alignItems: 'center',
  },
  knobLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 2,
    marginBottom: 4,
  },
  knobWrap: {
    width: '100%',
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#555',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  playBtnActive: {
    backgroundColor: '#c9302c',
    borderColor: '#ff5c5c',
  },
});
