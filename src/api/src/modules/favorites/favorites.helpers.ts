import { HttpError } from '@/shared/httpError'

export function menuItemUnavailableError() {
  return new HttpError({
    status: 409,
    code: 'MENU_ITEM_UNAVAILABLE',
    message: 'Menu item is no longer available.',
  })
}
