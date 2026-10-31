'use client'

import { GraduationCap, type LucideIcon, ShieldCheck, Stethoscope } from 'lucide-react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { type SitePhoto, SITE_PHOTOS } from '@/lib/images'

const STEPS: { week: string; title: string; text: string; icon: LucideIcon; photo: SitePhoto }[] = [
  {
    week: 'Week 1',
    title: 'Train hands-on',
    text: 'Hands-on training with trainers.',
    icon: GraduationCap,
    photo: SITE_PHOTOS.anatomyClass,
  },
  {
    week: 'Week 2',
    title: 'Perform it yourself',
    text: 'Internship: you perform treatments yourself, supervised.',
    icon: Stethoscope,
    photo: SITE_PHOTOS.laserTeam,
  },
  {
    week: 'Week 3',
    title: 'Work with confidence',
    text: 'Supervised practice until you work with confidence.',
    icon: ShieldCheck,
    photo: SITE_PHOTOS.supervisedPractice,
  },
]

const FACTS = ['3 weeks in all', '2-week internship, no extra fee', 'Max 20 seats per batch']

/**
 * Week-by-week path with a gold line that fills as the visitor scrolls, lighting each week in turn.
 * Everything is rendered and readable without JavaScript; under reduced motion it starts complete.
 */
export function JourneyTimeline() {
  const ref = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 78%', 'end 70%'] })
  const [reached, setReached] = useState(-1)

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setReached(progress >= 0.95 ? 2 : progress >= 0.5 ? 1 : progress > 0.01 ? 0 : -1)
  })

  return (
    <section className="tone-dark journey relative isolate overflow-hidden bg-charcoal">
      <Container className="py-20 lg:py-28">
        <div data-reveal="" className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="How it works"
            title="From training"
            accent="to confidence."
            intro="One week of training, then two weeks of supervised internship."
          />
          <ul className="flex flex-wrap gap-3">
            {FACTS.map((fact) => (
              <li key={fact} className="journey-fact">
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <ol ref={ref} data-reveal="" className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-6">
          <span aria-hidden="true" className="journey-track">
            <motion.span
              className="journey-fill journey-fill-x"
              style={reduced ? { scaleX: 1 } : { scaleX: scrollYProgress }}
            />
            <motion.span
              className="journey-fill journey-fill-y"
              style={reduced ? { scaleY: 1 } : { scaleY: scrollYProgress }}
            />
          </span>

          {STEPS.map((step, i) => {
            const Icon = step.icon
            const lit = reduced || i <= reached
            return (
              <li key={step.week} className={cn('journey-step', lit && 'is-lit')}>
                <span aria-hidden="true" className="journey-node">
                  <Icon size={24} strokeWidth={1.6} />
                </span>
                <article className="journey-card group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={step.photo.src}
                      alt={step.photo.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ objectPosition: step.photo.position ?? 'center' }}
                    />
                    <span aria-hidden="true" className="journey-number">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="p-6 lg:p-7">
                    <p className="label text-accent">{step.week}</p>
                    <h3 className="mt-3 text-2xl">{step.title}</h3>
                    <p className="mt-2">{step.text}</p>
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
