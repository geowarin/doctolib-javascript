import knex from '../knexClient'
import {addDays, isSameDay, addMinutes, format} from 'date-fns';

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
  const startDate = date;
  const endDate = addDays(date, 7);

  const openings = await knex<Event>('events')
    .where('kind', 'opening')
    .where('starts_at', '>=', startDate)
    .where('ends_at', '<=', endDate)
  ;

  return Array.from({length: 7}, (v, i) => i)
    .map(n => {
      const currentDate = addDays(date, n);
      const opening = openings.find(o => isSameDay(o.starts_at, currentDate));

      if (opening == null) {
        return ({
          date: currentDate,
          slots: []
        });
      }

      return ({
        date: currentDate,
        slots: generateSlots(opening.starts_at, opening.ends_at)
      });
    });
}

function generateSlots(start: Date, end: Date): string[] {
  const slots = [];
  for (let date = start; date < end; date = addMinutes(date, 30)) {
    slots.push(format(date, 'HH:mm'))
  }
  return slots;
}
