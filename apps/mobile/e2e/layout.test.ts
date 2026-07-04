import { device, element, by, expect, waitFor } from 'detox';

describe('Boombox UI Layout', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the main player container', async () => {
    await waitFor(element(by.id('mpc-player')))
      .toBeVisible()
      .withTimeout(8000);
  });

  it('should display the LCD screen with frequency and band', async () => {
    await waitFor(element(by.id('lcd-screen')))
      .toBeVisible()
      .withTimeout(8000);
    await expect(element(by.text('FM'))).toBeVisible();
  });

  it('should display the play/pause button', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(8000);
  });

  it('should display the volume slider', async () => {
    await waitFor(element(by.id('volume-slider')))
      .toBeVisible()
      .withTimeout(8000);
  });

  it('should display status text on the LCD', async () => {
    await waitFor(element(by.id('status-text')))
      .toBeVisible()
      .withTimeout(8000);
    await expect(element(by.id('status-text'))).toHaveText('READY');
  });
});
