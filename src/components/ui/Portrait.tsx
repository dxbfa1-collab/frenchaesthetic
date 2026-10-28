import Image from 'next/image'

import { cn } from '@/lib/cn'
import type { Doctor } from '@/payload-types'

function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const SIZES = {
  md: { box: 'size-20', text: 'text-3xl', px: 80 },
  lg: { box: 'size-36 sm:size-44', text: 'text-6xl', px: 176 },
}

/** A real photo only with written consent; otherwise a neutral initials mark (never stock or AI faces). */
export function Portrait({ person, size = 'md' }: { person: Doctor; size?: 'md' | 'lg' }) {
  const { box, text, px } = SIZES[size]
  const photo =
    person.photoConsent && person.photo && typeof person.photo === 'object' && person.photo.url
      ? person.photo
      : null

  if (photo) {
    return (
      <Image
        src={photo.url!}
        alt={photo.alt}
        width={px}
        height={px}
        className={cn(box, 'shrink-0 rounded-full object-cover')}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        box,
        text,
        'flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold font-display text-heading',
      )}
    >
      {initials(person.name)}
    </span>
  )
}

/** Credentials exactly as documented: degree and title, e.g. "DPT · Physical Therapist". */
export const credentials = (person: Doctor, ...extra: Array<string | null | undefined>) =>
  [person.degrees, person.title, ...extra].filter(Boolean).join(' · ')
