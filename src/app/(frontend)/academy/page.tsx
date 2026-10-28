import type { Metadata } from 'next'
import Link from 'next/link'

import { BatchList, campusName } from '@/components/academy/BatchList'
import { CourseCard } from '@/components/academy/CourseCard'
import { TrainerCard } from '@/components/academy/TrainerCard'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { batchRuleSentence, formatBatchDate } from '@/lib/batches'
import {
  getAcademyFaqs,
  getCourses,
  getSiteSettings,
  getTrainers,
  getUpcomingBatches,
} from '@/lib/payload'
import { siteUrl } from '@/lib/site'
import { academyMessages, telHref } from '@/lib/whatsapp'

// Meta title and description from the FAA brief's SEO starter pack (§14).
export const metadata: Metadata = {
  title: { absolute: 'French Aesthetics Academy · Aesthetics Training Lahore' },
  description:
    'Aesthetics courses in Lahore with 2 weeks supervised internship included. Non-Invasive for beauty pros, Invasive for MBBS & BDS doctors.',
  alternates: { canonical: '/academy' },
}

export const revalidate = 3600

// Copy is verbatim from the FAA brief §3 (hooks in Roman Urdu, details in English).
const whyUs = [
  '2 weeks internship included. No extra fee.',
  'Hands-on on real clients and patients, under supervision.',
  'Max 20 seats per batch, personal attention.',
  'Dermatologist-led team, inside a working clinic.',
]

const journey = [
  { week: 'Week 1', text: 'Hands-on training with trainers.' },
  { week: 'Week 2', text: 'Internship, you perform treatments yourself, supervised.' },
  { week: 'Week 3', text: 'Supervised practice until you work with confidence.' },
]

// The two home buttons carry their own WEB codes (FAA brief §15).
const homeMessage = {
  nonInvasive: academyMessages.homeNonInvasive,
  invasive: academyMessages.homeInvasive,
}

export default async function AcademyHome() {
  const [settings, courses, batches, trainers, faqs] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getUpcomingBatches(),
    getTrainers(),
    getAcademyFaqs(),
  ])
  const whatsapp = settings.admissionsWhatsApp
  const nextByCourse = courses
    .map((course) => batches.find((b) => b.course.id === course.id))
    .filter((b): b is (typeof batches)[number] => Boolean(b))
  const campus = nextByCourse.map(campusName).find(Boolean)
  const generalFaqs = faqs.filter((f) => !f.course).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'French Aesthetics Academy',
    url: `${siteUrl}/academy`,
    logo: `${siteUrl}/brand/faa/stacked-white.png`,
    telephone: telHref(whatsapp).replace('tel:', ''),
    ...(settings.academyEmail ? { email: settings.academyEmail } : {}),
    sameAs: [settings.academyInstagram, settings.academyFacebook].filter(Boolean),
    address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressCountry: 'PK' },
    parentOrganization: { '@type': 'MedicalOrganization', name: 'French Medical Aesthetics' },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Hero */}
      <section>
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <p className="label eyebrow rise">Aesthetics Training Academy · Lahore</p>
            <h1 className="rise rise-2 mt-6 text-[2.875rem] sm:text-6xl lg:text-[4.75rem]">
              Sirf certificate nahi.
              <span className="block italic text-accent">Real practice.</span>
            </h1>
            <p className="rise rise-3 mt-7 max-w-xl text-lg sm:text-xl">
              1 week hands-on training + 2 weeks supervised internship. Internship ki koi alag fee
              nahi.
            </p>
            <div className="rise rise-3 mt-10 grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <WhatsAppLink
                  key={course.id}
                  number={whatsapp}
                  message={homeMessage[course.track]}
                  side="academy"
                  label={`hero-${course.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-[6px] border-[1.5px] border-gold px-5 py-4 transition-colors hover:bg-gold/15"
                >
                  <span>
                    <span className="block font-extrabold text-heading">
                      {course.shortName} Course
                    </span>
                    {course.hero.label && (
                      <span className="block text-sm text-muted">
                        {course.hero.label.replace(/^For /, 'for ')}
                      </span>
                    )}
                  </span>
                  <WhatsAppIcon size={22} className="shrink-0 text-gold" />
                </WhatsAppLink>
              ))}
            </div>
            <p className="rise rise-3 mt-6 text-[0.9375rem] text-muted">
              {nextByCourse.length > 0 ? (
                <>
                  Next batch:{' '}
                  {nextByCourse.map((batch, i) => (
                    <span key={batch.id}>
                      {i > 0 && ' · '}
                      <Pending confirmed={batch.factStatus === 'confirmed'}>
                        {formatBatchDate(batch.startDate, 'long')}
                      </Pending>{' '}
                      ({batch.course.shortName})
                    </span>
                  ))}
                  {campus && ` · ${campus}, Lahore`} · Max 20 seats
                </>
              ) : (
                <>{batchRuleSentence(courses)} Max 20 seats.</>
              )}
            </p>
          </div>
          <OfferPanel
            className="rise rise-3"
            title="Every course"
            points={['1 Week Training', '2 Weeks Internship', 'Real Practice', 'Max 20 Seats']}
            footer={<>WhatsApp {whatsapp}</>}
          />
        </Container>
      </section>

      {/* Choose your path */}
      <section className="border-t border-hairline">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading eyebrow="Choose your path" title="Which course" accent="is for you?" />
          </div>
          <div data-reveal="" className="mt-14 grid gap-5 lg:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                nextBatch={batches.find((b) => b.course.id === course.id)}
                whatsapp={whatsapp}
                whatsappMessage={homeMessage[course.track]}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Why us */}
      <section className="tone-inverse">
        <Container className="grid gap-14 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Why French Aesthetics Academy"
              title="Proof over"
              accent="promises."
            />
          </div>
          <ol data-reveal="" className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {whyUs.map((point, i) => (
              <li key={point} className="border-t border-line pt-6">
                <span className="label text-accent">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-3 text-xl font-semibold text-heading">{point}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* How it works */}
      <section>
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading eyebrow="How it works" title="From training" accent="to confidence." />
          </div>
          <ol data-reveal="" className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {journey.map((step) => (
              <li key={step.week} className="border-t border-line pt-6">
                <span className="label text-accent">{step.week}</span>
                <p className="mt-4 text-xl font-semibold text-heading">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Next batches */}
      {batches.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Next batches" title="Choose" accent="your start date." />
            </div>
            <div data-reveal="" className="mt-12">
              <BatchList batches={batches.slice(0, 4)} whatsapp={whatsapp} from="WEB-HOME" />
            </div>
            <Link href="/academy/batches" className="link-arrow mt-8">
              Full batch calendar <ArrowRightIcon size={18} />
            </Link>
          </Container>
        </section>
      )}

      {/* Faculty and proof */}
      <section className="border-t border-hairline">
        <Container className="grid gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Faculty"
              title="Dermatologist-led,"
              accent="inside a working clinic."
            />
            <div className="mt-10 space-y-4">
              {trainers.slice(0, 4).map((trainer) => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
            <Link href="/academy/faculty" className="link-arrow mt-8">
              Meet the faculty <ArrowRightIcon size={18} />
            </Link>
          </div>
          <div data-reveal="" className="lg:pt-24">
            <p className="label eyebrow">Our students</p>
            <p className="mt-5 font-display text-[2rem] leading-tight text-heading sm:text-[2.5rem]">
              Students have joined from Lahore, Gujranwala, Sialkot, Kasur and Daska.
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ preview */}
      {generalFaqs.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Questions" title="Questions," accent="answered." />
              <Link href="/academy/faq" className="link-arrow mt-8">
                All questions <ArrowRightIcon size={18} />
              </Link>
            </div>
            <div data-reveal="">
              <FaqList items={generalFaqs} />
            </div>
          </Container>
        </section>
      )}

      <CtaBand
        title="Apni seat"
        accent="reserve karein."
        intro="Sirf 20 seats per batch. Fee aur details WhatsApp par."
      >
        <WhatsAppLink
          number={whatsapp}
          message={academyMessages.page('HOME')}
          side="academy"
          label="academy-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          WhatsApp Karein: <span className="whitespace-nowrap">{whatsapp}</span>
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
