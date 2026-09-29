import { Prisma } from '@prisma/client'

function hasCode(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  )
}

export function isUniqueConstraintError(error: unknown) {
  return hasCode(error, 'P2002')
}

export function isForeignKeyConstraintError(error: unknown) {
  return hasCode(error, 'P2003')
}

export function isRecordNotFoundError(error: unknown) {
  return hasCode(error, 'P2025')
}

export function getUniqueConstraintFields(error: unknown): string[] {
  if (!isUniqueConstraintError(error)) return []
  const target = (error as Prisma.PrismaClientKnownRequestError).meta?.target
  return Array.isArray(target) ? target.map(String) : []
}
