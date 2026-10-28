import Image from 'next/image'

import { ArrowRightIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/Button'
import { Pending } from '@/components/ui/Pending'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { formatBatchDate, ordinal } from '@/lib/batches'
import { SITE_PHOTOS } from '@/lib/images'
import type { BatchView } from '@/lib/payload'
import type { Course } from '@/payload-types'

type Props = {
  course: Course
  nextBatch?: BatchView
  whatsapp: string
  /** Defaults to the course's own message; the academy home uses its WEB-HOME codes. */
  whatsappMessage?: string
  as?: 'h2' | 'h3'
}

export function CourseCard({
  course,
  nextBatch,
  whatsapp,
  whatsappMessage,
  as: Heading = 'h3',
}: Props) {
  const photo =
    course.track === 'invasive' ? SITE_PHOTOS.syringePreparation : SITE_PHOTOS.facialPractice
  return (
    <article className="group lift relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface">
      <div className="relative aspect-[16/8] overflow-hidden">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ objectPosition: photo.position ?? 'center' }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
        {course.hero.label && (
          <span className="pill absolute bottom-5 left-7 sm:left-10">{course.hero.label}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-7 sm:p-10">
        <Heading className="text-[2.25rem] sm:text-5xl">
          {course.shortName}
          <span className="block italic text-accent">Aesthetics</span>
        </Heading>
        {course.summary && <p className="mt-5 text-lg">{course.summary}</p>}
        {course.featured && course.featured.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="What you practise">
            {course.featured.map((topic) => (
              <li key={topic} className="chip">
                {topic}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-7 font-semibold text-heading">
          {nextBatch ? (
            <>
              Next batch:{' '}
              <Pending confirmed={nextBatch.factStatus === 'confirmed'}>
                {formatBatchDate(nextBatch.startDate)}
              </Pending>
            </>
          ) : (
            `New batch on the ${ordinal(course.batchStartDay)} of every month`
          )}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-4 pt-9">
          <ButtonLink href={`/academy/${course.slug}`} variant="outline">
            View course <ArrowRightIcon size={18} />
          </ButtonLink>
          <WhatsAppLink
            number={whatsapp}
            message={whatsappMessage ?? course.whatsappMessage}
            side="academy"
            label={`card-${course.slug}`}
            className="link-arrow"
          >
            Ask on WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </article>
  )
}
