import type { AuditContext } from '@/shared/auditContext'
import { hasFieldChanges } from '@/shared/recordChanges'
import {
  toAdminFoodType,
  toFoodTypeCreateData,
  toFoodTypeUpdateData,
  toPublicFoodType,
  type CreateFoodTypeInput,
  type UpdateFoodTypeInput,
} from './food-types.dto'
import {
  foodTypeInUseError,
  foodTypeNotFoundError,
  toFoodTypeWriteError,
} from './food-types.helpers'
import {
  foodTypesRepository,
  type FoodTypesRepository,
} from './food-types.repository'

export function createFoodTypesService(
  repository: FoodTypesRepository = foodTypesRepository,
) {
  async function findOrThrow(id: string) {
    const foodType = await repository.findById(id)
    if (!foodType) throw foodTypeNotFoundError()
    return foodType
  }

  return {
    async list() {
      return (await repository.list()).map(toPublicFoodType)
    },

    async create(input: CreateFoodTypeInput, audit: AuditContext) {
      try {
        return toAdminFoodType(
          await repository.create(toFoodTypeCreateData(input), audit),
        )
      } catch (error) {
        throw toFoodTypeWriteError(error)
      }
    },

    async update(id: string, input: UpdateFoodTypeInput, audit: AuditContext) {
      const foodType = await findOrThrow(id)
      const data = toFoodTypeUpdateData(input)

      // Skip the write so an unchanged save never produces a misleading audit entry.
      if (!hasFieldChanges(foodType, data)) return toAdminFoodType(foodType)

      try {
        return toAdminFoodType(await repository.update(id, data, audit))
      } catch (error) {
        throw toFoodTypeWriteError(error)
      }
    },

    async delete(id: string, audit: AuditContext) {
      await findOrThrow(id)
      if ((await repository.countMenuItems(id)) > 0) throw foodTypeInUseError()

      // The foreign-key restriction still guards a menu item added after the check.
      try {
        await repository.delete(id, audit)
      } catch (error) {
        throw toFoodTypeWriteError(error)
      }
    },
  }
}

export const foodTypesService = createFoodTypesService()

export type FoodTypesService = ReturnType<typeof createFoodTypesService>
