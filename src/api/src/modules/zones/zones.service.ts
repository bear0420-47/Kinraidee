import type { AuditContext } from '@/shared/auditContext'
import { hasFieldChanges } from '@/shared/recordChanges'
import {
  toAdminZone,
  toPublicZone,
  toZoneCreateData,
  toZoneUpdateData,
  type CreateZoneInput,
  type UpdateZoneInput,
} from './zones.dto'
import {
  toZoneWriteError,
  zoneInUseError,
  zoneNotFoundError,
} from './zones.helpers'
import { zonesRepository, type ZonesRepository } from './zones.repository'

export function createZonesService(
  repository: ZonesRepository = zonesRepository,
) {
  async function findOrThrow(id: string) {
    const zone = await repository.findById(id)
    if (!zone) throw zoneNotFoundError()
    return zone
  }

  return {
    async list() {
      return (await repository.list()).map(toPublicZone)
    },

    async create(input: CreateZoneInput, audit: AuditContext) {
      try {
        return toAdminZone(
          await repository.create(toZoneCreateData(input), audit),
        )
      } catch (error) {
        throw toZoneWriteError(error)
      }
    },

    async update(id: string, input: UpdateZoneInput, audit: AuditContext) {
      const zone = await findOrThrow(id)
      const data = toZoneUpdateData(input)

      // Skip the write so an unchanged save never produces a misleading audit entry.
      if (!hasFieldChanges(zone, data)) return toAdminZone(zone)

      try {
        return toAdminZone(await repository.update(id, data, audit))
      } catch (error) {
        throw toZoneWriteError(error)
      }
    },

    async delete(id: string, audit: AuditContext) {
      await findOrThrow(id)
      if ((await repository.countRestaurants(id)) > 0) throw zoneInUseError()

      // The foreign-key restriction still guards a restaurant added after the check.
      try {
        await repository.delete(id, audit)
      } catch (error) {
        throw toZoneWriteError(error)
      }
    },
  }
}

export const zonesService = createZonesService()

export type ZonesService = ReturnType<typeof createZonesService>
