import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { BranchCard } from '@/components/clinic/BranchCard'
import { doctorBranches } from '@/components/clinic/DoctorCard'
import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { credentials, Portrait } from '@/components/ui/Portrait'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicDoctors, getSiteSettings, getTreatments } from '@/lib/payload'
import { doctorPhoto } from '@/lib/images'
import { relationId } from '@/lib/relation'
import { siteUrl } from '@/lib/site'
import { clinicMessages } from '@/lib/whatsapp'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getClinicDoctors()).map((doctor) => ({ slug: doctor.slug }))
}

async function findDoctor(slug: string) {
  return (await getClinicDoctors()).find((d) => d.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doctor = await findDoctor((await params).slug)
  if (!doctor) return {}
  const role = credentials(doctor)
  return {
    title: role ? `${doctor.name}, ${role}` : doctor.name,
    description:
      doctor.bio?.slice(0, 160) ||
      `${doctor.name}${role ? `, ${role},` : ''} at French Medical Aesthetics in Lahore and Karachi.`,
    alternates: { canonical: `/clinic/doctors/${doctor.slug}` },
  }
}

export default async function DoctorPage({ params }: Props) {
  const doctor = await findDoctor((await params).slug)
  if (!doctor) notFound()
  const [settings, treatments] = await Promise.all([getSiteSettings(), getTreatments()])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const role = credentials(doctor)
  const branches = doctorBranches(doctor).filter((b) => b.status === 'active')
  const performs = treatments.filter((t) =>
    (t.doctors ?? []).some((d) => relationId(d) === doctor.id),
  )
  const own = doctorPhoto(doctor.slug)
  const picture =
    doctor.photoConsent && doctor.photo && typeof doctor.photo === 'object' && doctor.photo.url
      ? { src: doctor.photo.url, alt: doctor.photo.alt, position: 'center 20%' }
      : own
  const photo = picture?.src ?? null

  // Person, not Physician: the team includes a physical therapist, and titles stay as documented.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: doctor.name,
    ...(doctor.title ? { jobTitle: doctor.title } : {}),
    url: `${siteUrl}/clinic/doctors/${doctor.slug}`,
    ...(photo ? { image: photo.startsWith('/') ? `${siteUrl}${photo}` : photo } : {}),
    worksFor: {
      '@type': 'MedicalClinic',
      name: 'French Medical Aesthetics',
      url: `${siteUrl}/clinic`,
    },
  }

  const details = [
    ['Qualification', doctor.degrees],
    ['Title', doctor.title],
    ['PMDC registration', doctor.pmdcNumber],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <>
      {doctor.status === 'confirmed' && <JsonLd data={jsonLd} />}

      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Doctors', href: '/clinic/doctors' },
              { label: doctor.name, href: `/clinic/doctors/${doctor.slug}` },
            ]}
          />
        }
        eyebrow={role || 'Our team'}
        title={<Pending confirmed={doctor.status === 'confirmed'}>{doctor.name}</Pending>}
        intro={doctor.bio && <p className="whitespace-pre-line">{doctor.bio}</p>}
        actions={
          <>
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.doctor(doctor.name)}
              side="clinic"
              label={`doctor-${doctor.slug}`}
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
        aside={
          <div className="flex flex-col items-start gap-8 border border-hairline bg-surface p-7 sm:p-9">
            {picture ? (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <Image
                  src={picture.src}
                  alt={picture.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 90vw"
                  className="object-cover"
                  style={{ objectPosition: picture.position ?? 'center 20%' }}
                />
              </div>
            ) : (
              <Portrait person={doctor} size="lg" />
            )}
            {details.length > 0 && (
              <dl className="w-full divide-y divide-hairline border-y border-hairline">
                {details.map(([label, value]) => (
                  <div key={label} className="py-4">
                    <dt className="label text-muted">{label}</dt>
                    <dd className="mt-1.5 text-lg font-semibold text-heading">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        }
      />

      {performs.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-16 lg:py-24">
            <div data-reveal="">
              <SectionHeading eyebrow="Treatments" title="Treatments" accent="performed." />
            </div>
            <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {performs.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} showCategory />
              ))}
            </div>
          </Container>
        </section>
      )}

      {branches.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-16 lg:py-24">
            <div data-reveal="">
              <SectionHeading eyebrow="Where" title="Branches" />
            </div>
            <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} whatsapp={whatsapp} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand
        title="Book a"
        accent="consultation."
        intro="Tell us your preferred branch on WhatsApp, and we will confirm a time with you."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.doctor(doctor.name)}
          side="clinic"
          label={`doctor-${doctor.slug}-closing`}
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Book on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
