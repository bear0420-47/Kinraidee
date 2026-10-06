import type { Request, RequestHandler } from 'express'

import { noContent, ok } from '@/shared/httpResponse'
import { parsePreference } from './preferences.dto'
import {
  preferencesService,
  type PreferencesService,
} from './preferences.service'

export type PreferencesController = {
  get: RequestHandler
  replace: RequestHandler
  clear: RequestHandler
}

// Every preferences route sits behind `requireAuth`, and the user always comes from the token.
function currentUserId(request: Request) {
  return request.user!.id
}

export function createPreferencesController(
  service: PreferencesService = preferencesService,
): PreferencesController {
  const get: RequestHandler = async (request, response) =>
    ok(response, { preference: await service.get(currentUserId(request)) })

  const replace: RequestHandler = async (request, response) =>
    ok(response, {
      preference: await service.replace(
        currentUserId(request),
        parsePreference(request.body),
      ),
    })

  const clear: RequestHandler = async (request, response) => {
    await service.clear(currentUserId(request))
    return noContent(response)
  }

  return { get, replace, clear }
}

export const preferencesController = createPreferencesController()
