import { useEffect, useState, useRef, Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TrackPlayer from 'react-native-track-player';
import MPCPlayer from './src/components/MPCPlayer';

// --- Error Boundary ---

interface EBProps { children: ReactNode }
interface EBState { hasError: boolean }

class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// --- Fallback UI ---

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={errorStyles.container}>
      <Text style={errorStyles.title}>Something broke the console</Text>
      <Pressable onPress={onRetry} style={errorStyles.btn}>
        <Text style={errorStyles.btnText}>Reload App</Text>
      </Pressable>
    </View>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: '#E63946',
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  btnText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
  },
});

// --- Splash ---

function Splash() {
  return (
    <View style={splashStyles.container}>
      <StatusBar style="light" />
      <Text style={splashStyles.text}>HOT 97.9</Text>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#E63946',
    letterSpacing: -2,
  },
});

// --- Main App ---

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});

export default function App() {
  const [ready, setReady] = useState(false);
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
    TrackPlayer.setupPlayer({ waitForBuffer: true })
      .then(() => setReady(true))
      .catch(() => {
        setReady(true);
      });
  }, []);

  if (!ready) {
    return <Splash />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ErrorBoundary>
        <View style={appStyles.container}>
          <MPCPlayer />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
