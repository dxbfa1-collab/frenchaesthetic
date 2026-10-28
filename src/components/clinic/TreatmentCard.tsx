import Image from 'next/image'
import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { IconBadge } from '@/components/ui/TopicIcon'
import { treatmentPhoto } from '@/lib/images'
import { publicImage } from '@/lib/media'
import type { TreatmentView } from '@/lib/payload'
import { treatmentHref } from '@/lib/treatments'

import { TreatmentStatus } from './TreatmentStatus'

/** Photo, icon and name. The whole card is one link (the heading's), so it is read out once. */
export function TreatmentCard({
  treatment,
  as: Heading = 'h3',
  showCategory = false,
}: {
  treatment: TreatmentView
  as?: 'h2' | 'h3'
  showCategory?: boolean
}) {
  const uploaded = publicImage(treatment.heroImage)
  const photo = uploaded
    ? { src: uploaded.url!, alt: uploaded.alt, position: undefined }
    : treatmentPhoto(treatment.slug)

  return (
    <article className="group lift relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface">
      {photo && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ objectPosition: photo.position ?? 'center' }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-charcoal/60 to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <IconBadge topic={treatment.slug} />
          <TreatmentStatus treatment={treatment} />
        </div>
        {showCategory && <p className="label text-muted">{treatment.category.name}</p>}
        <Heading className="text-[1.5rem] leading-tight sm:text-[1.625rem]">
          <Link
            href={treatmentHref(treatment)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {treatment.name}
          </Link>
        </Heading>
        {treatment.promise && <p>{treatment.promise}</p>}
        <span aria-hidden="true" className="link-arrow mt-auto self-start pt-2">
          View treatment <ArrowRightIcon size={18} />
        </span>
      </div>
    </article>
  )
}
