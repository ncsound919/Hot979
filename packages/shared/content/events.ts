import { EventItem } from '../types';

export const EVENTS: EventItem[] = [
  {
    id: '1',
    date: 'OCT 24',
    title: 'Raleigh Hip Hop Showcase',
    location: 'Lincoln Theatre, Raleigh',
    description: 'Ticket giveaway! Tune in at 5PM to win VIP access.',
  },
  {
    id: '2',
    date: 'OCT 31',
    title: 'Halloween Block Party',
    location: 'Downtown Durham',
    description: 'Live broadcast with DJ Jay Bee. Costumes, contests, and classic cuts.',
  },
  {
    id: '3',
    date: 'NOV 15',
    title: 'R&B Under the Stars',
    location: 'Red Hat Amphitheater',
    description: 'Win front row tickets all week during The Hangova Show.',
  },
];

export async function getEvents(): Promise<EventItem[]> {
  return Promise.resolve(EVENTS);
}
