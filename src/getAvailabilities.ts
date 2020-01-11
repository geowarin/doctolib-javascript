import knex from '../knexClient'
import {addDays, isSameDay, addMinutes, format, getDay} from 'date-fns';

interface Availability {
  date: Date
  slots: string[]
}

interface Event {
  kind: 'opening' | 'appointment'
  starts_at: Date
  ends_at: Date
  weekly_recurring: boolean,
}

export default async function getAvailabilities(date: Date): Promise<Availability[]> {
  const startDate = date;
  const endDate = addDays(date, 7);

  const openings = await knex<Event>('events')
    .where('kind', 'opening')
    .where('starts_at', '>=', startDate)
    .where('ends_at', '<=', endDate)
  ;
  const recurringOpening = await knex<Event>('events')
    .where('kind', 'opening')
    .where('weekly_recurring', true)
  ;
  const appointments = await knex<Event>('events')
    .where('kind', 'appointment')
    .where('starts_at', '>=', startDate)
    .where('ends_at', '<=', endDate)
  ;

  return Array.from({length: 7}, (v, i) => i)
    .map(n => {
      const currentDate = addDays(date, n);
      const dayOpenings = openings.filter(o => isSameDay(o.starts_at, currentDate));
      const dayRecurringOpenings = recurringOpening.filter(o => getDay(o.starts_at) == getDay(currentDate));
      const openingsOfTheDay = dayOpenings.concat(dayRecurringOpenings);

      const dayAppointments = appointments.filter(o => isSameDay(o.starts_at, currentDate));

      if (!openingsOfTheDay.length) {
        return ({
          date: currentDate,
          slots: []
        });
      }
      const openingSlots = generateSlotsFromEvents(openingsOfTheDay);
      const availableSlots = removeAppointments(openingSlots, dayAppointments);

      return ({
        date: currentDate,
        slots: availableSlots
      });
    });
}

function removeAppointments(openingSlots: string[], appointments: Event[]): string[] {
  const appointmentSlots = generateSlotsFromEvents(appointments);
  return openingSlots.filter(s => !appointmentSlots.includes(s));
}

function generateSlotsFromEvents(openings: Event[]): string[] {
  const slots = [];
  for (const opening of openings) {
    slots.push(...generateSlotsFromDates(opening.starts_at, opening.ends_at))
  }
  return slots;
}

function generateSlotsFromDates(start: Date, end: Date): string[] {
  const slots = [];
  for (let date = start; date < end; date = addMinutes(date, 30)) {
    slots.push(format(date, 'HH:mm'))
  }
  return slots;
}
