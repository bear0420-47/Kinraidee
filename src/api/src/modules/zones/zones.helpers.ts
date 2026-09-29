import {
  getUniqueConstraintFields,
  isForeignKeyConstraintError,
  isRecordNotFoundError,
  isUniqueConstraintError,
} from '@/lib/prismaErrors'
import { duplicateNameError } from '@/shared/duplicateNameError'
import { HttpError } from '@/shared/httpError'

export function zoneNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'ZONE_NOT_FOUND',
    message: 'Zone not found.',
  })
}

export function zoneInUseError() {
  return new HttpError({
    status: 409,
    code: 'ZONE_IN_USE',
    message: 'Reassign every restaurant in this zone before deleting it.',
  })
}

export function toZoneWriteError(error: unknown) {
  if (isUniqueConstraintError(error)) {
    return duplicateNameError(
      'ZONE_NAME_ALREADY_EXISTS',
      'zone',
      getUniqueConstraintFields(error),
    )
  }
  if (isForeignKeyConstraintError(error)) return zoneInUseError()
  if (isRecordNotFoundError(error)) return zoneNotFoundError()
  return error
}
