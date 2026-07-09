export interface StationConfig {
  callsign: string;
  frequency: string;
  name: string;
  tagline: string;
  streamUrl: string;
  logoUrl?: string;
  promoMessage?: string;
  contact: {
    phone: string;
    sms: string;
  };
  socials: {
    instagram: string;
    twitter: string;
  };
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  dj: string;
}

export interface EventItem {
  id: string;
  date: string;
  title: string;
  location: string;
  description: string;
}

export interface DjItem {
  id: string;
  name: string;
  show: string;
  bio: string;
}
