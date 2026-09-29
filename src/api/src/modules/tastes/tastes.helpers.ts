import {
  getUniqueConstraintFields,
  isForeignKeyConstraintError,
  isRecordNotFoundError,
  isUniqueConstraintError,
} from '@/lib/prismaErrors'
import { duplicateNameError } from '@/shared/duplicateNameError'
import { HttpError } from '@/shared/httpError'

export function tasteNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'TASTE_NOT_FOUND',
    message: 'Taste not found.',
  })
}

export function tasteInUseError() {
  return new HttpError({
    status: 409,
    code: 'TASTE_IN_USE',
    message:
      'Remove or change this taste on every menu item before deleting it.',
  })
}

export function toTasteWriteError(error: unknown) {
  if (isUniqueConstraintError(error)) {
    return duplicateNameError(
      'TASTE_NAME_ALREADY_EXISTS',
      'taste',
      getUniqueConstraintFields(error),
    )
  }
  if (isForeignKeyConstraintError(error)) return tasteInUseError()
  if (isRecordNotFoundError(error)) return tasteNotFoundError()
  return error
}
