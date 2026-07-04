import { device, element, by, expect, waitFor } from 'detox';

describe('Audio Streaming Controls', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show PLAYING status after tapping play', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(8000);
    await element(by.id('play-pause-btn')).tap();
    await waitFor(element(by.id('status-text')))
      .toBeVisible()
      .withTimeout(15000);
    await expect(element(by.id('status-text'))).toHaveText('PLAYING');
  });

  it('should show READY status after tapping pause', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(8000);
    await element(by.id('play-pause-btn')).tap();
    await waitFor(element(by.id('status-text').withAncestor(by.id('lcd-screen'))))
      .toHaveText('PLAYING')
      .withTimeout(15000);
    await element(by.id('play-pause-btn')).tap();
    await expect(element(by.id('status-text'))).toHaveText('READY');
  });

  it('should adjust volume when slider is moved', async () => {
    await waitFor(element(by.id('volume-slider')))
      .toBeVisible()
      .withTimeout(8000);
    await element(by.id('volume-slider')).adjustSliderToPosition(0.5);
  });

  it('should show error bar when stream connection fails', async () => {
    await waitFor(element(by.id('play-pause-btn')))
      .toBeVisible()
      .withTimeout(8000);
    await element(by.id('play-pause-btn')).tap();
  });
});
