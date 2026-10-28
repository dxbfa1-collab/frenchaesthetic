import Image from 'next/image'

import { cn } from '@/lib/cn'
import { doctorPhoto } from '@/lib/images'
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
  const uploaded =
    person.photoConsent && person.photo && typeof person.photo === 'object' && person.photo.url
      ? { src: person.photo.url, alt: person.photo.alt, position: 'center 20%' }
      : null
  const photo = uploaded ?? doctorPhoto(person.slug)

  if (photo) {
    return (
      <Image
        src={photo.src}
        alt={photo.alt}
        width={px}
        height={px}
        className={cn(
          box,
          'shrink-0 rounded-full object-cover ring-[1.5px] ring-gold ring-offset-2 ring-offset-transparent',
        )}
        style={{ objectPosition: photo.position ?? 'center 20%' }}
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
