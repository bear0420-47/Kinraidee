import { ArrowSquareOut, Clock, Star } from '@phosphor-icons/react'

import { usePlaceDetails } from '@/hooks/meal/usePlaceDetails'

export function PlaceDetailsPanel({ restaurantId }: { restaurantId: string }) {
  const place = usePlaceDetails(restaurantId)

  if (place.isPending) {
    return (
      <section aria-label="ข้อมูลร้านจาก Google" className="text-small">
        <p role="status">กำลังโหลดข้อมูลร้านจาก Google…</p>
      </section>
    )
  }

  if (place.isError || !place.data) {
    return (
      <section
        aria-label="ข้อมูลร้านจาก Google"
        className="rounded-sm border-2 border-dashed border-line-soft p-3 text-small text-muted"
      >
        ข้อมูล Google Places ยังไม่พร้อมใช้งาน
      </section>
    )
  }

  const details = place.data
  return (
    <section
      aria-label="ข้อมูลร้านจาก Google"
      className="flex flex-col gap-2 rounded-sm border-2 border-line-soft bg-canvas-soft p-3 text-small"
    >
      <p className="font-extrabold">ข้อมูลล่าสุดจาก Google</p>
      {details.rating !== null ? (
        <p className="flex items-center gap-2">
          <Star aria-hidden size={17} weight="fill" />
          {details.rating.toFixed(1)}
          {details.userRatingCount !== null
            ? ` จาก ${details.userRatingCount.toLocaleString('th-TH')} คะแนน`
            : ''}
        </p>
      ) : null}
      {details.openNow !== null ? (
        <p className="flex items-center gap-2">
          <Clock aria-hidden size={17} weight="bold" />
          {details.openNow ? 'เปิดอยู่ตอนนี้' : 'ปิดอยู่ตอนนี้'}
        </p>
      ) : null}
      {details.weekdayDescriptions.length > 0 ? (
        <details>
          <summary className="cursor-pointer font-bold">เวลาเปิดทำการ</summary>
          <ul className="mt-1 flex flex-col gap-1">
            {details.weekdayDescriptions.map((description) => (
              <li key={description}>{description}</li>
            ))}
          </ul>
        </details>
      ) : null}
      {details.reviews.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-line-soft pt-2">
          <p className="font-bold">รีวิวจาก Google</p>
          {details.reviews.slice(0, 2).map((review, index) => (
            <blockquote key={`${review.authorName}-${index}`} className="m-0">
              {review.text ? <p>“{review.text}”</p> : null}
              <footer className="text-muted">
                {review.authorUri ? (
                  <a
                    href={review.authorUri}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline"
                  >
                    {review.authorName}
                  </a>
                ) : (
                  review.authorName
                )}
                {review.relativePublishTimeDescription
                  ? ` · ${review.relativePublishTimeDescription}`
                  : ''}
              </footer>
            </blockquote>
          ))}
        </div>
      ) : null}
      {details.googleMapsUri ? (
        <a
          href={details.googleMapsUri}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-bold underline"
        >
          ดูร้านนี้บน Google Maps
          <ArrowSquareOut aria-hidden size={16} weight="bold" />
        </a>
      ) : (
        <p className="text-muted">Google Places</p>
      )}
    </section>
  )
}
