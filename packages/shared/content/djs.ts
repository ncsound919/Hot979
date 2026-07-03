import { DjItem } from '../types';

export const DJS: DjItem[] = [
  {
    id: '1',
    name: 'DJ Jay Bee',
    show: 'Traffic Jam',
    bio: 'The Triangle\'s favorite DJ bringing you the best mixes.',
  }
];

export async function getDjs(): Promise<DjItem[]> {
  return Promise.resolve(DJS);
}
