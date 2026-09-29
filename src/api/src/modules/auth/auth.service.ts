import { HttpError } from '@/shared/httpError'
import type { AuthCredentials, AuthUser } from './auth.dto'
import { toAuthUser } from './auth.dto'
import {
  hashPassword,
  signAuthToken,
  unauthenticatedError,
  verifyPassword,
} from './auth.helpers'
import {
  authRepository,
  DuplicateEmailError,
  type AuthRepository,
} from './auth.repository'

type AuthServiceDependencies = {
  repository: AuthRepository
  hashPassword: typeof hashPassword
  verifyPassword: typeof verifyPassword
  signAuthToken: typeof signAuthToken
}

export type AuthResult = {
  user: AuthUser
  token: string
}

export function createAuthService(
  dependencies: AuthServiceDependencies = {
    repository: authRepository,
    hashPassword,
    verifyPassword,
    signAuthToken,
  },
) {
  return {
    async register(credentials: AuthCredentials): Promise<AuthResult> {
      if (await dependencies.repository.findByEmail(credentials.email)) {
        throw duplicateEmailError()
      }

      const password = await dependencies.hashPassword(credentials.password)

      try {
        const user = await dependencies.repository.createUser(
          credentials.email,
          password,
        )

        return {
          user: toAuthUser(user),
          token: await dependencies.signAuthToken(user),
        }
      } catch (error) {
        if (error instanceof DuplicateEmailError) throw duplicateEmailError()
        throw error
      }
    },

    async login(credentials: AuthCredentials): Promise<AuthResult> {
      const user = await dependencies.repository.findByEmail(credentials.email)
      const passwordMatches = user
        ? await dependencies.verifyPassword(user.password, credentials.password)
        : false

      if (!user || !passwordMatches) throw unauthenticatedError()

      return {
        user: toAuthUser(user),
        token: await dependencies.signAuthToken(user),
      }
    },

    async getCurrentUser(userId: string): Promise<AuthUser> {
      const user = await dependencies.repository.findById(userId)
      if (!user) throw unauthenticatedError()
      return toAuthUser(user)
    },
  }
}

function duplicateEmailError() {
  return new HttpError({
    status: 409,
    code: 'EMAIL_ALREADY_REGISTERED',
    message: 'Email is already registered.',
  })
}

export const authService = createAuthService()

export type AuthService = ReturnType<typeof createAuthService>
