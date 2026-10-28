import type { Metadata } from 'next'
import Link from 'next/link'

import { TrackLead } from '@/components/analytics/TrackLead'
import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicBranches, getSiteSettings } from '@/lib/payload'
import { referencePattern } from '@/lib/reference'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Booking request received',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ ref?: string | string[]; branch?: string | string[] }> }

const REFERENCE = referencePattern('FMA')

const steps = [
  'The branch team receives your request.',
  'They message you on WhatsApp to confirm a time.',
  'At your consultation, you receive a clear quote before any treatment.',
]

// Shows only the reference and branch, never personal details, because this address can be shared.
export default async function BookingThankYouPage({ searchParams }: Props) {
  const query = await searchParams
  const ref = typeof query.ref === 'string' && REFERENCE.test(query.ref) ? query.ref : null
  const [settings, branches] = await Promise.all([getSiteSettings(), getClinicBranches()])
  const branch = branches.find((b) => b.slug === query.branch)
  const whatsapp = branch?.whatsapp || settings.clinicWhatsApp || settings.clinicPhone
  const message =
    ref && branch
      ? clinicMessages.booked(ref, branch.name)
      : clinicMessages.consultation(branch?.name)

  return (
    <>
      {ref && <TrackLead side="clinic" label="booking" />}
      <PageHero
        eyebrow="Request received"
        title="Thank you."
        accent="Your request is in."
        intro={
          <p>
            {branch ? `Our team at ${branch.name} will` : 'Our team will'} message you on WhatsApp
            to confirm your slot.
            {ref && (
              <>
                {' '}
                Your reference is{' '}
                <strong className="whitespace-nowrap font-extrabold text-heading">{ref}</strong>.
              </>
            )}
          </p>
        }
        actions={
          <WhatsAppLink
            number={whatsapp}
            message={message}
            side="clinic"
            label="booking-thank-you"
            className={buttonClass('primary', { size: 'lg' })}
          >
            <WhatsAppIcon size={20} />
            {branch ? `Message ${branch.shortName || branch.name}` : 'Message us on WhatsApp'}
          </WhatsAppLink>
        }
      />
      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-20">
          <p className="label eyebrow">What happens next</p>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <li key={step} className="border-t border-line pt-6">
                <span className="label text-accent">Step {String(i + 1).padStart(2, '0')}</span>
                <p className="mt-4 text-xl font-semibold text-heading">{step}</p>
              </li>
            ))}
          </ol>
          <Link href="/clinic/treatments" className="link-arrow mt-12">
            Explore treatments
          </Link>
        </Container>
      </section>
    </>
  )
}
