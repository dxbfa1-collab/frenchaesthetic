import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  eyebrow?: string
  title: ReactNode
  /** Second line in italic: gold on charcoal, charcoal on ivory (the brand's signature). */
  accent?: ReactNode
  intro?: ReactNode
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  intro,
  as: Tag = 'h2',
  align = 'left',
  className,
}: Props) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className={cn('label eyebrow', align === 'center' && 'justify-center')}>{eyebrow}</p>
      )}
      <Tag className={cn(eyebrow && 'mt-5', 'text-[2.375rem] sm:text-5xl lg:text-[3.5rem]')}>
        {title}
        {accent && <span className="block italic text-accent">{accent}</span>}
      </Tag>
      {intro && <p className="mt-6 text-lg">{intro}</p>}
    </div>
  )
}
