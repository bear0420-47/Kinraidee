import {
  getUniqueConstraintFields,
  isForeignKeyConstraintError,
  isRecordNotFoundError,
  isUniqueConstraintError,
} from '@/lib/prismaErrors'
import { HttpError } from '@/shared/httpError'

const NAME_FIELDS: Record<string, string> = {
  nameTh: 'name.th',
  nameEn: 'name.en',
}

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

export function zoneNameTakenError(columns: string[]) {
  const fields = columns.flatMap((column) =>
    NAME_FIELDS[column] ? [NAME_FIELDS[column]] : [],
  )

  return new HttpError({
    status: 409,
    code: 'ZONE_NAME_ALREADY_EXISTS',
    message: 'Another zone already uses this name.',
    fields: Object.fromEntries(
      (fields.length > 0 ? fields : ['name']).map((field) => [
        field,
        'Already used by another zone.',
      ]),
    ),
  })
}

export function toZoneWriteError(error: unknown) {
  if (isUniqueConstraintError(error)) {
    return zoneNameTakenError(getUniqueConstraintFields(error))
  }
  if (isForeignKeyConstraintError(error)) return zoneInUseError()
  if (isRecordNotFoundError(error)) return zoneNotFoundError()
  return error
}
