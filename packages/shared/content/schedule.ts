import { ScheduleItem } from '../types';

export const SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '06:00 AM', title: 'Morning Mix', dj: 'DJ Jay Bee' },
  { id: '2', time: '10:00 AM', title: 'Midday Motivation', dj: 'DJ Skillz' },
  { id: '3', time: '03:00 PM', title: 'The Hangova Show', dj: 'DJ Hangova' },
  { id: '4', time: '07:00 PM', title: 'Traffic Jam', dj: 'DJ Jay Bee' },
  { id: '5', time: '10:00 PM', title: 'Late Night Vibes', dj: 'Various' },
];

export async function getSchedule(): Promise<ScheduleItem[]> {
  // In the future this could fetch from a real API
  return Promise.resolve(SCHEDULE);
}
