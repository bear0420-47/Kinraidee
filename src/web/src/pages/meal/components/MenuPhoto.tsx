import { ImagePreview } from '@/components/ImagePreview'
import { FoodTypeIcon } from '@/lib/foodTypeIcons'
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

  return (
    <div className={`overflow-hidden border-paper bg-canvas-soft ${className}`}>
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
    </div>
  )
}
