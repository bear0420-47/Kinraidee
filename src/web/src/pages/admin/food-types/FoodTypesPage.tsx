import { useRef, useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { MasterDataPageShell } from '@/components/MasterDataPageShell'
import { QueryListState } from '@/components/QueryListState'
import {
  useCreateFoodType,
  useDeleteFoodType,
  useFoodTypes,
  useUpdateFoodType,
} from '@/hooks/admin/food-types/useFoodTypes'
import {
  getFoodTypeChanges,
  type CreateFoodTypeBody,
  type FoodType,
} from '@/schemas/admin/food-types/foodTypeSchemas'
import { DeleteFoodTypeDialog } from './components/DeleteFoodTypeDialog'
import { FoodTypeForm } from './components/FoodTypeForm'
import { FoodTypeTable } from './components/FoodTypeTable'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; foodType: FoodType }
  | { mode: 'delete'; foodType: FoodType }

export function FoodTypesPage() {
  const foodTypes = useFoodTypes()
  const createFoodType = useCreateFoodType()
  const updateFoodType = useUpdateFoodType()
  const deleteFoodType = useDeleteFoodType()
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

  async function submitCreate(body: CreateFoodTypeBody) {
    await createFoodType.mutateAsync(body)
    finish(`เพิ่มประเภทอาหาร ${body.name.th} แล้ว`)
  }

  async function submitEdit(foodType: FoodType, body: CreateFoodTypeBody) {
    const changes = getFoodTypeChanges(foodType, body)
    if (changes) {
      await updateFoodType.mutateAsync({ id: foodType.id, body: changes })
    }
    finish(
      changes
        ? `บันทึกการแก้ไขประเภทอาหาร ${body.name.th} แล้ว`
        : 'ไม่มีข้อมูลที่เปลี่ยนแปลง',
    )
  }

  async function confirmDelete(foodType: FoodType) {
    await deleteFoodType.mutateAsync(foodType.id)
    finish(`ลบประเภทอาหาร ${foodType.name.th} แล้ว`)
  }

  const closeDialog = () => setDialog(null)

  return (
    <MasterDataPageShell
      title="จัดการประเภทอาหาร"
      note="ตัวเลือก “อะไรก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู ไม่ต้องสร้างเป็นประเภทอาหาร"
      createLabel="เพิ่มประเภทอาหาร"
      onCreate={() => openDialog({ mode: 'create' })}
      createButtonRef={createButtonRef}
      notice={notice}
    >
      <QueryListState
        query={foodTypes}
        loadingMessage="กำลังโหลดประเภทอาหาร…"
        errorMessage="โหลดรายการประเภทอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        emptyMessage="ยังไม่มีประเภทอาหาร"
      >
        {(items) => (
          <FoodTypeTable
            foodTypes={items}
            onEdit={(foodType) => openDialog({ mode: 'edit', foodType })}
            onDelete={(foodType) => openDialog({ mode: 'delete', foodType })}
          />
        )}
      </QueryListState>

      {dialog?.mode === 'create' ? (
        <Dialog title="เพิ่มประเภทอาหาร" onClose={closeDialog}>
          <FoodTypeForm
            submitLabel="เพิ่มประเภทอาหาร"
            onSubmit={submitCreate}
            onCancel={closeDialog}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'edit' ? (
        <Dialog title="แก้ไขประเภทอาหาร" onClose={closeDialog}>
          <FoodTypeForm
            foodType={dialog.foodType}
            submitLabel="บันทึกการแก้ไข"
            onSubmit={(body) => submitEdit(dialog.foodType, body)}
            onCancel={closeDialog}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'delete' ? (
        <DeleteFoodTypeDialog
          foodType={dialog.foodType}
          onConfirm={() => confirmDelete(dialog.foodType)}
          onClose={closeDialog}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
    </MasterDataPageShell>
  )
}
