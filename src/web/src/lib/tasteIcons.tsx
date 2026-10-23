import {
  BowlFood,
  Cake,
  Flame,
  ForkKnife,
  Heart,
  Leaf,
  OrangeSlice,
  Sparkle,
  type IconProps,
} from '@phosphor-icons/react'

import { createIconRegistry } from '@/lib/iconRegistry'

export const tasteIcons = createIconRegistry(
  {
    flame: { label: 'เปลวไฟ', Icon: Flame },
    leaf: { label: 'ใบไม้', Icon: Leaf },
    sparkles: { label: 'ประกาย', Icon: Sparkle },
    heart: { label: 'หัวใจ', Icon: Heart },
    bowl: { label: 'ชาม', Icon: BowlFood },
    cake: { label: 'ขนม', Icon: Cake },
    citrus: { label: 'ส้ม', Icon: OrangeSlice },
  },
  ForkKnife,
)

export function TasteIcon({
  icon,
  ...props
}: IconProps & { icon: string | null }) {
  const Icon = tasteIcons.resolve(icon)
  return <Icon {...props} />
}
