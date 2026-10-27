import Link from 'next/link'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'outline'

/** Primary: gold fill, charcoal text. Use one primary per section; everything else is outline. */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  { size = 'md', className }: { size?: 'md' | 'lg'; className?: string } = {},
): string {
  return cn(
    'btn',
    variant === 'primary' ? 'btn-primary' : 'btn-outline',
    size === 'lg' && 'btn-lg',
    className,
  )
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: 'md' | 'lg' }

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, { size, className })} {...props} />
}
