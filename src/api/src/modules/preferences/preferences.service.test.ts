import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Preference, PreferenceRow } from './preferences.dto'
import type { PreferencesRepository } from './preferences.repository'
import { createPreferencesService } from './preferences.service'

const repository = {
  find: vi.fn(),
  masterIdsExist: vi.fn(),
  upsert: vi.fn(),
  remove: vi.fn(),
} as unknown as PreferencesRepository

const service = createPreferencesService(repository)

// A zone record, food type not set, and taste saved as "any".
const preference: Preference = {
  budget: 'BETWEEN_50_100',
  zoneId: 'zone_1',
  foodTypeId: null,
  tasteId: 'ANY',
}
const row: PreferenceRow = {
  budget: 'BETWEEN_50_100',
  zoneId: 'zone_1',
  foodTypeId: null,
  tasteId: null,
  zoneAny: false,
  foodTypeAny: false,
  tasteAny: true,
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(repository.masterIdsExist).mockResolvedValue({
    zoneId: true,
    foodTypeId: true,
    tasteId: true,
  })
  // Echoes the stored row back, as the database does.
  vi.mocked(repository.upsert).mockImplementation(((
    _userId: string,
    saved: PreferenceRow,
  ) => Promise.resolve(saved)) as never)
})

describe('Preferences service', () => {
  it('returns null when the user has no preference', async () => {
    vi.mocked(repository.find).mockResolvedValue(null)

    await expect(service.get('user_1')).resolves.toBeNull()
    expect(repository.find).toHaveBeenCalledWith('user_1')
  })

  it('returns the saved preference, with "any" read back from its flag', async () => {
    vi.mocked(repository.find).mockResolvedValue(row)

    await expect(service.get('user_1')).resolves.toEqual(preference)
  })

  it('saves a full replacement, storing "any" as a flag and checking only record IDs', async () => {
    await expect(service.replace('user_1', preference)).resolves.toEqual(
      preference,
    )
    expect(repository.masterIdsExist).toHaveBeenCalledWith(row)
    expect(repository.upsert).toHaveBeenCalledWith('user_1', row)
  })

  it('names every unknown master-data ID and saves nothing', async () => {
    vi.mocked(repository.masterIdsExist).mockResolvedValue({
      zoneId: false,
      foodTypeId: true,
      tasteId: false,
    })

    await expect(service.replace('user_1', preference)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      fields: { zoneId: 'Unknown zone ID.', tasteId: 'Unknown taste ID.' },
    })
    expect(repository.upsert).not.toHaveBeenCalled()
  })

  it('reports a record deleted during the save as an unknown ID', async () => {
    vi.mocked(repository.upsert).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: 'P2003',
        clientVersion: 'test',
      }),
    )

    // Only the zone names a record; "any" and "not set" cannot be the missing one.
    await expect(service.replace('user_1', preference)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      fields: { zoneId: 'Unknown zone ID.' },
    })
  })

  it('passes any other save error through unchanged', async () => {
    const failure = new Error('connection lost')
    vi.mocked(repository.upsert).mockRejectedValue(failure)

    await expect(service.replace('user_1', preference)).rejects.toBe(failure)
  })

  it('clears the user preference', async () => {
    await service.clear('user_1')

    expect(repository.remove).toHaveBeenCalledWith('user_1')
  })
})
