import type { Metadata } from 'next'

import { TrackLead } from '@/components/analytics/TrackLead'
import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { REFERENCE_PATTERN } from '@/lib/enrollments'
import { getSiteSettings } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Application received',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ ref?: string | string[] }> }

const steps = [
  'Admissions verify your details.',
  'You receive the fee and payment details on WhatsApp.',
  'After payment, your seat is confirmed.',
]

// Shows only the reference, never personal details, because this address can be shared.
export default async function ThankYouPage({ searchParams }: Props) {
  const raw = (await searchParams).ref
  const ref = typeof raw === 'string' && REFERENCE_PATTERN.test(raw) ? raw : null
  const settings = await getSiteSettings()
  const message = ref
    ? `Assalam o Alaikum! Maine website par enrollment form submit kiya hai. Reference: ${ref} (WEB-ENROLL)`
    : academyMessages.page('ENROLL')

  return (
    <>
      {ref && <TrackLead side="academy" label="enrollment" />}
      <PageHero
        eyebrow="Application received"
        title="Shukriya."
        accent="Your application is in."
        intro={
          ref ? (
            <p>
              Your reference is{' '}
              <strong className="whitespace-nowrap font-extrabold text-heading">{ref}</strong>. Keep
              it for your messages with admissions.
            </p>
          ) : (
            <p>Admissions will review your application.</p>
          )
        }
        actions={
          <WhatsAppLink
            number={settings.admissionsWhatsApp}
            message={message}
            side="academy"
            label="thank-you"
            className={buttonClass('primary', { size: 'lg' })}
          >
            <WhatsAppIcon size={20} />
            WhatsApp Karein
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
        </Container>
      </section>
    </>
  )
}
