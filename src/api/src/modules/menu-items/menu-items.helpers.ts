import {
  isForeignKeyConstraintError,
  isRecordNotFoundError,
} from '@/lib/prismaErrors'
import { HttpError } from '@/shared/httpError'

export function menuItemNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'MENU_ITEM_NOT_FOUND',
    message: 'Menu item not found.',
  })
}

export function menuItemRestaurantNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'RESTAURANT_NOT_FOUND',
    message: 'Restaurant not found.',
    fields: { restaurantId: 'Restaurant not found.' },
  })
}

export function menuItemRestaurantDeletedError() {
  return new HttpError({
    status: 409,
    code: 'RESTAURANT_DELETED',
    message: 'The Restaurant is deleted.',
    fields: { restaurantId: 'Choose an active Restaurant.' },
  })
}

export function menuItemFoodTypeNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'FOOD_TYPE_NOT_FOUND',
    message: 'Food type not found.',
    fields: { foodTypeId: 'Food type not found.' },
  })
}

export function menuItemTastesNotFoundError() {
  return new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields: { tasteIds: 'Every Taste must exist.' },
  })
}

export function unknownBulkMenuItemsError() {
  return new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields: { ids: 'Every MenuItem ID must exist.' },
  })
}

export function toMenuItemWriteError(error: unknown) {
  if (isRecordNotFoundError(error)) return menuItemNotFoundError()
  if (isForeignKeyConstraintError(error)) {
    return new HttpError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'A referenced catalog record no longer exists.',
    })
  }
  return error
}
