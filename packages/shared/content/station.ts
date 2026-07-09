import { StationConfig } from '../types';

export const STATION: StationConfig = {
  callsign: 'WAUG / W250AZ',
  frequency: '97.9',
  name: 'HOT 97.9',
  tagline: "The Triangle's #1 for Hip-Hop & R&B",
  // TODO: Replace with your actual stream URL from your streaming host (e.g. Azuracast, Icecast, etc.)
  streamUrl: 'https://YOUR-STREAM-DOMAIN.example.com/hot979-stream',
  logoUrl: '/icons/icon-192.png',
  promoMessage: "The Triangle's #1 for Hip-Hop & R&B — HOT 97.9",
  contact: {
    phone: '919-979-9799',
    sms: '919-979-9799',
  },
  socials: {
    instagram: '@hot979nc',
    twitter: '@hot979nc',
  },
};
