// The summary keeps each condition directly editable when the catalog has no results.
export function NoMatchPanel() {
  return (
    <p
      role="status"
      className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-4"
    >
      ตอนนี้ยังไม่มีเมนูที่พร้อมแนะนำ กลับมาลองใหม่ทีหลังนะ
    </p>
  )
}
