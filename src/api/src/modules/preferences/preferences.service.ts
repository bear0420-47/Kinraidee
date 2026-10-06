import { isForeignKeyConstraintError } from '@/lib/prismaErrors'
import {
  masterIdFields,
  toPreference,
  toPreferenceRow,
  type Preference,
} from './preferences.dto'
import { unknownMasterIdsError } from './preferences.helpers'
import {
  preferencesRepository,
  type PreferencesRepository,
} from './preferences.repository'

export function createPreferencesService(
  repository: PreferencesRepository = preferencesRepository,
) {
  return {
    async get(userId: string) {
      const row = await repository.find(userId)
      return row ? toPreference(row) : null
    },

    async replace(userId: string, preference: Preference) {
      const row = toPreferenceRow(preference)
      const found = await repository.masterIdsExist(row)
      const unknown = masterIdFields.filter((field) => !found[field])
      if (unknown.length > 0) throw unknownMasterIdsError(unknown)

      try {
        return toPreference(await repository.upsert(userId, row))
      } catch (error) {
        // A record deleted between the check and the write fails its foreign key.
        if (isForeignKeyConstraintError(error)) {
          throw unknownMasterIdsError(
            masterIdFields.filter((field) => row[field] !== null),
          )
        }
        throw error
      }
    },

    async clear(userId: string) {
      await repository.remove(userId)
    },
  }
}

export type PreferencesService = ReturnType<typeof createPreferencesService>

export const preferencesService = createPreferencesService()
