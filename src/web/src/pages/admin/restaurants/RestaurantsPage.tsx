import { useEffect, useRef, useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { LeavePageDialog } from '@/components/LeavePageDialog'
import { MasterDataPageShell } from '@/components/MasterDataPageShell'
import { getLastPage, Pagination } from '@/components/Pagination'
import { QueryListState } from '@/components/QueryListState'
import { useImageFormGuard } from '@/hooks/admin/images/useImageFormGuard'
import {
  useDeleteRestaurant,
  useRestaurants,
  useRestoreRestaurant,
  useSaveRestaurant,
} from '@/hooks/admin/restaurants/useRestaurants'
import { useZones } from '@/hooks/admin/zones/useZones'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import {
  defaultRestaurantFilters,
  type CreateRestaurantBody,
  type Restaurant,
  type RestaurantFilters as Filters,
} from '@/schemas/admin/restaurants/restaurantSchemas'
import { DeleteRestaurantDialog } from './components/DeleteRestaurantDialog'
import { RestaurantForm } from './components/RestaurantForm'
import { RestaurantFilters } from './components/RestaurantFilters'
import { RestaurantTable } from './components/RestaurantTable'
import { RestoreRestaurantDialog } from './components/RestoreRestaurantDialog'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; restaurant: Restaurant }
  | { mode: 'delete'; restaurant: Restaurant }
  | { mode: 'restore'; restaurant: Restaurant }

const CLEANUP_WARNING = 'ระบบลบรูปที่ไม่ได้ใช้แล้วไม่สำเร็จ'

export function RestaurantsPage() {
  // Kept in the URL, so a reload or a shared link keeps the search and page.
  const [filters, setFilters] = useUrlFilters<Filters>(defaultRestaurantFilters)
  const restaurants = useRestaurants(filters)
  const zones = useZones()
  const saveRestaurant = useSaveRestaurant()
  const deleteRestaurant = useDeleteRestaurant()
  const restoreRestaurant = useRestoreRestaurant()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [notice, setNotice] = useState('')
  const createButtonRef = useRef<HTMLButtonElement>(null)

  const isFormOpen = dialog?.mode === 'create' || dialog?.mode === 'edit'
  const guard = useImageFormGuard(isFormOpen)
  const { blocker } = guard

  const meta = restaurants.data?.meta
  const lastPage = meta ? getLastPage(meta.total, meta.pageSize) : 1
  // Deleting or restoring the last row of the last page leaves the query past the end.
  const isPastLastPage = Boolean(meta && meta.total > 0 && meta.page > lastPage)

  useEffect(() => {
    if (isPastLastPage) {
      setFilters((current) => ({ ...current, page: lastPage }))
    }
  }, [isPastLastPage, lastPage])

  function changeFilters(changes: Partial<Omit<Filters, 'page'>>) {
    setFilters((current) => ({ ...current, ...changes, page: 1 }))
  }

  function openDialog(next: DialogState) {
    setNotice('')
    guard.resetFormState()
    setDialog(next)
  }

  function finish(message: string) {
    setDialog(null)
    guard.resetFormState()
    setNotice(message)
  }

  async function discardPendingUpload() {
    if (!(await guard.discardPendingUpload())) setNotice(CLEANUP_WARNING)
  }

  function closeForm() {
    if (guard.isBusy) return
    void discardPendingUpload()
    setDialog(null)
    guard.resetFormState()
  }

  async function save(
    body: CreateRestaurantBody,
    pendingUploadKey: string | null,
    restaurant?: Restaurant,
  ) {
    const result = await saveRestaurant({ restaurant, body, pendingUploadKey })
    const message = !result.changed
      ? 'ไม่มีข้อมูลที่เปลี่ยนแปลง'
      : restaurant
        ? `บันทึกการแก้ไขร้าน ${body.name.th} แล้ว`
        : `เพิ่มร้าน ${body.name.th} แล้ว`
    finish(result.cleanupFailed ? `${message} · ${CLEANUP_WARNING}` : message)
  }

  async function confirmDelete(restaurant: Restaurant) {
    await deleteRestaurant.mutateAsync(restaurant.id)
    finish(`ลบร้าน ${restaurant.name.th} แล้ว`)
  }

  async function confirmRestore(restaurant: Restaurant) {
    await restoreRestaurant.mutateAsync(restaurant.id)
    finish(`กู้คืนร้าน ${restaurant.name.th} แล้ว`)
  }

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.zoneId !== '' ||
    filters.includeDeleted

  return (
    <MasterDataPageShell
      title="จัดการร้านอาหาร"
      note="ร้านที่ลบแล้วจะถูกซ่อนจากการสุ่มเมนู และกู้คืนได้ภายหลัง"
      createLabel="เพิ่มร้านอาหาร"
      onCreate={() => openDialog({ mode: 'create' })}
      createButtonRef={createButtonRef}
      notice={notice}
    >
      <RestaurantFilters
        filters={filters}
        zones={zones.data ?? []}
        onChange={changeFilters}
      />
      <QueryListState
        // While the page is being moved back into range, show loading rather than "empty".
        query={{
          ...restaurants,
          isPending: restaurants.isPending || isPastLastPage,
        }}
        items={restaurants.data?.items}
        loadingMessage="กำลังโหลดร้านอาหาร…"
        errorMessage="โหลดรายการร้านอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        emptyMessage={
          isFiltered ? 'ไม่พบร้านอาหารที่ตรงกับตัวกรอง' : 'ยังไม่มีร้านอาหาร'
        }
      >
        {(items) => (
          <RestaurantTable
            restaurants={items}
            onEdit={(restaurant) => openDialog({ mode: 'edit', restaurant })}
            onDelete={(restaurant) =>
              openDialog({ mode: 'delete', restaurant })
            }
            onRestore={(restaurant) =>
              openDialog({ mode: 'restore', restaurant })
            }
          />
        )}
      </QueryListState>
      {meta && meta.total > 0 && !isPastLastPage ? (
        <Pagination
          label="หน้ารายการร้านอาหาร"
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
        />
      ) : null}

      {dialog?.mode === 'create' ? (
        <Dialog title="เพิ่มร้านอาหาร" onClose={closeForm}>
          <RestaurantForm
            zones={zones.data ?? []}
            zonesFailed={zones.isError}
            submitLabel="เพิ่มร้านอาหาร"
            onSave={(body, pendingUploadKey) => save(body, pendingUploadKey)}
            onCancel={closeForm}
            onStateChange={guard.trackFormState}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'edit' ? (
        <Dialog title="แก้ไขร้านอาหาร" onClose={closeForm}>
          <RestaurantForm
            restaurant={dialog.restaurant}
            zones={zones.data ?? []}
            zonesFailed={zones.isError}
            submitLabel="บันทึกการแก้ไข"
            onSave={(body, pendingUploadKey) =>
              save(body, pendingUploadKey, dialog.restaurant)
            }
            onCancel={closeForm}
            onStateChange={guard.trackFormState}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'delete' ? (
        <DeleteRestaurantDialog
          restaurant={dialog.restaurant}
          onConfirm={() => confirmDelete(dialog.restaurant)}
          onClose={() => setDialog(null)}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
      {dialog?.mode === 'restore' ? (
        <RestoreRestaurantDialog
          restaurant={dialog.restaurant}
          onConfirm={() => confirmRestore(dialog.restaurant)}
          onClose={() => setDialog(null)}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
      {blocker.state === 'blocked' ? (
        <LeavePageDialog
          message="ข้อมูลร้านที่ยังไม่บันทึกจะหายไป"
          onLeave={async () => {
            await discardPendingUpload()
            blocker.proceed()
          }}
          onStay={() => blocker.reset()}
        />
      ) : null}
    </MasterDataPageShell>
  )
}
