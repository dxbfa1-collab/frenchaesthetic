import type { Metadata } from 'next'

import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getAcademyCampuses, getCourses, getSiteSettings } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'About the Academy',
  description:
    'French Aesthetics Academy is the training academy of French Medical Aesthetics clinic in Lahore: real practice, named faculty and small batches.',
  alternates: { canonical: '/academy/about' },
}

// FAA brief §4. The founding reason is a suggested narrative, so it shows on staging only.
const values = [
  'Real practice over theory.',
  'Honest claims: we only say what we can prove.',
  'Patient and client safety first.',
  'Small batches, personal attention.',
]

export default async function AcademyAboutPage() {
  const [settings, courses, campuses] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getAcademyCampuses(),
  ])

  const facts = [
    {
      item: 'Courses',
      detail: `${courses.length} (${courses.map((c) => c.shortName).join(', ')})`,
    },
    { item: 'Internship', detail: '2 weeks, included' },
    { item: 'Max seats per batch', detail: '20' },
    { item: 'Campuses', detail: campuses.map((c) => c.shortName || c.name).join(', ') },
    { item: 'Students from', detail: 'Lahore, Gujranwala, Sialkot, Kasur, Daska' },
  ]

  return (
    <>
      <PageHero
        eyebrow="About the academy"
        title="The academy of a clinic."
        accent="Built for real practice."
      />

      <section className="border-t border-hairline">
        <Container className="grid gap-14 py-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:py-24">
          <div data-reveal="" className="max-w-2xl space-y-6 text-lg">
            <p>
              French Aesthetics Academy is the training academy of French Medical Aesthetics clinic
              in Lahore.{' '}
              <Pending confirmed={false}>
                We started the academy because we kept seeing the same gap: people finish short
                courses with a certificate, but without the confidence to treat a real client or
                patient.
              </Pending>
            </p>
            <p>
              So every course we teach has two parts. One week of hands-on training with our
              doctors, followed by a two week supervised internship where you perform treatments
              yourself. The internship is part of the course. There is no separate fee for it.
            </p>
            <p>
              We keep batches small, a maximum of 20 students, so every trainee gets personal
              attention. Our Non-Invasive course is open to beauty professionals and beginners. Our
              Invasive course is only for MBBS and BDS doctors.
            </p>
          </div>
          <div data-reveal="">
            <dl className="divide-y divide-hairline border-y border-hairline">
              {facts.map((fact) => (
                <div key={fact.item} className="grid gap-1 py-4">
                  <dt className="label text-muted">{fact.item}</dt>
                  <dd className="font-semibold text-heading">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className="tone-inverse">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading eyebrow="Our values" title="Proof over" accent="promises." />
          </div>
          <ul data-reveal="" className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {values.map((value) => (
              <li
                key={value}
                className="border-t border-line pt-6 text-xl font-semibold text-heading"
              >
                {value}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand
        title="Reserve"
        accent="your seat."
        intro="Only 20 seats per batch. Admissions share the fee and details on WhatsApp."
      >
        <WhatsAppLink
          number={settings.admissionsWhatsApp}
          message={academyMessages.page('ABOUT')}
          side="academy"
          label="about-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Chat on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
