import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getSiteSettings, getTreatmentCategories, getTreatmentMenu } from '@/lib/payload'
import { TREATMENT_DISCLAIMER } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'

type Props = { params: Promise<{ category: string }> }

export async function generateStaticParams() {
  return (await getTreatmentMenu()).map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = (await getTreatmentMenu()).find((c) => c.slug === slug)
  if (!category) return {}
  return {
    title: `${category.name} in Lahore & Karachi`,
    description:
      category.description ||
      `${category.name} at French Medical Aesthetics. Doctor-led consultation; your price is given at consultation.`,
    alternates: { canonical: `/clinic/treatments/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const [settings, menu] = await Promise.all([getSiteSettings(), getTreatmentMenu()])
  const category = menu.find((c) => c.slug === slug)
  if (!category) {
    // A category with nothing to show yet sends visitors (and old links) to the full list.
    if ((await getTreatmentCategories()).some((c) => c.slug === slug))
      redirect('/clinic/treatments')
    notFound()
  }
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const others = menu.filter((c) => c.id !== category.id)

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Treatments', href: '/clinic/treatments' },
              { label: category.name, href: `/clinic/treatments/${category.slug}` },
            ]}
          />
        }
        eyebrow="Treatments"
        title={category.name}
        intro={category.description && <p>{category.description}</p>}
        actions={
          <>
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.treatment(category.name)}
              side="clinic"
              label={`category-${category.slug}`}
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
          <div data-reveal="" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {category.treatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} as="h2" />
            ))}
          </div>
          {others.length > 0 && (
            <nav aria-label="Other treatment categories" className="mt-16">
              <p className="label text-muted">Other treatments</p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link href={`/clinic/treatments/${other.slug}`} className="chip">
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
        title="Not sure which"
        accent="treatment suits you?"
        intro="Send us a photo on WhatsApp for a free assessment. Your doctor confirms what suits you at an in-person consultation."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.photo}
          side="clinic"
          label={`category-${category.slug}-closing`}
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Send Us a Photo on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
