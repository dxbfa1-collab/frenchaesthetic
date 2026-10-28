import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Numerals } from '@/components/ui/Numerals'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getResults, getSiteSettings, getTreatments } from '@/lib/payload'
import { relationId } from '@/lib/relation'
import { treatmentHref } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'
import type { Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Before and After',
  description:
    'Before and after photos from French Medical Aesthetics, shown with each patient’s written consent. Individual results vary.',
  alternates: { canonical: '/clinic/results' },
}

/** Consented cases only, each labelled "individual results vary" (brief §7 and §9). */
export default async function ResultsPage() {
  const [settings, results, treatments] = await Promise.all([
    getSiteSettings(),
    getResults(),
    getTreatments(),
  ])
  if (results.length === 0) notFound()
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const groups = treatments
    .map((treatment) => ({
      treatment,
      cases: results.filter((r) => relationId(r.treatment) === treatment.id),
    }))
    .filter((group) => group.cases.length > 0)

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Before and after', href: '/clinic/results' },
            ]}
          />
        }
        eyebrow="Before and after"
        title="Real patients,"
        accent="shared with consent."
        intro={
          <p>
            Every case here is shown with the patient&apos;s written consent. Individual results
            vary, and your doctor explains what to expect for your skin at consultation.
          </p>
        }
      />

      {groups.map(({ treatment, cases }) => (
        <section key={treatment.id} className="border-t border-hairline">
          <Container className="py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[2rem] sm:text-[2.5rem]">
                <Numerals>{treatment.name}</Numerals>
              </h2>
              <Link href={treatmentHref(treatment)} className="link-arrow">
                About this treatment
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 lg:grid-cols-2">
              {cases.map((result) => (
                <li key={result.id}>
                  <div className="grid grid-cols-2 gap-2">
                    {(['before', 'after'] as const).map((side) => {
                      const photo = result[side] as Media
                      return (
                        <figure key={side} className="relative aspect-square overflow-hidden">
                          <Image
                            src={photo.url!}
                            alt={photo.alt}
                            fill
                            sizes="(min-width: 1024px) 300px, 50vw"
                            className="object-cover"
                          />
                          <figcaption className="pill absolute left-3 top-3">
                            {side === 'before' ? 'Before' : 'After'}
                          </figcaption>
                        </figure>
                      )
                    })}
                  </div>
                  <p className="mt-4 font-semibold text-heading">{result.caption}</p>
                  <p className="mt-1 text-sm text-muted">
                    {[result.sessions, result.timeBetween, 'Individual results vary']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ))}

      <CtaBand
        title="Talk it through"
        accent="with a doctor."
        intro="Send us a photo on WhatsApp for a free assessment. Suitability is confirmed at an in-person consultation."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.photo}
          side="clinic"
          label="results-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Send Us a Photo on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
