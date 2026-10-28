import type { Metadata } from 'next'

import { BookingForm, type InterestGroup } from '@/components/clinic/BookingForm'
import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { bookingWindow } from '@/lib/dates'
import { getClinicBranches, getConcerns, getSiteSettings, getTreatmentMenu } from '@/lib/payload'
import { consultationNote } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Book a Consultation',
  description:
    'Request a consultation at French Medical Aesthetics in Lahore or Karachi. Choose your branch and treatment; we confirm your slot on WhatsApp.',
  alternates: { canonical: '/clinic/book' },
}

type Props = { searchParams: Promise<{ treatment?: string; branch?: string; concern?: string }> }

const next = [
  { title: 'We receive your request', text: 'It goes straight to the branch you chose.' },
  { title: 'We confirm on WhatsApp', text: 'The branch team agrees a time with you.' },
  {
    title: 'Your consultation',
    text: 'A doctor-led assessment, an honest plan and a clear quote before any treatment.',
  },
]

export default async function BookPage({ searchParams }: Props) {
  const query = await searchParams
  const [settings, branches, menu, concerns] = await Promise.all([
    getSiteSettings(),
    getClinicBranches(),
    getTreatmentMenu(),
    getConcerns(),
  ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  const interests: InterestGroup[] = [
    ...menu.map((category) => ({
      label: category.name,
      options: category.treatments.map((t) => ({ value: `t:${t.id}`, label: t.name })),
    })),
    ...(concerns.length > 0
      ? [
          {
            label: 'A concern',
            options: concerns.map((c) => ({ value: `c:${c.id}`, label: c.name })),
          },
        ]
      : []),
  ]
  const treatment = menu.flatMap((c) => c.treatments).find((t) => t.slug === query.treatment)
  const concern = concerns.find((c) => c.slug === query.concern)
  const branch = branches.find((b) => b.slug === query.branch)
  const dates = bookingWindow()

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Book a Consultation', href: '/clinic/book' },
            ]}
          />
        }
        eyebrow="Book a consultation"
        title="Book your"
        accent="consultation."
        intro={
          <p>
            Send your request and the branch team confirms your slot on WhatsApp. Prefer to chat
            first? Message us directly.
          </p>
        }
        actions={
          <WhatsAppLink
            number={branch?.whatsapp || whatsapp}
            message={clinicMessages.consultation(branch?.name)}
            side="clinic"
            label="book-hero"
            className={buttonClass('primary', { size: 'lg' })}
          >
            <WhatsAppIcon size={20} />
            Book on WhatsApp
          </WhatsAppLink>
        }
      />

      <section className="border-t border-hairline">
        <Container className="grid gap-16 py-16 lg:grid-cols-[1.5fr_1fr] lg:gap-20 lg:py-24">
          <BookingForm
            branches={branches.map((b) => ({
              id: b.id,
              name: b.name,
              city: b.city,
              note: consultationNote(b),
            }))}
            interests={interests}
            initialBranchId={branch?.id}
            initialInterest={
              treatment ? `t:${treatment.id}` : concern ? `c:${concern.id}` : undefined
            }
            minDate={dates.min}
            maxDate={dates.max}
          />
          <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            <div>
              <p className="label eyebrow">What happens next</p>
              <ol className="mt-8 space-y-6">
                {next.map((step, i) => (
                  <li key={step.title} className="border-t border-line pt-5">
                    <span className="label text-accent">Step {String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-3 text-lg font-semibold text-heading">{step.title}</p>
                    <p className="mt-1">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="border-l-2 border-gold pl-5">
              <p className="font-semibold text-heading">Not sure what you need?</p>
              <p className="mt-2">Send us a photo on WhatsApp for a free assessment.</p>
              <WhatsAppLink
                number={whatsapp}
                message={clinicMessages.photo}
                side="clinic"
                label="book-photo"
                className="link-arrow mt-4"
              >
                Send a photo
              </WhatsAppLink>
            </div>
          </aside>
        </Container>
      </section>
    </>
  )
}
