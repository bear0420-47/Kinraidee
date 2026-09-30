import { AuditAction, AuditEntityType, Prisma } from '@prisma/client'
import { z } from 'zod'

import {
  optionalTrimmedStringSchema,
  parseWithSchema,
} from '@/shared/validation'

export const auditLogListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    entityType: z.enum(AuditEntityType).optional(),
    action: z.enum(AuditAction).optional(),
    actorId: optionalTrimmedStringSchema,
    entityId: optionalTrimmedStringSchema,
    requestId: optionalTrimmedStringSchema,
    createdFrom: z.iso.datetime({ offset: true }).optional(),
    createdTo: z.iso.datetime({ offset: true }).optional(),
  })
  .strict()
  .refine(
    ({ createdFrom, createdTo }) =>
      !createdFrom ||
      !createdTo ||
      new Date(createdFrom).getTime() <= new Date(createdTo).getTime(),
    { path: ['createdTo'], message: 'Must not be before createdFrom.' },
  )

const auditJsonSchema = z.unknown().nullable()

export const auditLogSchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  action: z.enum(AuditAction),
  entityType: z.enum(AuditEntityType),
  entityId: z.string(),
  before: auditJsonSchema,
  after: auditJsonSchema,
  requestId: z.string(),
  createdAt: z.iso.datetime(),
})

export const auditLogListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(auditLogSchema) }),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    total: z.number().int().nonnegative(),
  }),
})

export type AuditLogListQuery = z.output<typeof auditLogListQuerySchema>
export type AuditLogRecord = {
  id: string
  actorId: string | null
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  before: Prisma.JsonValue | null
  after: Prisma.JsonValue | null
  requestId: string
  createdAt: Date
}

export function parseAuditLogListQuery(input: unknown) {
  return parseWithSchema(auditLogListQuerySchema, input)
}
