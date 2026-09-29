import type { IconRegistry } from '@/lib/iconRegistry'

type IconKeyLabelProps = {
  registry: IconRegistry
  icon: string | null
}

// Shows the resolved icon with a text label so the meaning never relies on the graphic.
export function IconKeyLabel({ registry, icon }: IconKeyLabelProps) {
  const Icon = registry.resolve(icon)
  const label =
    registry.labelOf(icon) ??
    (icon ? `ไอคอนเริ่มต้น (ไม่รู้จัก ${icon})` : 'ไอคอนเริ่มต้น')

  return (
    <span className="inline-flex items-center gap-2">
      <Icon aria-hidden size={24} className="shrink-0" />
      {label}
    </span>
  )
}
