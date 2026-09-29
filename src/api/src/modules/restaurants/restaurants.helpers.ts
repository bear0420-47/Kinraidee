import {
  isForeignKeyConstraintError,
  isRecordNotFoundError,
} from '@/lib/prismaErrors'
import { HttpError } from '@/shared/httpError'

export function restaurantNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'RESTAURANT_NOT_FOUND',
    message: 'Restaurant not found.',
  })
}

export function restaurantZoneNotFoundError() {
  return new HttpError({
    status: 404,
    code: 'ZONE_NOT_FOUND',
    message: 'Zone not found.',
    fields: { zoneId: 'Zone not found.' },
  })
}

export function toRestaurantWriteError(error: unknown) {
  if (isForeignKeyConstraintError(error)) return restaurantZoneNotFoundError()
  if (isRecordNotFoundError(error)) return restaurantNotFoundError()
  return error
}
