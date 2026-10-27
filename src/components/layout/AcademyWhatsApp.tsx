'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { academyMessageFor } from '@/lib/whatsapp'

/** Admissions WhatsApp link whose pre-filled message carries the current page's WEB code. */
export function AcademyWhatsApp({
  number,
  label,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  number: string
  label: string
  className?: string
  children: ReactNode
  'aria-label'?: string
}) {
  const pathname = usePathname()
  return (
    <WhatsAppLink
      number={number}
      message={academyMessageFor(pathname)}
      side="academy"
      label={label}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </WhatsAppLink>
  )
}
