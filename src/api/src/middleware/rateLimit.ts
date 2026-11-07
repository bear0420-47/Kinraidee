import type { Request, RequestHandler } from 'express'

import { HttpError } from '@/shared/httpError'

type RateLimitWindow = { count: number; resetAt: number }

export type RateLimitOptions = {
  // Short label kept in the key so separate limiters never share counters.
  name: string
  windowMs: number
  max: number
  // Returns the client key to count, or null to skip counting this request.
  key?: (request: Request) => string | null
  now?: () => number
}

// Above this many tracked keys, expired windows are pruned; past the hard cap the
// store is cleared, so a flood of distinct keys cannot grow memory without bound.
const PRUNE_THRESHOLD = 10_000
const HARD_CAP = 50_000

export function clientIpKey(request: Request) {
  return request.ip ?? request.socket.remoteAddress ?? 'unknown'
}

// Fixed-window, in-memory limiter for one API process. It slows brute force and
// paid-provider abuse; a multi-instance deployment would need a shared store.
export function createRateLimit({
  name,
  windowMs,
  max,
  key = clientIpKey,
  now = Date.now,
}: RateLimitOptions): RequestHandler {
  const windows = new Map<string, RateLimitWindow>()
  let nextPruneAt = 0

  // The full scan runs at most once per window, so many live keys cannot turn
  // every request into a scan of the whole store.
  function prune(currentTime: number) {
    if (windows.size >= HARD_CAP) {
      windows.clear()
      return
    }
    if (windows.size < PRUNE_THRESHOLD || currentTime < nextPruneAt) return

    nextPruneAt = currentTime + windowMs
    for (const [storedKey, window] of windows) {
      if (window.resetAt <= currentTime) windows.delete(storedKey)
    }
  }

  return (request, response, next) => {
    const clientKey = key(request)
    if (clientKey === null) return next()

    const currentTime = now()
    prune(currentTime)

    const storeKey = `${name}:${clientKey}`
    let window = windows.get(storeKey)
    if (!window || window.resetAt <= currentTime) {
      window = { count: 0, resetAt: currentTime + windowMs }
      windows.set(storeKey, window)
    }
    window.count += 1

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((window.resetAt - currentTime) / 1000),
    )
    response.setHeader('RateLimit-Limit', String(max))
    response.setHeader(
      'RateLimit-Remaining',
      String(Math.max(0, max - window.count)),
    )
    response.setHeader('RateLimit-Reset', String(retryAfterSeconds))

    if (window.count > max) {
      response.setHeader('Retry-After', String(retryAfterSeconds))
      throw new HttpError({
        status: 429,
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      })
    }

    return next()
  }
}

// Counts login attempts per account as well as per IP, so one address cannot be
// tried from many IPs without limit. Requests without an email are not counted here.
export function loginEmailKey(request: Request) {
  const email: unknown = request.body?.email
  if (typeof email !== 'string') return null
  const normalized = email.trim().toLowerCase().slice(0, 254)
  return normalized || null
}
