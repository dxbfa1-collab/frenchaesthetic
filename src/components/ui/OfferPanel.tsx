import type { ReactNode } from 'react'

import { CheckIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/** Deep-charcoal panel, 1.5 px gold border, gold ticks. Offers (and prices, if ever shown) live only here. */
export function OfferPanel({
  title,
  points,
  footer,
  className,
}: {
  title?: string
  points: string[]
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'tone-dark rounded-[6px] border-[1.5px] border-gold bg-deep-charcoal p-7 sm:p-9',
        className,
      )}
    >
      {title && <p className="label text-accent">{title}</p>}
      <ul className={cn('space-y-4', title && 'mt-6')}>
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-lg font-semibold text-fg">
            <CheckIcon size={22} className="mt-0.5 shrink-0 text-gold" />
            {point}
          </li>
        ))}
      </ul>
      {footer && (
        <div className="mt-7 border-t border-hairline pt-5 text-sm text-muted">{footer}</div>
      )}
    </div>
  )
}
