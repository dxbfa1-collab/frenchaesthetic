import type { Metadata } from 'next'
import { Award, Sparkles, Stethoscope } from 'lucide-react'
import Link from 'next/link'

import { BatchCalendar, type CalendarBatch } from '@/components/academy/BatchCalendar'
import { campusName, seatStatus } from '@/components/academy/BatchList'
import { JourneyTimeline } from '@/components/academy/JourneyTimeline'
import { CourseCard } from '@/components/academy/CourseCard'
import { TrainerCard } from '@/components/academy/TrainerCard'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { HeroSlider, type Slide } from '@/components/motion/HeroSlider'
import { Marquee } from '@/components/motion/Marquee'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TopicOverview } from '@/components/ui/TopicOverview'
import { TopicIcon } from '@/components/ui/TopicIcon'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { batchRuleSentence, formatBatchDate, pktDateKey } from '@/lib/batches'
import {
  getAcademyFaqs,
  getCourses,
  getSiteSettings,
  getTrainers,
  getUpcomingBatches,
} from '@/lib/payload'
import { SITE_PHOTOS } from '@/lib/images'
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
  const calendar: CalendarBatch[] = batches.map((batch) => {
    const seats = seatStatus(batch)
    const place = campusName(batch)
    return {
      id: batch.id,
      course: batch.course.shortName,
      primary: batch.course.id === courses[0]?.id,
      dateKey: pktDateKey(batch.startDate),
      dateLabel: formatBatchDate(batch.startDate),
      place: place ? `${place}, Lahore` : 'Lahore',
      seats: `Max ${batch.totalSeats} seats · ${seats.text}`,
      full: seats.full,
      enrollHref: `/academy/enroll?batch=${batch.id}&from=WEB-HOME`,
    }
  })

  const nonInvasive = courses.find((c) => c.track === 'nonInvasive')
  const invasive = courses.find((c) => c.track === 'invasive')
  const chat = (message: string, place: string, label = 'Chat on WhatsApp') => (
    <WhatsAppLink
      number={whatsapp}
      message={message}
      side="academy"
      label={place}
      className={buttonClass('primary', { size: 'lg' })}
    >
      <WhatsAppIcon size={20} />
      {label}
    </WhatsAppLink>
  )

  // Owner, 29 Oct 2026: a slider of 2–3 slides on the academy home.
  const slides: Slide[] = [
    {
      id: 'practice',
      eyebrow: 'Aesthetics Training Academy · Lahore',
      title: 'More than a certificate.',
      accent: 'Real practice.',
      text: '1 week of hands-on training + a 2-week supervised internship, with no separate internship fee.',
      image: SITE_PHOTOS.supervisedPractice,
      badge: { icon: <Award size={22} />, label: '2-week internship included' },
      actions: (
        <>
          {chat(academyMessages.page('HOME'), 'slider-practice')}
          <ButtonLink href="/academy/enroll" variant="outline" size="lg">
            Enroll Now
          </ButtonLink>
        </>
      ),
    },
    ...(nonInvasive
      ? [
          {
            id: 'non-invasive',
            eyebrow: nonInvasive.hero.label || 'Non-Invasive Aesthetics',
            title: nonInvasive.hero.headline,
            accent: nonInvasive.hero.headlineAccent ?? undefined,
            text: nonInvasive.summary ?? '',
            image: SITE_PHOTOS.facialPractice,
            badge: { icon: <Sparkles size={22} />, label: 'No experience needed' },
            actions: (
              <>
                {chat(homeMessage.nonInvasive, 'slider-non-invasive')}
                <ButtonLink href={`/academy/${nonInvasive.slug}`} variant="outline" size="lg">
                  View course
                </ButtonLink>
              </>
            ),
          },
        ]
      : []),
    ...(invasive
      ? [
          {
            id: 'invasive',
            eyebrow: invasive.hero.label || 'Invasive Aesthetics',
            title: 'Aesthetic medicine,',
            accent: 'practised on real patients.',
            text: invasive.summary ?? '',
            image: SITE_PHOTOS.anatomyClass,
            badge: { icon: <Stethoscope size={22} />, label: 'For PMDC-registered doctors' },
            actions: (
              <>
                {chat(homeMessage.invasive, 'slider-invasive')}
                <ButtonLink href={`/academy/${invasive.slug}`} variant="outline" size="lg">
                  View course
                </ButtonLink>
              </>
            ),
          },
        ]
      : []),
  ]

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
      <HeroSlider slides={slides} label="French Aesthetics Academy highlights" />

      {/* Next batches strip and what you practise */}
      <div className="border-y border-hairline">
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4 text-[0.9375rem]">
          <span className="inline-flex items-center gap-2 font-bold text-heading">
            <TopicIcon topic="calendar" size={18} className="text-accent" />
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
              </>
            ) : (
              batchRuleSentence(courses)
            )}
          </span>
          <span className="inline-flex items-center gap-2 text-muted">
            <TopicIcon topic="seats" size={18} className="text-accent" />
            Max 20 seats{campus && ` · ${campus}, Lahore`}
          </span>
          <Link href="/academy/batches" className="link-arrow ml-auto">
            All batches <ArrowRightIcon size={18} />
          </Link>
        </Container>
      </div>
      <Marquee
        label="What you practise"
        items={[...new Set(courses.flatMap((c) => c.featured ?? []))].map((topic) => ({
          label: topic,
          topic: 'training',
        }))}
      />

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

      <JourneyTimeline />

      {/* Next batches */}
      {calendar.length > 0 && (
        <BatchCalendar
          batches={calendar}
          intro={`${batchRuleSentence(courses)} There is no training on Sundays, so a Sunday start moves to Monday.`}
          whatsapp={whatsapp}
        />
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

      <TopicOverview
        title="French Aesthetics Academy"
        accent="at a glance."
        points={[
          {
            heading: 'Who we are',
            text: 'French Aesthetics Academy is the training academy of French Medical Aesthetics clinic, based in Lahore. Training is hands-on and taught by a dermatologist-led team.',
          },
          {
            heading: 'Which course to choose',
            text: 'Choose Non-Invasive if you work in beauty or are starting out: no experience or PMDC registration is needed. Choose Invasive if you are a PMDC-registered MBBS or BDS doctor.',
          },
          {
            heading: 'How training is structured',
            text: 'Each course is 1 week of training followed by a 2-week supervised internship, 3 weeks in all. There is no training on Sundays.',
          },
        ]}
      />

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
        title="Reserve"
        accent="your seat."
        intro="Only 20 seats per batch. Admissions share the fee and details on WhatsApp."
      >
        <WhatsAppLink
          number={whatsapp}
          message={academyMessages.page('HOME')}
          side="academy"
          label="academy-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Chat on WhatsApp: <span className="whitespace-nowrap">{whatsapp}</span>
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
