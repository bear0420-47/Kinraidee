import type { UserRole } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { AUTH_COOKIE_NAME } from '@/config/auth'
import { type AuthClaims, verifyAuthToken } from '@/lib/authSecurity'
import { prisma } from '@/lib/prisma'
import { unauthenticatedError } from '@/modules/auth/auth.helpers'

type SessionUser = { id: string; role: UserRole }
export type SessionUserLookup = (
  claims: AuthClaims,
) => Promise<SessionUser | null>

// The token proves who signed in; the database decides whether that account still
// exists and which role it has now, so a deleted account or a demoted admin loses
// access immediately instead of when the 7-day token expires.
const databaseSessionUserLookup: SessionUserLookup = (claims) =>
  prisma.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, role: true },
  })

let lookupSessionUser: SessionUserLookup = databaseSessionUserLookup

// Route tests have no database; they swap in a lookup that trusts the signed claims.
export function setSessionUserLookupForTests(lookup?: SessionUserLookup) {
  lookupSessionUser = lookup ?? databaseSessionUserLookup
}

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const token = request.cookies?.[AUTH_COOKIE_NAME]
  if (typeof token !== 'string' || !token) throw unauthenticatedError()

  let claims
  try {
    claims = await verifyAuthToken(token)
  } catch {
    throw unauthenticatedError()
  }

  const user = await lookupSessionUser(claims)
  if (!user) throw unauthenticatedError()

  request.user = { id: user.id, role: user.role }
  return next()
}
