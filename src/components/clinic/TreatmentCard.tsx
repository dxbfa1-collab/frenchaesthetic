import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { Numerals } from '@/components/ui/Numerals'
import type { TreatmentView } from '@/lib/payload'
import { treatmentHref } from '@/lib/treatments'

import { TreatmentStatus } from './TreatmentStatus'

/** The whole card is one link (the heading's), so screen readers hear each treatment once. */
export function TreatmentCard({
  treatment,
  as: Heading = 'h3',
  showCategory = false,
}: {
  treatment: TreatmentView
  as?: 'h2' | 'h3'
  showCategory?: boolean
}) {
  return (
    <article className="group relative flex flex-col gap-4 border border-hairline bg-surface p-7 transition-colors hover:border-line sm:p-8">
      <TreatmentStatus treatment={treatment} />
      {showCategory && <p className="label text-muted">{treatment.category.name}</p>}
      <Heading className="text-[1.75rem] leading-tight sm:text-[2rem]">
        <Link
          href={treatmentHref(treatment)}
          className="after:absolute after:inset-0 after:content-['']"
        >
          <Numerals>{treatment.name}</Numerals>
        </Link>
      </Heading>
      {treatment.promise && <p>{treatment.promise}</p>}
      <span aria-hidden="true" className="link-arrow mt-auto self-start pt-2">
        View treatment <ArrowRightIcon size={18} />
      </span>
    </article>
  )
}
