import type { Metadata } from 'next'
import Link from 'next/link'

import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { cn } from '@/lib/cn'
import { getSiteSettings, getTreatmentMenu } from '@/lib/payload'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Treatments',
  description:
    'Face lifting and tightening, facials, lasers and injectables at French Medical Aesthetics in Lahore and Karachi. Doctor-led consultation; your price is given at consultation.',
  alternates: { canonical: '/clinic/treatments' },
}

export default async function TreatmentsPage() {
  const [settings, menu] = await Promise.all([getSiteSettings(), getTreatmentMenu()])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Treatments', href: '/clinic/treatments' },
            ]}
          />
        }
        eyebrow="Treatments"
        title="Treatments chosen"
        accent="for your skin."
        intro={
          <p>
            Every treatment starts with a consultation. Your doctor assesses your skin, explains
            what will suit you and what it will not do, and gives you a clear quote before anything
            begins.
          </p>
        }
        actions={
          <>
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.consultation()}
              side="clinic"
              label="treatments-hero"
              className={buttonClass('primary', { size: 'lg' })}
            >
              <WhatsAppIcon size={20} />
              Ask on WhatsApp
            </WhatsAppLink>
            <ButtonLink href="/clinic/book" variant="outline" size="lg">
              Book a Consultation
            </ButtonLink>
          </>
        }
      />

      {menu.length > 0 ? (
        <>
          <nav aria-label="Treatment categories" className="border-y border-hairline">
            <Container>
              <ul className="flex gap-2.5 overflow-x-auto py-5">
                {menu.map((category) => (
                  <li key={category.id} className="shrink-0">
                    <a href={`#${category.slug}`} className="chip">
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </nav>

          {menu.map((category, i) => (
            <section
              key={category.id}
              id={category.slug}
              className={cn('scroll-mt-20', i > 0 && 'border-t border-hairline')}
            >
              <Container className="py-16 lg:py-24">
                <div
                  data-reveal=""
                  className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
                >
                  <SectionHeading title={category.name} intro={category.description ?? undefined} />
                  <Link
                    href={`/clinic/treatments/${category.slug}`}
                    className="link-arrow shrink-0"
                  >
                    {category.name} <ArrowRightIcon size={18} />
                  </Link>
                </div>
                <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {category.treatments.map((treatment) => (
                    <TreatmentCard key={treatment.id} treatment={treatment} />
                  ))}
                </div>
              </Container>
            </section>
          ))}
        </>
      ) : (
        <section className="border-t border-hairline">
          <Container className="py-16">
            <p className="max-w-2xl text-lg">
              Our treatment pages are being prepared. Ask us on WhatsApp about any treatment, and we
              will tell you which branch offers it.
            </p>
          </Container>
        </section>
      )}

      <CtaBand
        title="Not sure where"
        accent="to start?"
        intro="Send us a photo on WhatsApp for a free assessment. Your doctor confirms what suits you at an in-person consultation."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.photo}
          side="clinic"
          label="treatments-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Send Us a Photo on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
