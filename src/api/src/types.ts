import type { Logger } from 'pino'
import type { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      log: Logger
      user?: {
        id: string
        role: UserRole
      }
    }
  }
}

export {}
