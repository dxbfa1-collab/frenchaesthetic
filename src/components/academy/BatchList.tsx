import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/Button'
import { Pending } from '@/components/ui/Pending'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { formatBatchDate } from '@/lib/batches'
import type { BatchView } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

/** "Open", "Full", or seats left (only when admissions keep the count up to date). */
export function seatStatus(batch: BatchView): { text: string; full: boolean } {
  const left = Math.max(0, batch.totalSeats - (batch.seatsTaken ?? 0))
  if (batch.status === 'full' || left === 0) return { text: 'Full', full: true }
  if (batch.showSeatsLeft)
    return { text: left <= 5 ? `Few seats left: ${left}` : `${left} seats left`, full: false }
  return { text: 'Open', full: false }
}

export function campusName(batch: BatchView): string | null {
  return batch.campus && typeof batch.campus === 'object'
    ? batch.campus.shortName || batch.campus.name
    : null
}

export function BatchList({
  batches,
  whatsapp,
  from,
}: {
  batches: BatchView[]
  whatsapp: string
  from: string
}) {
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {batches.map((batch) => {
        const seats = seatStatus(batch)
        const campus = campusName(batch)
        return (
          <li key={batch.id} className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-1.5">
              <span className="label text-accent">{batch.course.shortName}</span>
              <span className="text-xl font-bold text-heading sm:text-2xl">
                <Pending confirmed={batch.factStatus === 'confirmed'}>
                  {formatBatchDate(batch.startDate)}
                </Pending>
              </span>
              <span className="text-muted">
                {campus ? `${campus}, Lahore` : 'Campus to confirm'} · Max {batch.totalSeats} seats
                ·{' '}
                <span className={seats.full ? 'font-bold text-heading' : undefined}>
                  {seats.text}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {seats.full ? (
                <span className="label text-muted">Batch full</span>
              ) : (
                <ButtonLink
                  href={`/academy/enroll?batch=${batch.id}&from=${from}`}
                  variant="outline"
                >
                  Enroll <ArrowRightIcon size={18} />
                </ButtonLink>
              )}
              <WhatsAppLink
                number={whatsapp}
                message={academyMessages.batches}
                side="academy"
                label={`batch-${batch.id}`}
                className="link-arrow"
              >
                <WhatsAppIcon size={18} className="text-accent" />
                Ask about this batch
              </WhatsAppLink>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
