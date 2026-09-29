import type { AuditContext } from '@/shared/auditContext'
import { hasFieldChanges } from '@/shared/recordChanges'
import {
  toAdminTaste,
  toTasteCreateData,
  toTasteUpdateData,
  toPublicTaste,
  type CreateTasteInput,
  type UpdateTasteInput,
} from './tastes.dto'
import {
  tasteInUseError,
  tasteNotFoundError,
  toTasteWriteError,
} from './tastes.helpers'
import { tastesRepository, type TastesRepository } from './tastes.repository'

export function createTastesService(
  repository: TastesRepository = tastesRepository,
) {
  async function findOrThrow(id: string) {
    const taste = await repository.findById(id)
    if (!taste) throw tasteNotFoundError()
    return taste
  }

  return {
    async list() {
      return (await repository.list()).map(toPublicTaste)
    },

    async create(input: CreateTasteInput, audit: AuditContext) {
      try {
        return toAdminTaste(
          await repository.create(toTasteCreateData(input), audit),
        )
      } catch (error) {
        throw toTasteWriteError(error)
      }
    },

    async update(id: string, input: UpdateTasteInput, audit: AuditContext) {
      const taste = await findOrThrow(id)
      const data = toTasteUpdateData(input)

      // Skip the write so an unchanged save never produces a misleading audit entry.
      if (!hasFieldChanges(taste, data)) return toAdminTaste(taste)

      try {
        return toAdminTaste(await repository.update(id, data, audit))
      } catch (error) {
        throw toTasteWriteError(error)
      }
    },

    async delete(id: string, audit: AuditContext) {
      await findOrThrow(id)
      if ((await repository.countMenuItemLinks(id)) > 0) throw tasteInUseError()

      // The foreign-key restriction still guards a taste link added after the check.
      try {
        await repository.delete(id, audit)
      } catch (error) {
        throw toTasteWriteError(error)
      }
    },
  }
}

export const tastesService = createTastesService()

export type TastesService = ReturnType<typeof createTastesService>
