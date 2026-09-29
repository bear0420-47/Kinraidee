import {
  getUniqueConstraintFields,
  isForeignKeyConstraintError,
  isRecordNotFoundError,
  isUniqueConstraintError,
} from '@/lib/prismaErrors'
import { duplicateNameError } from '@/shared/duplicateNameError'
import { HttpError } from '@/shared/httpError'

export function foodTypeNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'FOOD_TYPE_NOT_FOUND',
    message: 'Food type not found.',
  })
}

export function foodTypeInUseError() {
  return new HttpError({
    status: 409,
    code: 'FOOD_TYPE_IN_USE',
    message:
      'Reassign every menu item using this food type before deleting it.',
  })
}

export function toFoodTypeWriteError(error: unknown) {
  if (isUniqueConstraintError(error)) {
    return duplicateNameError(
      'FOOD_TYPE_NAME_ALREADY_EXISTS',
      'food type',
      getUniqueConstraintFields(error),
    )
  }
  if (isForeignKeyConstraintError(error)) return foodTypeInUseError()
  if (isRecordNotFoundError(error)) return foodTypeNotFoundError()
  return error
}
