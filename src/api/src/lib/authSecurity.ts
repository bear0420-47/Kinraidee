import { UserRole } from '@prisma/client'
import argon2 from 'argon2'
import { jwtVerify, SignJWT } from 'jose'
import { z } from 'zod'

import { AUTH_JWT_ALGORITHM, AUTH_TOKEN_LIFETIME_SECONDS } from '@/config/auth'
import { env } from '@/config/env'

const authClaimsSchema = z.object({
  sub: z.string().min(1),
  role: z.nativeEnum(UserRole),
  iat: z.number().int(),
  exp: z.number().int(),
})

// A real Argon2id hash keeps unknown-email login work comparable to valid accounts.
export const AUTH_TIMING_SAFE_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$VjuBlUg0cMmjP66qRA79Dg$zvCPp4cWKyEacP3spP+sPQENFII+/6QF6fmHpQfEpt0'

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
