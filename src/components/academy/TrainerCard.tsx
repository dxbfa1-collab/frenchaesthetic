import Image from 'next/image'

import { Pending } from '@/components/ui/Pending'
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

/** Real photo only with written consent; otherwise a neutral initials mark (never stock or AI faces). */
export function TrainerCard({ trainer }: { trainer: Doctor }) {
  const photo =
    trainer.photoConsent && trainer.photo && typeof trainer.photo === 'object' && trainer.photo.url
      ? trainer.photo
      : null
  const role = [trainer.title, trainer.trainerRole].filter(Boolean).join(' · ')

  return (
    <article className="flex items-center gap-6 border border-hairline bg-surface p-6 sm:p-7">
      {photo ? (
        <Image
          src={photo.url!}
          alt={photo.alt}
          width={80}
          height={80}
          className="size-20 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-20 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold font-display text-3xl text-heading"
        >
          {initials(trainer.name)}
        </span>
      )}
      <div>
        <h3 className="text-[1.75rem] leading-tight">
          <Pending confirmed={trainer.status === 'confirmed'}>{trainer.name}</Pending>
        </h3>
        {role && <p className="label mt-2 text-accent">{role}</p>}
        {trainer.teaches && <p className="mt-2 text-[0.9375rem]">{trainer.teaches}</p>}
      </div>
    </article>
  )
}
