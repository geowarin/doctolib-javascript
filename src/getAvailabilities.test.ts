import knex from '../knexClient'
import getAvailabilities from './getAvailabilities'
import {formatISO} from 'date-fns';

describe('getAvailabilities', () => {
  beforeEach(() => knex('events').truncate());

  describe('empty week', () => {

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10')); // sunday

      expect(availabilities.map(a => formatISO(a.date, {representation: 'date'})))
        .toEqual(['2014-08-10', '2014-08-11', '2014-08-12', '2014-08-13', '2014-08-14', '2014-08-15', '2014-08-16']);

      expect(availabilities.flatMap(a => a.slots))
        .toEqual([]);
    });
  });

  describe('week with opening', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'),
          ends_at: new Date('2014-08-04 10:30'),
        }
      ])
    });

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-04'));

      expect(availabilities[0].slots)
        .toEqual(['09:30', '10:00']);

      // all other slots are empty
      expect(availabilities.slice(1).flatMap(a => a.slots))
        .toEqual([])
    });
  });

  describe('two openings on the same day', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:00'),
          ends_at: new Date('2014-08-04 10:00'),
        }, {
          kind: 'opening',
          starts_at: new Date('2014-08-04 14:00'),
          ends_at: new Date('2014-08-04 15:00'),
        }
      ])
    });

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-04'));

      expect(availabilities[0].slots)
        .toEqual(['09:00', '09:30', '14:00', '14:30']);
    });
  });

  describe('opening and appointments', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:00'),
          ends_at: new Date('2014-08-04 12:00'),
        }, {
          kind: 'appointment',
          starts_at: new Date('2014-08-04 10:30'),
          ends_at: new Date('2014-08-04 11:30')
        }
      ])
    });

    it('should subtract appointment from opening', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-04'));

      expect(availabilities[0].slots)
        .toEqual(['09:00', '09:30', '10:00', '11:30']);
    });
  });

  describe('recurring openings', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:00'),
          ends_at: new Date('2014-08-04 10:00'),
          weekly_recurring: true,
        }
      ])
    });

    it('should generate an opening the following week', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-11'));

      expect(availabilities[0].slots)
        .toEqual(['09:00', '09:30']);
    });
  });

  describe('simple case', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'), // monday
          ends_at: new Date('2014-08-04 12:30'),
          weekly_recurring: true,
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:30'),
        },
      ])
    });

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10')); // sunday
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10')),
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11')),
      );
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00',
      ]);

      expect(availabilities[2].slots).toEqual([]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2014-08-16')),
      )
    })
  })
});
