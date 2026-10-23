import { ImagePreview } from '@/components/ImagePreview'
import { FoodTypeIcon } from '@/lib/foodTypeIcons'
import { creativeCommonsCredit, isStockPhoto } from '@/lib/photoCredits'
import type { RecommendationItem } from '@/schemas/meal/recommendationSchemas'

type MenuPhotoProps = {
  item: RecommendationItem
  // Sizes, positions, and frames the photo area, such as a card's top strip or a dialog's
  // 4:3 panel.
  className: string
}

// A menu photo, cropped to fill. Without one (or when it cannot load), a same-size panel with
// the food-type icon keeps the layout steady. Decorative: the menu name sits next to it.
export function MenuPhoto({ item, className }: MenuPhotoProps) {
  const placeholder = (label: string) => (
    <span className="flex h-full flex-col items-center justify-center gap-2 text-small text-muted">
      <FoodTypeIcon aria-hidden icon={item.foodType.icon} size={40} />
      {label}
    </span>
  )

  const credit = item.imageUrl ? creativeCommonsCredit(item.imageUrl) : null

  return (
    <div
      className={`relative overflow-hidden border-paper bg-canvas-soft ${className}`}
    >
      {item.imageUrl ? (
        <ImagePreview
          url={item.imageUrl}
          alt=""
          size="cover"
          fallback={placeholder('โหลดรูปไม่ได้')}
        />
      ) : (
        placeholder('ไม่มีรูปเมนู')
      )}
      {item.imageUrl && isStockPhoto(item.imageUrl) ? (
        <span className="absolute bottom-2 left-2 rounded-xs bg-paper/80 px-2 py-0.5 text-small font-bold text-cream">
          ภาพประกอบ
        </span>
      ) : null}
      {credit ? (
        <a
          href={credit.pageUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute right-2 bottom-2 max-w-[60%] truncate rounded-xs bg-paper/80 px-2 py-0.5 text-eyebrow text-cream underline"
        >
          © {credit.creator} · {credit.license}
        </a>
      ) : null}
    </div>
  )
}
