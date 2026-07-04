# E2E Testing Setup — Hot 97.9 Mobile

This document outlines the E2E testing strategy for the React Native (Expo) mobile app.

## Framework: Detox

Detox is the recommended E2E testing framework for React Native apps with Expo dev builds.

### Prerequisites

```bash
# Install Detox CLI globally
npm install -g detox-cli

# Install for the project
cd apps/mobile
npm install --save-dev detox
```

### Configuration

Add to `package.json`:

```json
{
  "detox": {
    "buildScript": "npx expo prebuild --clean && cd ios && xcodebuild -workspace Hot979.xcworkspace -scheme Hot979 -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    "testRunner": "jest",
    "specs": "__e2e__/",
    "behavior": {
      "init": {
        "exposeGlobals": false
      }
    },
    "apps": {
      "ios.debug": {
        "type": "ios.app",
        "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/Hot979.app",
        "build": "npx expo prebuild --clean && cd ios && xcodebuild -workspace Hot979.xcworkspace -scheme Hot979 -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
      },
      "android.debug": {
        "type": "android.apk",
        "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
        "build": "npx expo prebuild --clean && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug"
      }
    },
    "devices": {
      "simulator": {
        "type": "ios.simulator",
        "device": {
          "type": "iPhone 16"
        }
      },
      "emulator": {
        "type": "android.emulator",
        "device": {
          "avdName": "Pixel_7_API_35"
        }
      }
    },
    "configurations": {
      "ios.sim.debug": {
        "device": "simulator",
        "app": "ios.debug"
      },
      "android.emu.debug": {
        "device": "emulator",
        "app": "android.debug"
      }
    }
  }
}
```

## E2E Test Files

Create `__e2e__/` in `apps/mobile/`:

### `__e2e__/app.test.ts`

```typescript
import { by, device, element, expect, waitFor } from 'detox';

describe('Hot 97.9 Boombox', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the splash screen on launch', async () => {
    await expect(element(by.text('HOT 97.9'))).toBeVisible();
  });

  it('should display the main player after loading', async () => {
    await waitFor(element(by.text('97.9')))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.text('FM'))).toBeVisible();
  });

  it('should display the LCD screen with status', async () => {
    await waitFor(element(by.text('READY')))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.text('128K AAC'))).toBeVisible();
  });

  it('should display volume controls', async () => {
    await waitFor(element(by.text('VOLUME')))
      .toBeVisible()
      .withTimeout(5000);
  });

  // Requires the play-pause-btn testID or accessibilityLabel
  it('should toggle playback on button press', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('play-pause-btn')).tap();
  });
});
```

### `__e2e__/streaming.test.ts`

```typescript
import { by, device, element, expect, waitFor } from 'detox';

describe('Audio Streaming', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should connect to Icecast stream on play', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('play-pause-btn')).tap();

    await waitFor(element(by.text('PLAYING')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
```

## Running E2E Tests

```bash
# Build the app
npx detox build --configuration ios.sim.debug

# Run tests
npx detox test --configuration ios.sim.debug

# Android
npx detox build --configuration android.emu.debug
npx detox test --configuration android.emu.debug
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx detox build --configuration ios.sim.debug
      - run: npx detox test --configuration ios.sim.debug
```

## Manual Test Checklist

Beyond automated E2E, verify these scenarios manually before each release:

- [ ] App launches to splash screen
- [ ] Splash transitions to main player
- [ ] Station frequency 97.9 displayed
- [ ] Tap play → status changes to PLAYING
- [ ] Audio plays from Icecast stream
- [ ] Tap pause → audio stops
- [ ] Kill app → reopen → state restored
- [ ] Lock screen controls show station name
- [ ] Background audio continues
- [ ] Reconnect on network loss
- [ ] Volume slider works
- [ ] Error state displays message
- [ ] Boombox UI renders correctly on iPhone SE, 16, Pro Max
- [ ] Boombox UI renders correctly on Android (small/medium/large)
