import { type FormEvent, useState } from 'react'

import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import { useAuditLogs } from '@/hooks/admin/audit-logs/useAuditLogs'
import {
  auditActionLabels,
  auditActions,
  auditEntityTypeLabels,
  auditEntityTypes,
  type AuditLogFilters,
  toIsoDateTime,
} from '@/schemas/admin/audit-logs/auditLogSchemas'
import { AuditLogTable } from './components/AuditLogTable'

const defaultFilters: AuditLogFilters = { page: 1, pageSize: 20 }

function optionalValue(data: FormData, name: string) {
  const value = String(data.get(name) ?? '').trim()
  return value || undefined
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>(defaultFilters)
  const query = useAuditLogs(filters)

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const entityType = optionalValue(data, 'entityType') as
      AuditLogFilters['entityType'] | undefined
    const action = optionalValue(data, 'action') as
      AuditLogFilters['action'] | undefined
    const actorId = optionalValue(data, 'actorId')
    const entityId = optionalValue(data, 'entityId')
    const requestId = optionalValue(data, 'requestId')
    const createdFrom = toIsoDateTime(String(data.get('createdFrom') ?? ''))
    const createdTo = toIsoDateTime(String(data.get('createdTo') ?? ''))
    setFilters({
      page: 1,
      pageSize: Number(data.get('pageSize')),
      ...(entityType ? { entityType } : {}),
      ...(action ? { action } : {}),
      ...(actorId ? { actorId } : {}),
      ...(entityId ? { entityId } : {}),
      ...(requestId ? { requestId } : {}),
      ...(createdFrom ? { createdFrom } : {}),
      ...(createdTo ? { createdTo } : {}),
    })
  }

  const meta = query.data?.meta
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1

  return (
    <PageShell
      title="บันทึกการแก้ไขระบบ"
      description="ตรวจสอบการเปลี่ยนแปลงข้อมูลที่ผู้ดูแลระบบดำเนินการ"
      width="wide"
    >
      <div className="grid gap-2 rounded-sm border-2 border-paper bg-cream p-4 text-small">
        <p>
          บันทึกนี้เป็น application audit log ไม่ใช่ traffic log
          ตามกฎหมายคอมพิวเตอร์
        </p>
        <p>ระบบเก็บบันทึกนี้ 180 วันตาม retention policy</p>
      </div>

      <form
        className="grid gap-4 rounded-lg border-2 border-line-soft bg-canvas-soft p-4 md:grid-cols-2 lg:grid-cols-4"
        onSubmit={applyFilters}
      >
        <SelectField
          id="audit-entity-type"
          name="entityType"
          label="ประเภทข้อมูล"
          defaultValue=""
        >
          <option value="">ทั้งหมด</option>
          {auditEntityTypes.map((value) => (
            <option key={value} value={value}>
              {auditEntityTypeLabels[value]}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="audit-action"
          name="action"
          label="การทำงาน"
          defaultValue=""
        >
          <option value="">ทั้งหมด</option>
          {auditActions.map((value) => (
            <option key={value} value={value}>
              {auditActionLabels[value]}
            </option>
          ))}
        </SelectField>
        <TextField id="audit-actor-id" name="actorId" label="Actor ID" />
        <TextField id="audit-entity-id" name="entityId" label="Entity ID" />
        <TextField id="audit-request-id" name="requestId" label="Request ID" />
        <TextField
          id="audit-created-from"
          name="createdFrom"
          type="datetime-local"
          label="ตั้งแต่เวลา"
        />
        <TextField
          id="audit-created-to"
          name="createdTo"
          type="datetime-local"
          label="ถึงเวลา"
        />
        <SelectField
          id="audit-page-size"
          name="pageSize"
          label="จำนวนต่อหน้า"
          defaultValue="20"
        >
          {[10, 20, 50, 100].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </SelectField>
        <div className="flex items-end gap-3 md:col-span-2 lg:col-span-4">
          <Button type="submit">กรองรายการ</Button>
          <Button
            variant="ghost"
            type="reset"
            onClick={() => setFilters(defaultFilters)}
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </form>

      {query.isPending ? <p role="status">กำลังโหลดบันทึก…</p> : null}
      {query.isError ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="font-bold text-rust">
            โหลดบันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
          <Button variant="secondary" onClick={() => void query.refetch()}>
            ลองใหม่
          </Button>
        </div>
      ) : null}
      {query.data && query.data.data.items.length === 0 ? (
        <p className="rounded-sm border-2 border-line-soft p-6 text-center font-bold text-muted">
          ยังไม่มีบันทึกการแก้ไข
        </p>
      ) : null}
      {query.data && query.data.data.items.length > 0 ? (
        <AuditLogTable items={query.data.data.items} />
      ) : null}

      {meta ? (
        <nav
          aria-label="หน้ารายการบันทึก"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-small text-muted" role="status" aria-live="polite">
            หน้า {meta.page} จาก {lastPage} · ทั้งหมด {meta.total} รายการ
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(1, meta.page - 1),
                }))
              }
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="secondary"
              disabled={meta.page >= lastPage}
              onClick={() =>
                setFilters((current) => ({ ...current, page: meta.page + 1 }))
              }
            >
              ถัดไป
            </Button>
          </div>
        </nav>
      ) : null}
    </PageShell>
  )
}
