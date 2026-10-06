import { HttpError } from '@/shared/httpError'
import type { MasterIdField } from './preferences.dto'

const unknownIdMessages: Record<MasterIdField, string> = {
  zoneId: 'Unknown zone ID.',
  foodTypeId: 'Unknown food type ID.',
  tasteId: 'Unknown taste ID.',
}

export function unknownMasterIdsError(fields: MasterIdField[]) {
  return new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields: Object.fromEntries(
      fields.map((field) => [field, unknownIdMessages[field]]),
    ),
  })
}
