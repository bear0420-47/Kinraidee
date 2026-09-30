import {
  BowlFood,
  Flame,
  ForkKnife,
  Heart,
  Leaf,
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
