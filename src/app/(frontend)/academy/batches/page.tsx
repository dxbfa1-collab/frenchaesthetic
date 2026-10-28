import type { Metadata } from 'next'

import { BatchList } from '@/components/academy/BatchList'
import { WhatsAppIcon } from '@/components/icons'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { batchRuleSentence, formatBatchMonth } from '@/lib/batches'
import { type BatchView, getCourses, getSiteSettings, getUpcomingBatches } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

// Meta title and description from the FAA brief's SEO starter pack (§14).
export const metadata: Metadata = {
  title: { absolute: 'Upcoming Aesthetics Batches Lahore · Dates & Seats' },
  description:
    'Next Non-Invasive and Invasive batch dates, campus and seats. Max 20 students per batch.',
  alternates: { canonical: '/academy/batches' },
}

export const revalidate = 3600

const rules = ['No training on Sundays', 'Max 20 seats', 'Max 2 batches per month']

// FAA brief §9. The deposit rule is still open, so step 3 does not mention one.
const howToEnrol = [
  'Tap WhatsApp and tell us which course you want.',
  'Our admissions team shares fee, syllabus and batch timing.',
  'Reserve your seat.',
  'Join on the batch start date at the campus.',
]

export default async function BatchesPage() {
  const [settings, courses, batches] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getUpcomingBatches(),
  ])
  const whatsapp = settings.admissionsWhatsApp

  const byMonth = new Map<string, BatchView[]>()
  for (const batch of batches) {
    const month = formatBatchMonth(batch.startDate)
    byMonth.set(month, [...(byMonth.get(month) ?? []), batch])
  }

  const whatsappButton = (place: string) => (
    <WhatsAppLink
      number={whatsapp}
      message={academyMessages.batches}
      side="academy"
      label={`batches-${place}`}
      className={buttonClass('primary', { size: 'lg' })}
    >
      <WhatsAppIcon size={20} />
      Chat on WhatsApp
    </WhatsAppLink>
  )

  return (
    <>
      <PageHero
        eyebrow="Batches & admissions"
        title="Upcoming"
        accent="batches."
        intro={
          <p>
            {batchRuleSentence(courses)} There is no training on Sundays, so a start date that falls
            on a Sunday moves to the Monday.
          </p>
        }
        actions={
          <>
            {whatsappButton('hero')}
            <ButtonLink href="/academy/enroll?from=WEB-BATCH" variant="outline" size="lg">
              Apply online
            </ButtonLink>
          </>
        }
      />

      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          {byMonth.size > 0 ? (
            <div className="space-y-16">
              {[...byMonth].map(([month, list]) => (
                <div key={month} data-reveal="">
                  <h2 className="text-4xl">{month}</h2>
                  <div className="mt-6">
                    <BatchList batches={list} whatsapp={whatsapp} from="WEB-BATCH" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg">
              New dates are added every month. Ask admissions on WhatsApp for the next batch.
            </p>
          )}
          <ul className="mt-14 flex flex-wrap gap-2" aria-label="Batch rules">
            {rules.map((rule) => (
              <li key={rule} className="chip">
                {rule}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="tone-inverse">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading eyebrow="How to enrol" title="Four steps" accent="to your seat." />
          </div>
          <ol data-reveal="" className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {howToEnrol.map((step, i) => (
              <li key={step} className="border-t border-line pt-6">
                <span className="label text-accent">Step {String(i + 1).padStart(2, '0')}</span>
                <p className="mt-4 text-xl font-semibold text-heading">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <CtaBand
        title="Reserve"
        accent="your seat."
        intro="Only 20 seats per batch. Admissions share the fee and details on WhatsApp."
      >
        {whatsappButton('closing')}
      </CtaBand>
    </>
  )
}
