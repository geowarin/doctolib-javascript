import knex from '../knexClient'

interface Availability {
  date: string
  slots: string[]
}

export default async function getAvailabilities(date: Date): Promise<Availability[]> {
  // knex.raw()
  return [];
}
