import type { RequestHandler } from 'express'

import { HttpError } from '@/shared/httpError'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Defence in depth against cross-site request forgery on top of the SameSite=Lax
// session cookie: a browser always sends Origin on cross-site writes, so any write
// from an origin outside the CORS allowlist is refused before it reaches a route.
// Requests with no Origin (curl, server-to-server, same-origin GET forms) still pass
// unless the browser marks them cross-site.
export function createRequireTrustedOrigin(
  allowedOrigins: readonly string[],
): RequestHandler {
  const allowed = new Set(allowedOrigins)

  return (request, _response, next) => {
    if (SAFE_METHODS.has(request.method)) return next()

    const origin = request.get('origin')
    const trusted = origin
      ? allowed.has(origin)
      : request.get('sec-fetch-site') !== 'cross-site'

    if (!trusted) {
      throw new HttpError({
        status: 403,
        code: 'ORIGIN_NOT_ALLOWED',
        message: 'Request origin is not allowed.',
      })
    }

    return next()
  }
}
