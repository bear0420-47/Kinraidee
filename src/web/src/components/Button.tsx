import type { ButtonHTMLAttributes, Ref } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost'
type ButtonSize = 'default' | 'compact'

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-peach shadow-md hover:bg-yellow',
  secondary: 'bg-surface shadow-md hover:bg-peach-deep',
  // A faint warm fill for a positive secondary action, such as restore.
  soft: 'bg-yellow/25 shadow-md hover:bg-yellow/50',
  ghost: 'bg-transparent hover:bg-peach-deep',
}

const sizeClassNames: Record<ButtonSize, string> = {
  default: 'min-h-11 gap-2 px-5',
  // Row actions in dense admin tables.
  compact: 'min-h-10 gap-1.5 px-4',
}

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'default',
) {
  return [
    'inline-flex items-center justify-center rounded-pill border-2 border-paper',
    'font-extrabold text-paper transition motion-reduce:transition-none',
    'disabled:cursor-not-allowed disabled:opacity-60',
    sizeClassNames[size],
    variantClassNames[variant],
  ].join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'primary',
  size = 'default',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClassName(variant, size)} ${className ?? ''}`}
      {...props}
    />
  )
}
