import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

const incomingRequestIdPattern = /^[a-zA-Z0-9_-]{8,80}$/

export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const incomingRequestId = request.header('x-request-id')
  const requestId =
    incomingRequestId && incomingRequestIdPattern.test(incomingRequestId)
      ? incomingRequestId
      : `req_${crypto.randomUUID()}`

  request.requestId = requestId
  response.setHeader('x-request-id', requestId)
  next()
}
