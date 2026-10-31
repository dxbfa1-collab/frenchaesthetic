import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DoctorCard } from '@/components/clinic/DoctorCard'
import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicDoctors, getSiteSettings } from '@/lib/payload'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Our Doctors in Lahore & Karachi',
  description:
    'Meet the medical team at French Medical Aesthetics in Lahore and Karachi. Every treatment starts with an in-person assessment.',
  alternates: { canonical: '/clinic/doctors' },
}

export default async function DoctorsPage() {
  const [settings, doctors] = await Promise.all([getSiteSettings(), getClinicDoctors()])
  if (doctors.length === 0) notFound()
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Doctors', href: '/clinic/doctors' },
            ]}
          />
        }
        eyebrow="Our team"
        title="The people"
        accent="behind your care."
        intro={
          <p>
            Every plan starts with an in-person assessment by our medical team. Credentials are
            shown exactly as documented.
          </p>
        }
      />

      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          <div data-reveal="" className="grid gap-5 md:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} as="h2" />
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        title="Book a"
        accent="consultation."
        intro="Tell us your preferred branch on WhatsApp, and we will confirm a time with you."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.consultation()}
          side="clinic"
          label="doctors-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Book on WhatsApp
        </WhatsAppLink>
        <ButtonLink href="/clinic/book" variant="outline" size="lg">
          Book a Consultation
        </ButtonLink>
      </CtaBand>
    </>
  )
}
