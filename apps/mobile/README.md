# HOT 97.9 — Mobile App

React Native (Expo) mobile app for Hot 97.9 FM — The Triangle's #1 for Hip-Hop & R&B.

## Requirements

| Tool | Version |
|------|---------|
| Node.js | **^20.0.0** or **^22.0.0** (v24 not yet supported by Expo SDK 52) |
| npm | 9+ |
| iOS | Xcode 16+ (macOS only) |
| Android | Android Studio, JDK 17+ |

```bash
node --version   # v20.x or v22.x recommended
```

## Architecture

```
BUTT (studio encoder) → Icecast (cloud) → react-native-track-player (mobile)
                                              ↑
                                    packages/shared/content/station.ts
                                              |
                                    apps/mobile/src/config/
                                        ├── env.ts         (stream URL resolution)
                                        └── station.ts     (re-exports shared config)
```

The mobile app is a **pure audio streaming client** — no news, no API backend. It connects directly to the Icecast/Shoutcast stream URL defined in the shared station config.

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on device/emulator (requires native build for TrackPlayer)
npm run prebuild
npm run ios       # or npm run android
```

## Environment Variables

Copy `.env.example` to `.env` to override the Icecast stream URL:

```bash
EXPO_PUBLIC_STREAM_URL=https://your-production-icecast.com/live
```

If unset, the app uses the stream URL from `packages/shared/content/station.ts`.

## Testing

```bash
# All unit + integration tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# E2E tests (requires Detox + native build)
npm run test:e2e
```

## Project Structure

```
src/
├── config/
│   ├── env.ts              # Environment-aware config (stream URL)
│   └── station.ts          # Re-exports from @shared/content/station
├── hooks/
│   └── useStream.ts        # TrackPlayer lifecycle, play/pause/reconnect
├── components/
│   ├── MPCPlayer.tsx       # Boombox body — speakers, handle, antenna
│   ├── LCDScreen.tsx       # Retro LCD tuner — frequency, equalizer, status
│   └── PadBank.tsx         # Controls — volume slider, play/pause button
├── App.tsx                 # Entry — SafeArea, ErrorBoundary, splash
├── index.js                # Expo root + TrackPlayer service registration
├── track-player-service.ts # Lock-screen / background audio handler
└── __tests__/              # 110+ unit/integration tests
```

## Monorepo Integration

The `@shared/*` alias resolves to `../../packages/shared/*` across three layers:

| Layer | Mechanism |
|-------|-----------|
| TypeScript | `tsconfig.json` paths |
| Babel | `babel-plugin-module-resolver` |
| Metro | `metro.config.js` watchFolders + extraNodeModules |

The shared package provides `station.ts` (callsign, frequency, stream URL, branding) used by both the web PWA and mobile app.

## Production Build

```bash
# Android APK/AAB
npm run build:android

# iOS IPA (macOS only)
npm run build:ios
```

Both builds require Expo Application Services (EAS) or local `expo build` with appropriate credentials configured.
