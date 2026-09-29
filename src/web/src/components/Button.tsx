import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-peach shadow-md hover:bg-yellow',
  secondary: 'bg-surface shadow-md hover:bg-peach-deep',
  ghost: 'bg-transparent hover:bg-peach-deep',
}

export function buttonClassName(variant: ButtonVariant = 'primary') {
  return [
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border-2 border-paper px-5',
    'font-extrabold text-paper transition motion-reduce:transition-none',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClassNames[variant],
  ].join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({
  variant = 'primary',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClassName(variant)} ${className ?? ''}`}
      {...props}
    />
  )
}
