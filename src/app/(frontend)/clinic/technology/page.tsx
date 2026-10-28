import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getSiteSettings, getTreatments } from '@/lib/payload'
import { TECHNOLOGIES, treatmentHref } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Technology',
  description:
    'Focused ultrasound, radiofrequency microneedling, medical lasers and AI skin analysis at French Medical Aesthetics, explained in plain words.',
  alternates: { canonical: '/clinic/technology' },
}

export default async function TechnologyPage() {
  const [settings, treatments] = await Promise.all([getSiteSettings(), getTreatments()])
  // A technology is listed only when a treatment that uses it is shown.
  const technologies = TECHNOLOGIES.map((tech) => ({
    ...tech,
    uses: treatments.filter((t) => tech.treatments.includes(t.slug)),
  })).filter((tech) => tech.uses.length > 0)
  if (technologies.length === 0) notFound()
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Technology', href: '/clinic/technology' },
            ]}
          />
        }
        eyebrow="Technology"
        title="Modern technology,"
        accent="explained plainly."
        intro={
          <p>
            We describe our treatments by the kind of technology they use, not by machine brand.
            Your doctor chooses the technology and its settings for your skin, and can tell you more
            about it at consultation.
          </p>
        }
      />

      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          <ol data-reveal="" className="divide-y divide-hairline border-y border-hairline">
            {technologies.map((tech, i) => (
              <li
                key={tech.name}
                className="grid gap-6 py-10 lg:grid-cols-[5rem_1fr_1fr] lg:gap-12 lg:py-14"
              >
                <span className="label text-accent">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="text-[2rem] leading-tight sm:text-[2.5rem]">{tech.name}</h2>
                  <p className="mt-4 text-lg">{tech.text}</p>
                </div>
                <div className="lg:pt-2">
                  <p className="label text-muted">Used in</p>
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {tech.uses.map((treatment) => (
                      <li key={treatment.id}>
                        <Link href={treatmentHref(treatment)} className="chip">
                          {treatment.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-sm text-muted">
            Results vary from person to person. Every treatment is subject to an in-person medical
            assessment.
          </p>
        </Container>
      </section>

      <CtaBand
        title="Which technology"
        accent="suits your skin?"
        intro="Send us a photo on WhatsApp for a free assessment. Your doctor confirms what suits you at an in-person consultation."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.photo}
          side="clinic"
          label="technology-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Send Us a Photo on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
