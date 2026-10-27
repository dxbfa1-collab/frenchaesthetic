import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BatchList, campusName } from '@/components/academy/BatchList'
import { TrainerCard } from '@/components/academy/TrainerCard'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { Numerals } from '@/components/ui/Numerals'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { formatBatchDate, pktDateKey } from '@/lib/batches'
import {
  getAcademyFaqs,
  getCourse,
  getCourses,
  getSiteSettings,
  getUpcomingBatches,
  visible,
} from '@/lib/payload'
import { relationId } from '@/lib/relation'
import { siteUrl } from '@/lib/site'
import { webCode } from '@/lib/whatsapp'
import type { Doctor } from '@/payload-types'

// Batches move from "upcoming" to past by date, so the page refreshes hourly as well as on edits.
export const revalidate = 3600

type Props = { params: Promise<{ course: string }> }

export async function generateStaticParams() {
  return (await getCourses()).map((course) => ({ course: course.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse((await params).course)
  if (!course) return {}
  return {
    title: { absolute: course.metaTitle || `${course.name} · French Aesthetics Academy` },
    description: course.metaDescription || course.summary || undefined,
    alternates: { canonical: `/academy/${course.slug}` },
  }
}

export default async function CoursePage({ params }: Props) {
  const course = await getCourse((await params).course)
  if (!course) notFound()

  const [settings, allBatches, allFaqs, courses] = await Promise.all([
    getSiteSettings(),
    getUpcomingBatches(),
    getAcademyFaqs(),
    getCourses(),
  ])
  const whatsapp = settings.admissionsWhatsApp
  const code = webCode(course.whatsappMessage) ?? 'WEB-COURSE'
  const batches = allBatches.filter((b) => b.course.id === course.id)
  const next = batches[0]
  const faqs = allFaqs.filter((f) => relationId(f.course) === course.id)
  const trainers = (course.trainers ?? []).filter(
    (t): t is Doctor => typeof t === 'object' && t !== null && visible(t.status),
  )
  const glance = (course.glance ?? []).filter((row) => visible(row.status))
  const modules = course.modules ?? []
  const otherCourse = courses.find((c) => c.id !== course.id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.metaDescription || course.summary,
    url: `${siteUrl}/academy/${course.slug}`,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'French Aesthetics Academy',
      url: `${siteUrl}/academy`,
    },
    hasCourseInstance: batches
      .filter((b) => b.factStatus === 'confirmed')
      .map((b) => ({
        '@type': 'CourseInstance',
        courseMode: 'onsite',
        startDate: pktDateKey(b.startDate),
        location: {
          '@type': 'Place',
          name: `${campusName(b) ?? 'French Aesthetics Academy'}, Lahore`,
        },
      })),
  }

  const whatsappCta = (label: string, place: string, size: 'md' | 'lg' = 'lg') => (
    <WhatsAppLink
      number={whatsapp}
      message={course.whatsappMessage}
      side="academy"
      label={`${course.slug}-${place}`}
      className={buttonClass('primary', { size })}
    >
      <WhatsAppIcon size={20} />
      {label}
    </WhatsAppLink>
  )

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        eyebrow={course.hero.label}
        title={course.hero.headline}
        accent={course.hero.headlineAccent}
        intro={course.hero.subheadline && <p>{course.hero.subheadline}</p>}
        actions={
          <>
            {whatsappCta(course.hero.ctaLabel || 'WhatsApp Karein', 'hero')}
            <ButtonLink
              href={`/academy/enroll?course=${course.slug}&from=${code}`}
              variant="outline"
              size="lg"
            >
              Enroll Now
            </ButtonLink>
          </>
        }
        aside={
          <OfferPanel
            title={course.name}
            points={['1 Week Training', '2 Weeks Internship', 'Real Practice', 'Max 20 Seats']}
            footer={
              next ? (
                <>
                  Next batch:{' '}
                  <Pending confirmed={next.factStatus === 'confirmed'}>
                    {formatBatchDate(next.startDate)}
                  </Pending>
                  {campusName(next) && ` · ${campusName(next)}, Lahore`}
                </>
              ) : (
                <>New batches every month · WhatsApp {whatsapp}</>
              )
            }
          />
        }
      />

      {/* Pain points: hooks in Roman Urdu */}
      {course.painPoints && course.painPoints.length > 0 && (
        <section className="tone-inverse">
          <Container className="py-16 lg:py-24">
            <p className="label eyebrow" data-reveal="">
              Sound familiar?
            </p>
            <ul data-reveal="" className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
              {course.painPoints.map((pain) => (
                <li
                  key={pain.id ?? pain.text}
                  className="border-l-2 border-line pl-5 font-display text-[1.75rem] italic leading-snug text-heading sm:text-[2rem]"
                >
                  {pain.text}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Who it is for, and what you practise */}
      <section>
        <Container className="grid gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Who it is for"
              title="Made for"
              accent={
                course.track === 'invasive'
                  ? 'MBBS & BDS doctors.'
                  : 'beauty professionals & beginners.'
              }
            />
            {course.audience && course.audience.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {course.audience.map((who) => (
                  <li key={who} className="chip">
                    {who}
                  </li>
                ))}
              </ul>
            )}
            {course.summary && <p className="mt-8 text-lg">{course.summary}</p>}
          </div>
          {course.featured && course.featured.length > 0 && (
            <div data-reveal="">
              <SectionHeading
                eyebrow="What you practise"
                title="Hands-on,"
                accent="from the first week."
              />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {course.featured.map((topic) => (
                  <li
                    key={topic}
                    className="border-t border-line pt-3 text-lg font-semibold text-heading"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      {/* Syllabus */}
      {modules.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading
                eyebrow="Full syllabus"
                title={<Numerals>{`${modules.length} modules,`}</Numerals>}
                accent="taught step by step."
                intro={
                  modules.some((m) => m.theoryOnly)
                    ? 'Modules marked "Overview" are taught as theory.'
                    : undefined
                }
              />
            </div>
            <ol data-reveal="" className="mt-12 grid gap-x-12 sm:grid-cols-2">
              {modules.map((module, i) => (
                <li
                  key={module.id ?? module.title}
                  className="flex items-baseline gap-4 border-b border-hairline py-4"
                >
                  <span className="w-8 shrink-0 text-sm font-bold text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-lg font-semibold text-heading">
                    {module.title}
                    {module.theoryOnly && <span className="label ml-3 text-muted">Overview</span>}
                    {module.topics && module.topics.length > 0 && (
                      <span className="mt-1 block text-[0.9375rem] font-normal text-fg">
                        {module.topics.join(' · ')}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* Journey and what makes it different */}
      {course.journey && course.journey.length > 0 && (
        <section className="tone-inverse">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading
                eyebrow="Your 3-week journey"
                title="From training"
                accent="to confidence."
              />
            </div>
            <ol data-reveal="" className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {course.journey.map((step) => (
                <li key={step.id ?? step.label} className="border-t border-line pt-6">
                  <span className="label text-accent">{step.label}</span>
                  <p className="mt-4 text-xl font-semibold text-heading">{step.text}</p>
                </li>
              ))}
            </ol>
            {course.highlights && course.highlights.length > 0 && (
              <div data-reveal="" className="mt-16 border-t border-hairline pt-12">
                <p className="label eyebrow">What makes it different</p>
                <ul className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
                  {course.highlights.map((h) => (
                    <li key={h.id ?? h.text} className="text-lg">
                      {h.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* At a glance and trainers */}
      <section>
        <Container className="grid gap-16 py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20 lg:py-28">
          {glance.length > 0 && (
            <div data-reveal="">
              <SectionHeading eyebrow="Course at a glance" title="The" accent="essentials." />
              <dl className="mt-10 divide-y divide-hairline border-y border-hairline">
                {glance.map((row) => (
                  <div
                    key={row.id ?? row.item}
                    className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                  >
                    <dt className="label text-muted">{row.item}</dt>
                    <dd className="font-semibold text-heading">
                      <Pending confirmed={row.status === 'confirmed'}>{row.detail}</Pending>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {trainers.length > 0 && (
            <div data-reveal="">
              <SectionHeading eyebrow="Your trainers" title="Dermatologist-led" accent="team." />
              <div className="mt-10 space-y-4">
                {trainers.map((trainer) => (
                  <TrainerCard key={trainer.id} trainer={trainer} />
                ))}
              </div>
              <Link href="/academy/faculty" className="link-arrow mt-8">
                Meet the faculty <ArrowRightIcon size={18} />
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* Next batches */}
      <section className="border-t border-hairline">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading eyebrow="Next batches" title="Choose" accent="your start date." />
          </div>
          <div data-reveal="" className="mt-12">
            {batches.length > 0 ? (
              <BatchList batches={batches.slice(0, 4)} whatsapp={whatsapp} from={code} />
            ) : (
              <p className="text-lg">
                New dates are added every month. Ask admissions on WhatsApp for the next batch.
              </p>
            )}
          </div>
          <Link href="/academy/batches" className="link-arrow mt-8">
            All batches <ArrowRightIcon size={18} />
          </Link>
        </Container>
      </section>

      {/* Fee and FAQ */}
      <section className="border-t border-hairline">
        <Container className="grid gap-16 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-28">
          <div data-reveal="">
            {course.feeDisplay !== 'whatsapp' && course.fee ? (
              <>
                <SectionHeading eyebrow="Fee" title="One fee," accent="internship included." />
                <OfferPanel
                  className="mt-10"
                  points={[
                    `${course.feeDisplay === 'from' ? 'From ' : ''}PKR ${course.fee.toLocaleString('en-PK')}`,
                    '2 weeks internship included, no extra fee',
                  ]}
                />
              </>
            ) : (
              <SectionHeading
                eyebrow="Fee and payment"
                title="Fee aur details"
                accent="WhatsApp par."
                intro="Admissions share the current fee, payment options and class timing."
              />
            )}
            <div className="mt-10">
              {whatsappCta(course.hero.ctaLabel || 'WhatsApp Karein', 'fee', 'md')}
            </div>
          </div>
          {faqs.length > 0 && (
            <div data-reveal="">
              <p className="label eyebrow">Questions</p>
              <div className="mt-8">
                <FaqList items={faqs} />
              </div>
              <Link href="/academy/faq" className="link-arrow mt-8">
                All questions <ArrowRightIcon size={18} />
              </Link>
            </div>
          )}
        </Container>
      </section>

      {course.filterLine && (
        <aside aria-label="Who this course is not for" className="border-t border-hairline">
          <Container className="flex flex-col items-start gap-4 py-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-3xl font-semibold text-heading">{course.filterLine}</p>
            {otherCourse && (
              <Link href={`/academy/${otherCourse.slug}`} className="link-arrow shrink-0">
                {otherCourse.shortName} course <ArrowRightIcon size={18} />
              </Link>
            )}
          </Container>
        </aside>
      )}

      <CtaBand
        title="Apni seat"
        accent="reserve karein."
        intro="Sirf 20 seats per batch. Fee aur details WhatsApp par."
      >
        {whatsappCta(`WhatsApp Karein: ${whatsapp}`, 'closing')}
        <ButtonLink
          href={`/academy/enroll?course=${course.slug}&from=${code}`}
          variant="outline"
          size="lg"
        >
          Enroll Now
        </ButtonLink>
      </CtaBand>
    </>
  )
}
