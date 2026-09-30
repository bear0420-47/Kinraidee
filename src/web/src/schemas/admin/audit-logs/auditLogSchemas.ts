import type { components, paths } from '@/api/openapiTypes'

export type AuditLog =
  components['schemas']['AuditLogListEnvelope']['data']['items'][number]
export type AuditLogMeta = components['schemas']['AuditLogListEnvelope']['meta']
export type AuditLogFilters = NonNullable<
  paths['/api/audit-logs']['get']['parameters']['query']
>

export const auditEntityTypes = [
  'ZONE',
  'RESTAURANT',
  'FOOD_TYPE',
  'TASTE',
  'MENU_ITEM',
] as const

export const auditActions = ['CREATE', 'UPDATE', 'DELETE'] as const

export function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined
}
