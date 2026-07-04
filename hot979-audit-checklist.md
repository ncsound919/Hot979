# Hot979 Mobile App Audit Checklist

## 1. Repository & Architecture
- Confirm `apps/mobile` is the only source of mobile app code and does not import from `../../apps` or other app folders.
- Verify `packages/shared` is used only via `@shared/*` imports (no deep relative paths).
- Check that `apps/mobile/tsconfig.json`, `babel.config.js`, and `metro.config.js` all define a consistent `@shared` alias.
- Ensure `packages/shared/content/station.ts` is the single source of truth for stream URL, callsign, frequency, and branding.
- Validate that environment-specific logic (Android/iOS, Node-only code) does not live in `packages/shared`.

## 2. Android Build & Native Layer
- Open `apps/mobile/android/gradle/wrapper/gradle-wrapper.properties` and verify Gradle version matches React Native/Expo docs.
- Check `apps/mobile/android/build.gradle` and `apps/mobile/android/app/build.gradle` for consistent `compileSdkVersion` and `targetSdkVersion`.
- Document required `JAVA_HOME` and `GRADLE_USER_HOME` values for Windows builds in `apps/mobile/README.md`.
- Confirm CMake and NDK versions used for `react-native-reanimated`, `react-native-track-player`, and `react-native-screens` are noted (and match their docs).
- Verify project path guidance for Windows (short path like `C:` or `C:\hot979`, and long-path support if needed).

## 3. Streaming Logic
- Review `apps/mobile/src/hooks/useStream.ts` for a clear state machine: idle, connecting, playing, error, reconnecting, stopped.
- Ensure `useStream` handles:
  - First connection to the stream.
  - Manual pause/resume.
  - Network errors and server-side failures.
  - Retry/backoff behavior (no tight infinite loops).
- Check that cleanup logic stops TrackPlayer, unsubscribes listeners, and resets state on unmount.
- Confirm `apps/mobile/src/config/station.ts` and `apps/mobile/src/config/env.ts` only override stream URL via env variables (no hard-coded alternative URLs).
- Verify that changing `packages/shared/content/station.ts` is sufficient to change the stream URL everywhere.

## 4. Audio Playback & Services
- Inspect `apps/mobile/track-player-service.ts` for correct handling of lock-screen events (play, pause, stop, seek if applicable).
- Ensure playback service and React state stay in sync (no situations where TrackPlayer is playing but UI says paused, or vice versa).
- Confirm background audio is enabled and correctly configured in Expo and Android manifests.
- Verify that the app correctly handles:
  - Loss of audio focus (e.g., incoming phone call).
  - Bluetooth headset play/pause commands (if supported).

## 5. UI Components (Boombox)
- Examine `apps/mobile/src/components/MPCPlayer.tsx` to ensure it is the single orchestrator for the boombox UI and `useStream`.
- Confirm `LCDScreen.tsx` displays:
  - Station name and frequency from `StationConfig`.
  - Clear status for "Connecting", "Playing", "Error", and "Reconnecting".
  - Equalizer bars that reflect playback state (or are visually consistent with it).
- Check `PadBank.tsx` wiring:
  - Play/pause button triggers only one handler connected to `useStream`.
  - Volume slider updates both TrackPlayer volume and the UI state.
- Verify that UI test IDs (for Detox) are stable and documented (e.g., `testID="play-button"`, `testID="lcd-screen"`).

## 6. Configuration & Environment
- Compare `apps/mobile/.env.example` against `apps/mobile/src/config/env.ts` to ensure all required env vars are documented.
- Verify `EXPO_PUBLIC_STREAM_URL` override works and falls back to `StationConfig` when unset.
- Confirm there are no hard-coded URLs in components or hooks.
- Ensure `packages/shared/types/index.ts` defines `StationConfig` clearly and is used everywhere station config is referenced.

## 7. Testing (Unit & Integration)
- Run `npm test` in `apps/mobile` and verify all tests pass.
- Check `apps/mobile/__tests__/useStream.test.ts`:
  - All state transitions are covered.
  - Error and retry paths are thoroughly tested.
  - Cleanup behavior is verified.
- Review component tests (`LCDScreen.test.tsx`, `PadBank.test.tsx`, `MPCPlayer.test.tsx`, `App.test.tsx`) for:
  - Correct rendering of statuses and labels.
  - Interaction tests for play/pause and volume.
  - Snapshot tests that are meaningful (not brittle).
- Inspect `apps/mobile/__tests__/station.test.ts` to ensure misconfigured `StationConfig` (missing URL, invalid frequency) fails fast.
- Confirm `apps/mobile/__tests__/integration.test.tsx` mounts the full tree and exercises a realistic flow (splash → connect → play → pause → error → retry).

## 8. End-to-End (Detox)
- Follow `apps/mobile/E2E_SETUP.md` and ensure Detox configuration matches the current React Native and Android tooling.
- Verify `apps/mobile/__e2e__/splash.test.ts`, `streaming.test.ts`, and `layout.test.ts`:
  - Use stable test IDs.
  - Reflect realistic user behavior (opening app, tapping play, seeing playback state).
  - Include assertions for both success and failure cases.
- Confirm E2E tests can run locally with an emulator or physical device.
- Document any platform-specific quirks (e.g., emulator audio, Bluetooth) in `E2E_SETUP.md`.

## 9. Patch Management & Node.js v24
- Check `apps/mobile/package.json` for:
  - `patch-package` installed as a dev dependency.
  - `"postinstall": "patch-package"` script configured.
- Inspect `apps/mobile/patches/` for patch files covering:
  - `react-native-track-player` Node v24 fixes.
  - `expo-modules-core` CJS/entrypoint fixes.
  - `expo`, `expo-status-bar`, `expo-keep-awake` v24 compatibility.
- Ensure patches modify built runtime files (dist/build JS) rather than TypeScript-only source.
- Verify `README.md` (or a dedicated `PATCHES.md`) documents why each patch exists and how to regenerate it.

## 10. Developer Experience & Onboarding
- Review `apps/mobile/README.md` to confirm it includes:
  - Node version requirements.
  - Steps to install dependencies (including any `--legacy-peer-deps` flags).
  - Commands to start Metro, run tests, build Android, and run Detox.
  - Environment variable setup with reference to `.env.example`.
- Make sure `apps/mobile/E2E_SETUP.md` stays in sync with actual Detox commands and Gradle/CMake versions.
- Validate that a new developer can:
  - Clone the repo.
  - Install dependencies.
  - Build the Android APK.
  - Run Jest and Detox tests.
  - Configure the stream URL and hear audio within a short, well-documented checklist.
