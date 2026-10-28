import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getConcerns, getSiteSettings, getTreatmentsFor } from '@/lib/payload'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Skin Concerns',
  description:
    'Acne, pigmentation, fine lines, sagging skin and more: find the treatments a doctor may suggest at French Medical Aesthetics in Lahore and Karachi.',
  alternates: { canonical: '/clinic/concerns' },
}

export default async function ConcernsPage() {
  const [settings, concerns] = await Promise.all([getSiteSettings(), getConcerns()])
  const withTreatments = await Promise.all(
    concerns.map(async (concern) => ({ concern, treatments: await getTreatmentsFor(concern) })),
  )
  if (concerns.length === 0) notFound()
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Concerns', href: '/clinic/concerns' },
            ]}
          />
        }
        eyebrow="Concerns"
        title="What would you"
        accent="like to improve?"
        intro={
          <p>
            Start with what bothers you. Each concern lists the treatments your doctor may suggest.
            What suits you is always decided at an in-person consultation.
          </p>
        }
      />

      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          <ul data-reveal="" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {withTreatments.map(({ concern, treatments }) => (
              <li
                key={concern.id}
                className="relative flex flex-col border border-hairline bg-surface p-7 transition-colors hover:border-line sm:p-8"
              >
                <h2 className="text-[1.75rem] leading-tight sm:text-[2rem]">
                  <Link
                    href={`/clinic/concerns/${concern.slug}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    <Pending confirmed={concern.status === 'confirmed'}>{concern.name}</Pending>
                  </Link>
                </h2>
                {concern.description && <p className="mt-3">{concern.description}</p>}
                {treatments.length > 0 && (
                  <p className="mt-5 text-sm text-muted">
                    {treatments
                      .slice(0, 3)
                      .map((t) => t.name)
                      .join(' · ')}
                    {treatments.length > 3 && ' · more'}
                  </p>
                )}
                <span aria-hidden="true" className="link-arrow mt-auto self-start pt-6">
                  See options <ArrowRightIcon size={18} />
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand
        title="Not on the list?"
        accent="Send us a photo."
        intro="Tell us what concerns you on WhatsApp. Your doctor confirms what suits you at an in-person consultation."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.photo}
          side="clinic"
          label="concerns-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Send Us a Photo on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
