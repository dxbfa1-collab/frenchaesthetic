import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getSiteSettings } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

// Meta title and description from the FAA brief's SEO starter pack (§14).
export const metadata: Metadata = {
  title: { absolute: 'French Aesthetics Academy · Aesthetics Training Lahore' },
  description:
    'Aesthetics courses in Lahore with 2 weeks supervised internship included. Non-Invasive for beauty pros, Invasive for MBBS & BDS doctors.',
  alternates: { canonical: '/academy' },
}

/*
  Copy is verbatim from the FAA brief §3 (hooks in Roman Urdu, details in English).
  Phase 3 adds the batch calendar, the FAQ preview and the course pages these cards link to.
*/
const paths = [
  {
    audience: 'For beauty professionals & beginners',
    title: 'Non-Invasive',
    who: 'For salon owners, beauticians, makeup artists, hair stylists, nail technicians, skin care specialists, students, beginners.',
    topics: [
      'HydraFacial',
      'BB Glow',
      'Chemical Peels',
      'HIFU',
      'Laser Hair Removal',
      'Skin Analysis',
    ],
    format: '1 week training + 2 weeks internship on live clients',
    note: 'No experience needed',
    href: '/academy/non-invasive-aesthetics-course',
    message: academyMessages.homeNonInvasive,
    label: 'home-path-ni',
  },
  {
    audience: 'For MBBS & BDS doctors',
    title: 'Invasive',
    who: 'For MBBS & BDS doctors: house officers, MOs, GPs, dentists, career-break doctors.',
    topics: [
      'Facial anatomy',
      'Injectables',
      'Dermal fillers',
      'PDO threads',
      'PRP',
      'Skin boosters',
      'Complication management',
    ],
    format: '1 week training + 2 weeks clinical internship on real patients',
    note: 'Flexible timing',
    href: '/academy/invasive-aesthetics-course-for-doctors',
    message: academyMessages.homeInvasive,
    label: 'home-path-in',
  },
]

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

export default async function AcademyHome() {
  const settings = await getSiteSettings()
  const whatsapp = settings.admissionsWhatsApp

  return (
    <>
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
              {paths.map((path) => (
                <WhatsAppLink
                  key={path.label}
                  number={whatsapp}
                  message={path.message}
                  side="academy"
                  label={`hero-${path.label}`}
                  className="group flex items-center justify-between gap-4 rounded-[6px] border-[1.5px] border-gold px-5 py-4 transition-colors hover:bg-gold/15"
                >
                  <span>
                    <span className="block font-extrabold text-heading">{path.title} Course</span>
                    <span className="block text-sm text-muted">
                      {path.audience.replace('For ', 'for ')}
                    </span>
                  </span>
                  <WhatsAppIcon size={22} className="shrink-0 text-gold" />
                </WhatsAppLink>
              ))}
            </div>
            <p className="rise rise-3 mt-6 text-[0.9375rem] text-muted">
              Lahore · Max 20 seats · New batches every month
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
            {paths.map((path) => (
              <article
                key={path.href}
                className="relative flex flex-col border border-hairline bg-surface p-7 sm:p-10"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gold" />
                <span className="pill self-start">{path.audience}</span>
                <h3 className="mt-6 text-[2.5rem] sm:text-5xl">
                  {path.title}
                  <span className="block italic text-accent">Aesthetics</span>
                </h3>
                <p className="mt-5 text-lg">{path.who}</p>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="What you practise">
                  {path.topics.map((topic) => (
                    <li key={topic} className="chip">
                      {topic}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 font-semibold text-heading">{path.format}</p>
                <p className="mt-1 text-muted">{path.note}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-4 pt-9">
                  <ButtonLink href={path.href} variant="outline">
                    View course <ArrowRightIcon size={18} />
                  </ButtonLink>
                  <WhatsAppLink
                    number={whatsapp}
                    message={path.message}
                    side="academy"
                    label={`card-${path.label}`}
                    className="link-arrow"
                  >
                    Ask on WhatsApp
                  </WhatsAppLink>
                </div>
              </article>
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

      {/* Faculty and proof */}
      <section className="border-t border-hairline">
        <Container className="grid gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Faculty"
              title="Dermatologist-led,"
              accent="inside a working clinic."
            />
            <div className="mt-10 flex items-center gap-6 border border-hairline bg-surface p-6 sm:p-8">
              {/* Neutral placeholder until a consented photo is supplied (no stock or AI faces). */}
              <span
                aria-hidden="true"
                className="flex size-20 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold font-display text-3xl text-heading"
              >
                IF
              </span>
              <div>
                <p className="font-display text-[1.875rem] leading-tight text-heading">
                  Dr. Iqra Fatima
                </p>
                <p className="label mt-2 text-accent">Dermatologist · Lead Trainer</p>
              </div>
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

      {/* Final CTA */}
      <section className="tone-dark border-t border-hairline bg-deep-charcoal">
        <Container className="py-20 text-center lg:py-28">
          <div data-reveal="">
            <SectionHeading
              align="center"
              title="Apni seat"
              accent="reserve karein."
              intro="Sirf 20 seats per batch. Fee aur details WhatsApp par."
            />
            <WhatsAppLink
              number={whatsapp}
              message={academyMessages.page('HOME')}
              side="academy"
              label="academy-closing"
              className={buttonClass('primary', { size: 'lg', className: 'mt-10' })}
            >
              <WhatsAppIcon size={20} />
              WhatsApp Karein: <span className="whitespace-nowrap">{whatsapp}</span>
            </WhatsAppLink>
          </div>
        </Container>
      </section>
    </>
  )
}
