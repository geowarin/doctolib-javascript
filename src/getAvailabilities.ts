import knex from '../knexClient'
import {addDays} from 'date-fns';

interface Availability {
  date: Date
  slots: string[]
}

interface Event {
  kind: 'opening' | 'appointment'
  starts_at: Date
  ends_at: Date
  weekly_recurring?: boolean,
}

export default async function getAvailabilities(date: Date): Promise<Availability[]> {

  const openings = await knex<Event>('events')
    .where('kind', 'opening');

  for (const opening of openings) {
    console.log(opening.starts_at);
  }
  return Array.from({length: 7}, (v, i) => i)
    .map(n => ({
      date: addDays(date, n),
      slots: []
    }));
}
