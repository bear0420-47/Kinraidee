import {
  BowlFood,
  BowlSteam,
  CookingPot,
  ForkKnife,
  Hamburger,
  Leaf,
  Sparkle,
  type IconProps,
} from '@phosphor-icons/react'

import { createIconRegistry } from '@/lib/iconRegistry'

export const foodTypeIcons = createIconRegistry(
  {
    rice: { label: 'ข้าว', Icon: BowlFood },
    noodles: { label: 'เส้น', Icon: BowlSteam },
    sandwich: { label: 'แซนด์วิช', Icon: Hamburger },
    soup: { label: 'ซุป', Icon: CookingPot },
    salad: { label: 'สลัด', Icon: Leaf },
    sparkles: { label: 'พิเศษ', Icon: Sparkle },
  },
  ForkKnife,
)

export function FoodTypeIcon({
  icon,
  ...props
}: IconProps & { icon: string | null }) {
  const Icon = foodTypeIcons.resolve(icon)
  return <Icon {...props} />
}
