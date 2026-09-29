import { UserRole } from '@prisma/client'
import argon2 from 'argon2'
import type { CookieOptions } from 'express'
import { jwtVerify, SignJWT } from 'jose'
import { z } from 'zod'

import { env } from '@/config/env'
import { HttpError } from '@/shared/httpError'
import {
  AUTH_JWT_ALGORITHM,
  AUTH_TOKEN_LIFETIME_SECONDS,
} from './auth.constants'

export { AUTH_COOKIE_NAME } from './auth.constants'

const authClaimsSchema = z.object({
  sub: z.string().min(1),
  role: z.nativeEnum(UserRole),
  iat: z.number().int(),
  exp: z.number().int(),
})

export type AuthClaims = z.infer<typeof authClaimsSchema>

function getJwtSecret() {
  return new TextEncoder().encode(env.JWT_SECRET)
}

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: env.ARGON2_MEMORY_COST,
    timeCost: env.ARGON2_TIME_COST,
    parallelism: env.ARGON2_PARALLELISM,
  })
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password)
}

export async function signAuthToken(user: { id: string; role: UserRole }) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: AUTH_JWT_ALGORITHM })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_LIFETIME_SECONDS}s`)
    .sign(getJwtSecret())
}

export async function verifyAuthToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: [AUTH_JWT_ALGORITHM],
  })

  return authClaimsSchema.parse(payload)
}

export function getAuthCookieOptions(
  nodeEnv: 'development' | 'test' | 'production' = env.NODE_ENV,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    path: '/',
    maxAge: AUTH_TOKEN_LIFETIME_SECONDS * 1000,
  }
}

export function getAuthCookieClearOptions(
  nodeEnv: 'development' | 'test' | 'production' = env.NODE_ENV,
): CookieOptions {
  const { maxAge: _ignored, ...options } = getAuthCookieOptions(nodeEnv)
  return options
}

export function unauthenticatedError() {
  return new HttpError({
    status: 401,
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
  })
}
