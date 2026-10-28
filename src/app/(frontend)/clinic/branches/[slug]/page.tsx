import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DoctorCard, doctorBranches } from '@/components/clinic/DoctorCard'
import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { ArrowRightIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { publicImage } from '@/lib/media'
import { getClinicBranches, getClinicDoctors, getSiteSettings, getTreatments } from '@/lib/payload'
import { relationId } from '@/lib/relation'
import { isStaging, siteUrl } from '@/lib/site'
import { consultationNote } from '@/lib/treatments'
import { clinicMessages, telHref } from '@/lib/whatsapp'
import type { Branch } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getClinicBranches()).map((branch) => ({ slug: branch.slug }))
}

async function findBranch(slug: string) {
  return (await getClinicBranches()).find((b) => b.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const branch = await findBranch((await params).slug)
  if (!branch) return {}
  const note = consultationNote(branch)
  return {
    title: `Aesthetic Clinic in ${branch.name}, ${branch.city}`,
    description: `French Medical Aesthetics, ${branch.name}, ${branch.city}.${note ? ` ${note}.` : ''} Doctor-led treatments; book on WhatsApp.`,
    alternates: { canonical: `/clinic/branches/${branch.slug}` },
  }
}

const hoursLine = (line: NonNullable<Branch['hours']>[number]) =>
  [line.days, [line.opens, line.closes].filter(Boolean).join(' to ')].filter(Boolean).join(' · ')

export default async function BranchPage({ params }: Props) {
  const branch = await findBranch((await params).slug)
  if (!branch) notFound()
  const [settings, branches, doctors, treatments] = await Promise.all([
    getSiteSettings(),
    getClinicBranches(),
    getClinicDoctors(),
    getTreatments(),
  ])
  const uan = settings.clinicWhatsApp || settings.clinicPhone
  const whatsapp = branch.whatsapp || uan
  const short = branch.shortName || branch.name
  const note = consultationNote(branch)
  const addressConfirmed = branch.addressStatus === 'confirmed'
  const hoursConfirmed = branch.hoursStatus === 'confirmed'
  const hours = branch.hours ?? []
  const offered = treatments.filter((t) =>
    (t.branches ?? []).some((b) => relationId(b) === branch.id),
  )
  const team = doctors.filter((d) => doctorBranches(d).some((b) => b.id === branch.id))
  const photos = (branch.photos ?? []).map(publicImage).filter((p) => p !== null)
  const others = branches.filter((b) => b.id !== branch.id)

  // Only confirmed facts go into the data search engines read.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: `French Medical Aesthetics, ${branch.name}`,
    url: `${siteUrl}/clinic/branches/${branch.slug}`,
    telephone: telHref(branch.phone || settings.clinicPhone).replace('tel:', ''),
    ...(addressConfirmed && branch.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: branch.address,
            addressLocality: branch.city,
            addressCountry: 'PK',
          },
        }
      : {}),
    ...(branch.mapUrl ? { hasMap: branch.mapUrl } : {}),
    ...(branch.googleBusinessUrl ? { sameAs: [branch.googleBusinessUrl] } : {}),
    ...(photos[0]
      ? { image: photos[0].url!.startsWith('/') ? `${siteUrl}${photos[0].url}` : photos[0].url }
      : {}),
    parentOrganization: {
      '@type': 'MedicalOrganization',
      name: 'French Medical Aesthetics',
      url: `${siteUrl}/clinic`,
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Branches', href: '/clinic/branches' },
              { label: branch.name, href: `/clinic/branches/${branch.slug}` },
            ]}
          />
        }
        eyebrow={`French Medical Aesthetics · ${branch.city}`}
        title={branch.name}
        intro={note && <p className="font-semibold text-heading">{note}</p>}
        actions={
          <>
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.consultation(branch.name)}
              side="clinic"
              label={`branch-page-${branch.slug}`}
              className={buttonClass('primary', { size: 'lg' })}
            >
              <WhatsAppIcon size={20} />
              Book at {short}
            </WhatsAppLink>
            <ButtonLink href={`/clinic/book?branch=${branch.slug}`} variant="outline" size="lg">
              Booking Form
            </ButtonLink>
          </>
        }
        aside={
          <div className="tone-dark rounded-[6px] border border-hairline bg-deep-charcoal p-7 sm:p-9">
            <dl className="divide-y divide-hairline">
              <div className="pb-5">
                <dt className="label text-accent">Address</dt>
                <dd className="mt-2 text-lg text-fg">
                  {branch.address ? (
                    <Pending
                      confirmed={addressConfirmed}
                      fallback={
                        <>
                          {branch.name}, {branch.city}. Ask us on WhatsApp for directions.
                        </>
                      }
                    >
                      {branch.address}
                    </Pending>
                  ) : (
                    <>Ask us on WhatsApp for directions.</>
                  )}
                </dd>
                {branch.landmarkNote && (
                  <dd className="mt-2 text-sm text-muted">Near {branch.landmarkNote}</dd>
                )}
                {branch.parkingNote && (
                  <dd className="mt-1 text-sm text-muted">{branch.parkingNote}</dd>
                )}
                {branch.mapUrl && (
                  <dd className="mt-4">
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="directions_click"
                      data-side="clinic"
                      data-label={branch.slug}
                      className="link-arrow"
                    >
                      <MapPinIcon size={18} className="text-gold" />
                      Get directions
                    </a>
                  </dd>
                )}
              </div>
              <div className="py-5">
                <dt className="label text-accent">Opening hours</dt>
                {hours.length > 0 && (hoursConfirmed || isStaging) ? (
                  hours.map((line) => (
                    <dd key={line.id ?? line.days} className="mt-2 text-lg text-fg">
                      <Pending confirmed={hoursConfirmed}>{hoursLine(line)}</Pending>
                    </dd>
                  ))
                ) : (
                  <dd className="mt-2 text-lg text-fg">
                    <Pending confirmed={false} fallback="Ask us on WhatsApp for today's timings.">
                      Hours not set yet
                    </Pending>
                  </dd>
                )}
              </div>
              <div className="pt-5">
                <dt className="label text-accent">Contact</dt>
                <dd className="mt-3">
                  <WhatsAppLink
                    number={whatsapp}
                    message={clinicMessages.consultation(branch.name)}
                    side="clinic"
                    label={`branch-details-${branch.slug}`}
                    className="inline-flex items-center gap-3 text-lg text-fg hover:text-heading"
                  >
                    <WhatsAppIcon className="text-gold" />
                    WhatsApp {whatsapp}
                  </WhatsAppLink>
                </dd>
                <dd className="mt-3">
                  <a
                    href={telHref(branch.phone || settings.clinicPhone)}
                    data-track="phone_click"
                    data-side="clinic"
                    data-label={`branch-${branch.slug}`}
                    className="inline-flex items-center gap-3 text-lg text-fg hover:text-heading"
                  >
                    <PhoneIcon className="text-gold" />
                    {branch.phone ? `Call ${branch.phone}` : `UAN ${settings.clinicPhone}`}
                  </a>
                </dd>
                {branch.googleBusinessUrl && (
                  <dd className="mt-4">
                    <a
                      href={branch.googleBusinessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arrow"
                    >
                      Reviews on Google <ArrowRightIcon size={18} />
                    </a>
                  </dd>
                )}
              </div>
            </dl>
          </div>
        }
      />

      {photos.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-16 lg:py-24">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <li key={photo.id} className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={photo.url!}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          <div data-reveal="">
            <SectionHeading eyebrow="At this branch" title="Treatments" accent={`at ${short}.`} />
          </div>
          {offered.length > 0 ? (
            <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offered.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} showCategory />
              ))}
            </div>
          ) : (
            <p data-reveal="" className="mt-8 max-w-2xl text-lg">
              Treatments and doctors on duty differ by branch. Ask us on WhatsApp what {short}{' '}
              offers, or see all{' '}
              <Link href="/clinic/treatments" className="link-arrow">
                treatments
              </Link>
              .
            </p>
          )}
          {team.length > 0 && (
            <div data-reveal="" className="mt-14">
              <p className="label text-muted">Doctors at this branch</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {team.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {others.length > 0 && (
        <nav aria-label="Other branches" className="border-t border-hairline">
          <Container className="py-10">
            <p className="label text-muted">Other branches</p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {others.map((other) => (
                <li key={other.id}>
                  <Link href={`/clinic/branches/${other.slug}`} className="chip">
                    {other.name}, {other.city}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}

      <CtaBand
        title={`Visit us at ${short}.`}
        intro="Tell us the treatment you are interested in and a time that suits you. We confirm your slot on WhatsApp."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.consultation(branch.name)}
          side="clinic"
          label={`branch-page-${branch.slug}-closing`}
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Book at {short}
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
