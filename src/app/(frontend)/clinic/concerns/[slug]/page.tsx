import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getConcerns, getSiteSettings, getTreatmentsFor } from '@/lib/payload'
import { TREATMENT_DISCLAIMER } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getConcerns()).map((concern) => ({ slug: concern.slug }))
}

async function findConcern(slug: string) {
  return (await getConcerns()).find((c) => c.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const concern = await findConcern((await params).slug)
  if (!concern) return {}
  return {
    title: `${concern.name} Treatment in Lahore & Karachi`,
    description:
      concern.description ||
      `Treatments for ${concern.name.toLowerCase()} at French Medical Aesthetics. Doctor-led consultation.`,
    alternates: { canonical: `/clinic/concerns/${concern.slug}` },
  }
}

export default async function ConcernPage({ params }: Props) {
  const concern = await findConcern((await params).slug)
  if (!concern) notFound()
  const [settings, concerns, treatments] = await Promise.all([
    getSiteSettings(),
    getConcerns(),
    getTreatmentsFor(concern),
  ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const others = concerns.filter((c) => c.id !== concern.id)

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Concerns', href: '/clinic/concerns' },
              { label: concern.name, href: `/clinic/concerns/${concern.slug}` },
            ]}
          />
        }
        eyebrow="Concern"
        title={<Pending confirmed={concern.status === 'confirmed'}>{concern.name}</Pending>}
        intro={concern.description && <p>{concern.description}</p>}
        actions={
          <>
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.concern(concern.name.toLowerCase())}
              side="clinic"
              label={`concern-${concern.slug}`}
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
        note={TREATMENT_DISCLAIMER}
      />

      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Options"
              title="Treatments your doctor"
              accent="may suggest."
              intro="Often more than one option can help. Your doctor explains which suits your skin, and why, at consultation."
            />
          </div>
          {treatments.length > 0 ? (
            <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {treatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} showCategory />
              ))}
            </div>
          ) : (
            <p data-reveal="" className="mt-10 max-w-2xl text-lg">
              Tell us about it on WhatsApp, and your doctor will suggest options at consultation.
            </p>
          )}
          {others.length > 0 && (
            <nav aria-label="Other concerns" className="mt-16">
              <p className="label text-muted">Other concerns</p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link href={`/clinic/concerns/${other.slug}`} className="chip">
                      {other.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </section>

      <CtaBand
        title="Not sure where"
        accent="to start?"
        intro="Send us a photo on WhatsApp for a free assessment. Your doctor confirms what suits you at an in-person consultation."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.photo}
          side="clinic"
          label={`concern-${concern.slug}-closing`}
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Send Us a Photo on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
