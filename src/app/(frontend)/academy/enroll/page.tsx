import type { Metadata } from 'next'

import { campusName, seatStatus } from '@/components/academy/BatchList'
import { type BatchOption, type CourseOption, EnrollForm } from '@/components/academy/EnrollForm'
import { WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { formatBatchDate } from '@/lib/batches'
import { getCourses, getSiteSettings, getUpcomingBatches } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Enroll in an Aesthetics Course',
  description:
    'Apply online for the Non-Invasive or Invasive aesthetics course in Lahore. Admissions verify your details, then share the fee and payment details on WhatsApp.',
  alternates: { canonical: '/academy/enroll' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? ''

export default async function EnrollPage({ searchParams }: Props) {
  const params = await searchParams
  const [settings, courses, batches] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getUpcomingBatches(),
  ])

  const open = batches.filter((b) => b.status === 'open' && !seatStatus(b).full)
  const preBatch = open.find((b) => b.id === first(params.batch))
  const preCourseId =
    preBatch?.course.id ?? courses.find((c) => c.slug === first(params.course))?.id
  const from = /^WEB-[A-Z0-9-]{1,30}$/.test(first(params.from)) ? first(params.from) : 'WEB-ENROLL'

  // Only plain data crosses to the client form: no settings, notes or other private fields.
  const courseOptions: CourseOption[] = courses.map((c) => ({
    id: c.id,
    shortName: c.shortName,
    label: c.hero.label ?? '',
    requiresPMDC: Boolean(c.requiresPMDC),
    audience: c.audience ?? [],
  }))
  const batchOptions: BatchOption[] = open.map((b) => ({
    id: b.id,
    courseId: b.course.id,
    label: [
      formatBatchDate(b.startDate),
      campusName(b) ?? 'Campus to confirm',
      b.factStatus === 'confirmed' ? null : '(date to confirm)',
    ]
      .filter(Boolean)
      .join(' · '),
  }))

  return (
    <>
      <PageHero
        eyebrow="Enroll"
        title="Apply for"
        accent="your seat."
        intro={
          <p>
            Fill in the form. Admissions verify your details, then share the fee and payment details
            on WhatsApp.
          </p>
        }
      />
      <section className="border-t border-hairline">
        <Container className="grid gap-14 py-16 lg:grid-cols-[1.6fr_1fr] lg:gap-20 lg:py-24">
          <EnrollForm
            courses={courseOptions}
            batches={batchOptions}
            initialCourseId={preCourseId}
            initialBatchId={preBatch?.id}
            from={from}
          />
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <OfferPanel
              title="What happens next"
              points={[
                'Admissions verify your details',
                'You get the fee and payment details on WhatsApp',
                'Your seat is confirmed after payment',
              ]}
            />
            <div className="border-l-2 border-gold pl-5">
              <p className="font-bold text-heading">Prefer WhatsApp?</p>
              <WhatsAppLink
                number={settings.admissionsWhatsApp}
                message={academyMessages.page('ENROLL')}
                side="academy"
                label="enroll-aside"
                className="link-arrow mt-2"
              >
                <WhatsAppIcon size={18} className="text-gold" />
                Chat on WhatsApp: {settings.admissionsWhatsApp}
              </WhatsAppLink>
            </div>
          </aside>
        </Container>
      </section>
    </>
  )
}
