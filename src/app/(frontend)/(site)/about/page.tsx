import type { Metadata } from 'next'

import { ArrowRightIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'French Medical Aesthetics, a medical aesthetics clinic in Lahore and Karachi, and French Aesthetics Academy, its training academy in Lahore.',
  alternates: { canonical: '/about' },
}

// FMA brief §1: the About copy is a draft awaiting the owner's approval, so the live site shows
// only confirmed facts until it is signed off. Nothing about the founder (owner, 28 Oct 2026).
const CLINIC_DRAFT = [
  'French Medical Aesthetics brings advanced aesthetic treatments to Lahore and Karachi, delivered by qualified doctors in a calm, premium clinic setting.',
  'We combine modern technology with a personal consultation, so every treatment plan starts with your skin, your goals and an honest assessment of what will suit you.',
  'Our belief is simple: premium care should be within reach. We keep our pricing fair and transparent, without compromising on technology, hygiene or medical oversight.',
]

const CLINIC_FACTS = [
  'French Medical Aesthetics is a medical aesthetics clinic with three branches in Lahore and one in Karachi.',
  'Every treatment starts with an in-person medical assessment, and you receive a clear quote at your consultation before any treatment begins.',
]

const academyPoints = [
  'A 2-week supervised internship is included, at no extra fee.',
  'A maximum of 20 students in each batch.',
  'A dermatologist-led team, with Lead Trainer Dr. Iqra Fatima.',
  'Two tracks: Non-Invasive for beauty professionals and beginners, Invasive for MBBS and BDS doctors.',
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Who"
        accent="we are."
        intro={
          <p>
            A medical aesthetics clinic in Lahore and Karachi, and the academy that trains in Lahore
            alongside it. Each has its own team, its own number and its own page.
          </p>
        }
      />

      <section className="border-t border-hairline">
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-20 lg:py-28">
          <div data-reveal="">
            <p className="label eyebrow">The clinic</p>
            <h2 className="mt-5 text-[2.5rem] sm:text-5xl">
              French Medical
              <span className="block italic text-accent">Aesthetics</span>
            </h2>
            <p className="label mt-6 text-muted">Beauty Heaven</p>
          </div>
          <div data-reveal="" className="space-y-5 text-lg">
            <Pending
              confirmed={false}
              fallback={CLINIC_FACTS.map((line) => (
                <p key={line}>{line}</p>
              ))}
            >
              {CLINIC_DRAFT.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </Pending>
            <div className="pt-5">
              <ButtonLink href="/clinic" variant="outline">
                Visit the Clinic <ArrowRightIcon size={18} />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="tone-inverse">
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-20 lg:py-28">
          <div data-reveal="">
            <p className="label eyebrow">The academy</p>
            <h2 className="mt-5 text-[2.5rem] sm:text-5xl">
              French Aesthetics
              <span className="block italic text-accent">Academy</span>
            </h2>
            <p className="label mt-6 text-muted">Real practice. Real confidence.</p>
          </div>
          <div data-reveal="" className="text-lg">
            <p>
              French Aesthetics Academy is the training academy of French Medical Aesthetics clinic,
              in Lahore. Training is hands-on from the first week, followed by supervised practice
              until you work with confidence.
            </p>
            <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
              {academyPoints.map((point) => (
                <li key={point} className="py-4 font-semibold text-heading">
                  {point}
                </li>
              ))}
            </ul>
            <div className="pt-10">
              <ButtonLink href="/academy" variant="outline">
                Explore the Academy <ArrowRightIcon size={18} />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
