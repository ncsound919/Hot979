import { device, element, by, expect, waitFor } from 'detox';

describe('Hot 97.9 Boombox — Splash & Loading', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show splash screen with station name on launch', async () => {
    await expect(element(by.text('HOT 97.9'))).toBeVisible();
  });

  it('should transition to main player after TrackPlayer initializes', async () => {
    await waitFor(element(by.id('mpc-player')))
      .toBeVisible()
      .withTimeout(8000);
  });

  it('should display the LCD tuner screen', async () => {
    await waitFor(element(by.id('lcd-screen')))
      .toBeVisible()
      .withTimeout(8000);
    await expect(element(by.id('stream-info'))).toBeVisible();
  });

  it('should display the volume control panel', async () => {
    await waitFor(element(by.id('volume-slider')))
      .toBeVisible()
      .withTimeout(8000);
  });

  it('should display the play/pause button', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(8000);
  });
});
