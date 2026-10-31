'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { cn } from '@/lib/cn'
import { academyMessages } from '@/lib/whatsapp'

export type CalendarBatch = {
  id: string
  course: string
  /** The first course listed fills its dates in gold; the other is outlined. */
  primary: boolean
  dateKey: string
  dateLabel: string
  place: string
  seats: string
  full: boolean
  enrollHref: string
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_MONTHS = 6

const monthKey = (dateKey: string) => dateKey.slice(0, 7)

const monthDate = (month: string) => new Date(`${month}-01T12:00:00.000Z`)

const monthName = (month: string, style: 'long' | 'short') =>
  new Intl.DateTimeFormat('en-GB', {
    month: style,
    ...(style === 'long' ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(monthDate(month))

/** The days of a month as a Monday-first grid; null fills the cells before the 1st. */
function monthCells(month: string): (number | null)[] {
  const first = monthDate(month)
  const blanks = (first.getUTCDay() + 6) % 7
  const days = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0, 12),
  ).getUTCDate()
  return [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]
}

/** Six months of batch dates beside the details of the chosen batch. */
export function BatchCalendar({
  batches,
  intro,
  whatsapp,
}: {
  batches: CalendarBatch[]
  intro: string
  whatsapp: string
}) {
  const months = [...new Set(batches.map((b) => monthKey(b.dateKey)))].slice(0, MAX_MONTHS)
  const [selectedId, setSelectedId] = useState(batches[0].id)
  const [direction, setDirection] = useState(1)
  const reduced = useReducedMotion()

  const selected = batches.find((b) => b.id === selectedId) ?? batches[0]
  const month = monthKey(selected.dateKey)
  const index = months.indexOf(month)
  const inMonth = batches.filter((b) => monthKey(b.dateKey) === month)

  const goTo = (next: string) => {
    const target = batches.find((b) => monthKey(b.dateKey) === next)
    if (!target) return
    setDirection(next > month ? 1 : -1)
    setSelectedId(target.id)
  }

  const slide = reduced ? 0 : 28

  return (
    <section className="border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16 lg:py-28">
        <div data-reveal="">
          <SectionHeading
            eyebrow="Next batches"
            title="Choose"
            accent="your start date."
            intro={intro}
          />

          <div aria-live="polite" className="mt-10 rounded-2xl border border-line bg-surface p-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.22 }}
              >
                <p className="label text-accent">{selected.course}</p>
                <p className="mt-3 text-3xl font-extrabold text-heading">{selected.dateLabel}</p>
                <p className="mt-2 text-muted">
                  {selected.place} · {selected.seats}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {selected.full ? (
                    <span className="label text-muted">Batch full</span>
                  ) : (
                    <ButtonLink href={selected.enrollHref}>
                      Enroll in this batch <ArrowRightIcon size={18} />
                    </ButtonLink>
                  )}
                  <WhatsAppLink
                    number={whatsapp}
                    message={academyMessages.batches}
                    side="academy"
                    label={`batch-${selected.id}`}
                    className="link-arrow"
                  >
                    <WhatsAppIcon size={18} className="text-accent" />
                    Ask on WhatsApp
                  </WhatsAppLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <Link href="/academy/batches" className="link-arrow mt-8">
            Full batch calendar <ArrowRightIcon size={18} />
          </Link>
        </div>

        <div data-reveal="" className="tone-dark rounded-2xl bg-deep-charcoal p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="calendar-arrow"
              aria-label="Previous month"
              disabled={index <= 0}
              onClick={() => goTo(months[index - 1])}
            >
              <ArrowRightIcon size={18} className="rotate-180" />
            </button>
            <h3 className="text-xl sm:text-2xl" aria-live="polite">
              {monthName(month, 'long')}
            </h3>
            <button
              type="button"
              className="calendar-arrow"
              aria-label="Next month"
              disabled={index >= months.length - 1}
              onClick={() => goTo(months[index + 1])}
            >
              <ArrowRightIcon size={18} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted sm:gap-2">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="-mx-1.5 mt-1 min-h-[19rem] overflow-hidden p-1.5 sm:min-h-[24rem]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={month}
                className="grid grid-cols-7 gap-1 sm:gap-2"
                initial={{ opacity: 0, x: direction * slide }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -slide }}
                transition={{ duration: reduced ? 0 : 0.2 }}
              >
                {monthCells(month).map((day, i) => {
                  if (day === null) return <span key={`blank-${i}`} />
                  const key = `${month}-${String(day).padStart(2, '0')}`
                  const batch = inMonth.find((b) => b.dateKey === key)
                  if (!batch) {
                    return (
                      <span key={key} className="calendar-day">
                        {day}
                      </span>
                    )
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${batch.course} batch, ${batch.dateLabel}`}
                      aria-pressed={batch.id === selected.id}
                      onClick={() => setSelectedId(batch.id)}
                      className={cn(
                        'calendar-day calendar-batch',
                        batch.primary ? 'is-primary' : 'is-secondary',
                        batch.id === selected.id && 'is-selected',
                      )}
                    >
                      {day}
                    </button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg">
            {[...new Map(batches.map((b) => [b.course, b])).values()].map((b) => (
              <span key={b.course} className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('calendar-key', b.primary ? 'is-primary' : 'is-secondary')}
                />
                {b.course}
              </span>
            ))}
          </div>

          {/* On phones the details sit above, out of view, so the chosen date shows here too. */}
          <div className="mt-5 flex items-center justify-between gap-4 lg:hidden">
            <p className="font-bold text-heading">
              {selected.course}: {selected.dateLabel}
            </p>
            {!selected.full && (
              <Link href={selected.enrollHref} className="link-arrow shrink-0">
                Enroll <ArrowRightIcon size={18} />
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {months.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={m === month}
                onClick={() => goTo(m)}
                className={cn('calendar-month', m === month && 'is-current')}
              >
                {monthName(m, 'short')}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
