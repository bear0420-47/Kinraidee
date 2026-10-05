import { useRef, useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { MasterDataPageShell } from '@/components/MasterDataPageShell'
import { QueryListState } from '@/components/QueryListState'
import {
  useCreateTaste,
  useDeleteTaste,
  useTastes,
  useUpdateTaste,
} from '@/hooks/admin/tastes/useTastes'
import {
  getTasteChanges,
  type CreateTasteBody,
  type Taste,
} from '@/schemas/admin/tastes/tasteSchemas'
import { DeleteTasteDialog } from './components/DeleteTasteDialog'
import { TasteForm } from './components/TasteForm'
import { TasteTable } from './components/TasteTable'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; taste: Taste }
  | { mode: 'delete'; taste: Taste }

export function TastesPage() {
  const tastes = useTastes()
  const createTaste = useCreateTaste()
  const updateTaste = useUpdateTaste()
  const deleteTaste = useDeleteTaste()
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

  async function submitCreate(body: CreateTasteBody) {
    await createTaste.mutateAsync(body)
    finish(`เพิ่มรสชาติ ${body.name.th} แล้ว`)
  }

  async function submitEdit(taste: Taste, body: CreateTasteBody) {
    const changes = getTasteChanges(taste, body)
    if (changes) await updateTaste.mutateAsync({ id: taste.id, body: changes })
    finish(
      changes
        ? `บันทึกการแก้ไขรสชาติ ${body.name.th} แล้ว`
        : 'ไม่มีข้อมูลที่เปลี่ยนแปลง',
    )
  }

  async function confirmDelete(taste: Taste) {
    await deleteTaste.mutateAsync(taste.id)
    finish(`ลบรสชาติ ${taste.name.th} แล้ว`)
  }

  const closeDialog = () => setDialog(null)

  return (
    <MasterDataPageShell
      title="จัดการรสชาติ"
      note="ตัวเลือก “อะไรก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู ไม่ต้องสร้างเป็นรสชาติ"
      createLabel="เพิ่มรสชาติ"
      onCreate={() => openDialog({ mode: 'create' })}
      createButtonRef={createButtonRef}
      notice={notice}
    >
      <QueryListState
        query={tastes}
        items={tastes.data}
        loadingMessage="กำลังโหลดรสชาติ…"
        errorMessage="โหลดรายการรสชาติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        emptyMessage="ยังไม่มีรสชาติ"
      >
        {(items) => (
          <TasteTable
            tastes={items}
            onEdit={(taste) => openDialog({ mode: 'edit', taste })}
            onDelete={(taste) => openDialog({ mode: 'delete', taste })}
          />
        )}
      </QueryListState>

      {dialog?.mode === 'create' ? (
        <Dialog title="เพิ่มรสชาติ" onClose={closeDialog}>
          <TasteForm
            submitLabel="เพิ่มรสชาติ"
            onSubmit={submitCreate}
            onCancel={closeDialog}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'edit' ? (
        <Dialog title="แก้ไขรสชาติ" onClose={closeDialog}>
          <TasteForm
            taste={dialog.taste}
            submitLabel="บันทึกการแก้ไข"
            onSubmit={(body) => submitEdit(dialog.taste, body)}
            onCancel={closeDialog}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'delete' ? (
        <DeleteTasteDialog
          taste={dialog.taste}
          onConfirm={() => confirmDelete(dialog.taste)}
          onClose={closeDialog}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
    </MasterDataPageShell>
  )
}
