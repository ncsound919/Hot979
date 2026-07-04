import { STATION } from '../src/config/station';

describe('StationConfig', () => {
  it('has a valid stream URL', () => {
    expect(STATION.streamUrl).toBeDefined();
    expect(STATION.streamUrl).toContain('http');
  });

  it('has a callsign', () => {
    expect(STATION.callsign).toBeDefined();
    expect(STATION.callsign.length).toBeGreaterThan(0);
  });

  it('has a frequency', () => {
    expect(STATION.frequency).toBeDefined();
    expect(STATION.frequency).toBe('97.9');
  });

  it('has a station name', () => {
    expect(STATION.name).toBe('HOT 97.9');
  });

  it('has a tagline', () => {
    expect(STATION.tagline).toBeDefined();
    expect(STATION.tagline.length).toBeGreaterThan(0);
  });

  it('has contact information with phone', () => {
    expect(STATION.contact.phone).toBeDefined();
    expect(STATION.contact.phone).toContain('919');
  });

  it('has contact information with SMS', () => {
    expect(STATION.contact.sms).toBeDefined();
    expect(STATION.contact.sms).toContain('919');
  });

  it('has social media links', () => {
    expect(STATION.socials.instagram).toBeDefined();
    expect(STATION.socials.twitter).toBeDefined();
  });

  it('has an optional logoUrl field', () => {
    expect(STATION.logoUrl === undefined || typeof STATION.logoUrl === 'string').toBe(true);
  });
});
