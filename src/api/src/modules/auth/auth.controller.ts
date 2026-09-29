import type { RequestHandler } from 'express'

import { created, noContent, ok } from '@/shared/httpResponse'
import { parseAuthCredentials } from './auth.dto'
import {
  AUTH_COOKIE_NAME,
  getAuthCookieClearOptions,
  getAuthCookieOptions,
} from './auth.helpers'
import { authService, type AuthService } from './auth.service'

export type AuthController = {
  register: RequestHandler
  login: RequestHandler
  logout: RequestHandler
  me: RequestHandler
}

export function createAuthController(
  service: AuthService = authService,
): AuthController {
  const register: RequestHandler = async (request, response) => {
    const result = await service.register(parseAuthCredentials(request.body))
    response.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions())
    return created(response, { user: result.user })
  }

  const login: RequestHandler = async (request, response) => {
    const result = await service.login(parseAuthCredentials(request.body))
    response.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions())
    return ok(response, { user: result.user })
  }

  const logout: RequestHandler = (_request, response) => {
    response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieClearOptions())
    return noContent(response)
  }

  const me: RequestHandler = async (request, response) => {
    const user = await service.getCurrentUser(request.user!.id)
    return ok(response, { user })
  }

  return { register, login, logout, me }
}

export const authController: AuthController = createAuthController()
