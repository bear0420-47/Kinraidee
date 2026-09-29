import { ArrowLeft, Plus } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PageShell } from '@/components/PageShell'
import {
  useCreateZone,
  useDeleteZone,
  useUpdateZone,
  useZones,
} from '@/hooks/admin/zones/useZones'
import {
  getZoneChanges,
  type CreateZoneBody,
  type Zone,
} from '@/schemas/admin/zones/zoneSchemas'
import { DeleteZoneDialog } from './components/DeleteZoneDialog'
import { ZoneForm } from './components/ZoneForm'
import { ZoneTable } from './components/ZoneTable'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; zone: Zone }
  | { mode: 'delete'; zone: Zone }

export function ZonesPage() {
  const zones = useZones()
  const createZone = useCreateZone()
  const updateZone = useUpdateZone()
  const deleteZone = useDeleteZone()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [notice, setNotice] = useState('')
  const createButtonRef = useRef<HTMLButtonElement>(null)

  function openDialog(next: DialogState) {
    setNotice('')
    setDialog(next)
  }

  function finish(message: string) {
    setDialog(null)
    setNotice(message)
  }

  async function submitCreate(body: CreateZoneBody) {
    await createZone.mutateAsync(body)
    finish(`เพิ่มโซน ${body.name.th} แล้ว`)
  }

  async function submitEdit(zone: Zone, body: CreateZoneBody) {
    const changes = getZoneChanges(zone, body)
    if (changes) await updateZone.mutateAsync({ id: zone.id, body: changes })
    finish(
      changes
        ? `บันทึกการแก้ไขโซน ${body.name.th} แล้ว`
        : 'ไม่มีข้อมูลที่เปลี่ยนแปลง',
    )
  }

  async function confirmDelete(zone: Zone) {
    await deleteZone.mutateAsync(zone.id)
    finish(`ลบโซน ${zone.name.th} แล้ว`)
  }

  const closeDialog = () => setDialog(null)

  return (
    <PageShell title="จัดการโซน" width="wide">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 self-start rounded-xs font-bold underline"
      >
        <ArrowLeft aria-hidden weight="bold" />
        กลับไปหน้าจัดการระบบ
      </Link>
      <p className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-3 text-small">
        ตัวเลือก “ที่ไหนก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู
        ไม่ต้องสร้างเป็นโซน
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="font-bold">
          {notice}
        </p>
        <Button
          ref={createButtonRef}
          onClick={() => openDialog({ mode: 'create' })}
        >
          <Plus aria-hidden weight="bold" />
          เพิ่มโซน
        </Button>
      </div>

      {zones.isPending ? (
        <p role="status">กำลังโหลดโซน…</p>
      ) : zones.isError ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="font-bold text-rust">
            โหลดรายการโซนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
          <Button variant="secondary" onClick={() => void zones.refetch()}>
            ลองใหม่
          </Button>
        </div>
      ) : zones.data.length === 0 ? (
        <p className="rounded-sm border-2 border-line-soft p-6 text-center font-bold text-muted">
          ยังไม่มีโซน
        </p>
      ) : (
        <ZoneTable
          zones={zones.data}
          onEdit={(zone) => openDialog({ mode: 'edit', zone })}
          onDelete={(zone) => openDialog({ mode: 'delete', zone })}
        />
      )}

      {dialog?.mode === 'create' ? (
        <Dialog title="เพิ่มโซน" onClose={closeDialog}>
          <ZoneForm
            submitLabel="เพิ่มโซน"
            onSubmit={submitCreate}
            onCancel={closeDialog}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'edit' ? (
        <Dialog title="แก้ไขโซน" onClose={closeDialog}>
          <ZoneForm
            zone={dialog.zone}
            submitLabel="บันทึกการแก้ไข"
            onSubmit={(body) => submitEdit(dialog.zone, body)}
            onCancel={closeDialog}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'delete' ? (
        <DeleteZoneDialog
          zone={dialog.zone}
          onConfirm={() => confirmDelete(dialog.zone)}
          onClose={closeDialog}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
    </PageShell>
  )
}
