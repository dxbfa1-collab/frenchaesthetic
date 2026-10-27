import type { ReactNode } from 'react'

import { whatsappHref } from '@/lib/whatsapp'

type Props = {
  number: string
  message?: string
  side: 'clinic' | 'academy'
  /** Where on the site the click came from, for GA4 and the Meta Pixel. */
  label: string
  className?: string
  children: ReactNode
  'aria-label'?: string
}

/** WhatsApp deep link with a pre-filled message. Clicks are reported by <TrackClicks />. */
export function WhatsAppLink({
  number,
  message,
  side,
  label,
  className,
  children,
  ...rest
}: Props) {
  return (
    <a
      href={whatsappHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp_click"
      data-side={side}
      data-label={label}
      className={className}
      {...rest}
    >
      {children}
    </a>
  )
}
