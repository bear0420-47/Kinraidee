import { Trash } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { MenuSummaryRow } from '@/components/MenuSummaryRow'
import { PageShell } from '@/components/PageShell'
import { getLastPage, Pagination } from '@/components/Pagination'
import { QueryListState } from '@/components/QueryListState'
import {
  useClearHistory,
  useHistory,
} from '@/hooks/recommendation-history/useRecommendationHistory'

function formatSelectedAt(selectedAt: string) {
  return new Date(selectedAt).toLocaleString('th-TH')
}

// The signed-in user's selected menus, newest first. A deleted menu, or one whose Restaurant
// is deleted, stays listed as unavailable. Clearing removes every row after confirmation.
export function HistoryPage() {
  const [page, setPage] = useState(1)
  const history = useHistory(page)
  const clear = useClearHistory()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [status, setStatus] = useState('')
  // Stays mounted when the list empties, so focus has somewhere to land after clearing.
  const areaRef = useRef<HTMLElement>(null)
  // Closing the dialog returns focus to the clear button, which is then disabled; focus is
  // moved to the history area once the dialog has gone.
  const [focusArea, setFocusArea] = useState(false)
  // Where focus returns when the dialog closes without an opener to go back to (for
  // example, a browser that does not focus buttons on click).
  const clearButtonRef = useRef<HTMLButtonElement>(null)
  const meta = history.data?.meta
  const hasHistory = Boolean(meta && meta.total > 0)
  const lastPage = meta ? getLastPage(meta.total, meta.pageSize) : 1

  // A history cleared elsewhere can leave this page past the end, so move back into range.
  useEffect(() => {
    if (meta && meta.total > 0 && meta.page > lastPage) setPage(lastPage)
  }, [meta, lastPage])

  useEffect(() => {
    if (!focusArea || confirmingClear) return
    areaRef.current?.focus()
    setFocusArea(false)
  }, [focusArea, confirmingClear])

  async function clearAll() {
    await clear.mutateAsync()
    setConfirmingClear(false)
    setFocusArea(true)
    setPage(1)
    setStatus('ล้างประวัติแล้ว')
  }

  return (
    <PageShell title="ประวัติเมนูที่เลือก" width="medium">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/account" className="rounded-xs font-bold underline">
          กลับไปบัญชีของฉัน
        </Link>
        {/* Always shown so it can be found; disabled when there is nothing to clear. */}
        <Button
          ref={clearButtonRef}
          variant="secondary"
          size="compact"
          disabled={!hasHistory}
          onClick={() => {
            setStatus('')
            setConfirmingClear(true)
          }}
        >
          <Trash aria-hidden weight="bold" />
          ล้างประวัติทั้งหมด
        </Button>
      </div>
      <p role="status" className="sr-only">
        {status}
      </p>
      <section
        ref={areaRef}
        tabIndex={-1}
        aria-label="ประวัติที่บันทึกไว้"
        className="flex flex-col gap-4 rounded-sm"
      >
        <QueryListState
          query={history}
          items={history.data?.items}
          loadingMessage="กำลังโหลดประวัติ…"
          errorMessage="โหลดประวัติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
          emptyMessage="ยังไม่มีประวัติเมนูที่เลือก"
        >
          {(items) => (
            <ul
              aria-label="รายการประวัติเมนูที่เลือก"
              className="flex flex-col gap-3"
            >
              {items.map((entry) => (
                <MenuSummaryRow
                  key={entry.id}
                  menuItem={entry.menuItem}
                  available={entry.available}
                  detail={
                    <p className="text-small text-muted">
                      เลือกเมื่อ {formatSelectedAt(entry.selectedAt)}
                    </p>
                  }
                />
              ))}
            </ul>
          )}
        </QueryListState>
        {meta && meta.total > meta.pageSize ? (
          <Pagination
            label="หน้าประวัติเมนูที่เลือก"
            page={meta.page}
            pageSize={meta.pageSize}
            total={meta.total}
            onPageChange={setPage}
          />
        ) : null}
      </section>
      {confirmingClear ? (
        <ConfirmDialog
          title="ล้างประวัติทั้งหมด?"
          confirmLabel="ล้างประวัติทั้งหมด"
          pendingLabel="กำลังล้าง…"
          icon={<Trash aria-hidden weight="bold" />}
          getErrorMessage={() => 'ล้างประวัติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'}
          onConfirm={clearAll}
          onClose={() => setConfirmingClear(false)}
          fallbackFocusRef={clearButtonRef}
        >
          <p>การล้างประวัติจะลบรายการที่คุณเคยเลือกทั้งหมด</p>
        </ConfirmDialog>
      ) : null}
    </PageShell>
  )
}
