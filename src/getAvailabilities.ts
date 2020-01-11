import knex from '../knexClient'
import {addDays, formatISO} from 'date-fns';

interface Availability {
  date: Date
  slots: string[]
}

export default async function getAvailabilities(date: Date): Promise<Availability[]> {
  // knex.raw()

  return Array.from({ length: 7 }, (v, i) => i)
    .map(n => ({
      date: addDays(date, n),
      slots: []
    }));
}
