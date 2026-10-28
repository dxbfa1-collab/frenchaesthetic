import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { Pending } from '@/components/ui/Pending'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { consultationNote } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'
import type { Branch } from '@/payload-types'

/** A branch with its own consultation wording, address (marked until confirmed) and WhatsApp. */
export function BranchCard({
  branch,
  whatsapp,
  message,
  as: Heading = 'h3',
}: {
  branch: Branch
  /** The clinic UAN, used when the branch has no approved number of its own. */
  whatsapp: string
  message?: string
  as?: 'h2' | 'h3'
}) {
  const note = consultationNote(branch)

  return (
    <article className="flex flex-col border border-hairline bg-surface p-7">
      <span className="pill self-start">{branch.city}</span>
      <Heading className="mt-6 text-[1.875rem] leading-tight">
        <Link
          href={`/clinic/branches/${branch.slug}`}
          className="decoration-gold decoration-1 underline-offset-[0.2em] hover:underline"
        >
          {branch.name}
        </Link>
      </Heading>
      {note && <p className="mt-3 font-semibold text-heading">{note}</p>}
      {branch.address && (
        <p className="mt-3 text-[0.9375rem]">
          <Pending confirmed={branch.addressStatus === 'confirmed'}>{branch.address}</Pending>
        </p>
      )}
      <div className="mt-auto flex flex-col items-start gap-4 pt-8">
        <WhatsAppLink
          number={branch.whatsapp || whatsapp}
          message={message ?? clinicMessages.consultation(branch.name)}
          side="clinic"
          label={`branch-${branch.slug}`}
          className="link-arrow"
        >
          Book at {branch.shortName || branch.name} <ArrowRightIcon size={18} />
        </WhatsAppLink>
        <Link
          href={`/clinic/branches/${branch.slug}`}
          className="text-sm font-semibold text-muted transition-colors hover:text-heading"
        >
          Branch details
        </Link>
      </div>
    </article>
  )
}
