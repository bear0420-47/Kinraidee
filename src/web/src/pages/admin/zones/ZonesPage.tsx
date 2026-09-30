import { useRef, useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { MasterDataPageShell } from '@/components/MasterDataPageShell'
import { QueryListState } from '@/components/QueryListState'
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
    <MasterDataPageShell
      title="จัดการโซน"
      note="ตัวเลือก “ที่ไหนก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู ไม่ต้องสร้างเป็นโซน"
      createLabel="เพิ่มโซน"
      onCreate={() => openDialog({ mode: 'create' })}
      createButtonRef={createButtonRef}
      notice={notice}
    >
      <QueryListState
        query={zones}
        loadingMessage="กำลังโหลดโซน…"
        errorMessage="โหลดรายการโซนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        emptyMessage="ยังไม่มีโซน"
      >
        {(items) => (
          <ZoneTable
            zones={items}
            onEdit={(zone) => openDialog({ mode: 'edit', zone })}
            onDelete={(zone) => openDialog({ mode: 'delete', zone })}
          />
        )}
      </QueryListState>

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
    </MasterDataPageShell>
  )
}
