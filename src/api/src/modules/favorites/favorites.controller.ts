import type { Request, RequestHandler } from 'express'

import { ok } from '@/shared/httpResponse'
import { parseFavoriteMenuItemId } from './favorites.dto'
import { favoritesService, type FavoritesService } from './favorites.service'

export type FavoritesController = {
  list: RequestHandler
  favorite: RequestHandler
  unfavorite: RequestHandler
  toggle: RequestHandler
}

// Every favorites route sits behind `requireAuth`, and the user always comes from the token.
function currentUserId(request: Request) {
  return request.user!.id
}

export function createFavoritesController(
  service: FavoritesService = favoritesService,
): FavoritesController {
  const list: RequestHandler = async (request, response) =>
    ok(response, { items: await service.list(currentUserId(request)) })

  const favorite: RequestHandler = async (request, response) =>
    ok(
      response,
      await service.favorite(
        currentUserId(request),
        parseFavoriteMenuItemId(request.params),
      ),
    )

  const unfavorite: RequestHandler = async (request, response) =>
    ok(
      response,
      await service.unfavorite(
        currentUserId(request),
        parseFavoriteMenuItemId(request.params),
      ),
    )

  const toggle: RequestHandler = async (request, response) =>
    ok(
      response,
      await service.toggle(
        currentUserId(request),
        parseFavoriteMenuItemId(request.params),
      ),
    )

  return { list, favorite, unfavorite, toggle }
}

export const favoritesController = createFavoritesController()
