import { CaretLeft, CaretRight } from '@phosphor-icons/react'

import { Button } from '@/components/Button'

type PaginationProps = {
  // Accessible name for the navigation landmark, such as `หน้ารายการร้านอาหาร`.
  label: string
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function getLastPage(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}

// Page controls driven by API list metadata.
export function Pagination({
  label,
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const lastPage = getLastPage(total, pageSize)

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-small text-muted" aria-live="polite">
        หน้า {page} จาก {lastPage} · ทั้งหมด {total} รายการ
      </p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <CaretLeft aria-hidden weight="bold" />
          ก่อนหน้า
        </Button>
        <Button
          variant="secondary"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          ถัดไป
          <CaretRight aria-hidden weight="bold" />
        </Button>
      </div>
    </nav>
  )
}
