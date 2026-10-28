'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

export type Slide = {
  id: string
  eyebrow: string
  title: string
  accent?: string
  text: string
  /** Buttons for this slide: the first is the primary. Rendered by the server page. */
  actions: ReactNode
  image?: { src: string; alt: string; position?: string }
  /** Small icon shown in the floating badge. */
  badge?: { icon: ReactNode; label: string }
}

const INTERVAL = 4500

/**
 * The hero carousel on the clinic and academy homes (owner, 29 Oct 2026: 2–3 slides, a new slide
 * every 4–5 seconds). It pauses while hovered or focused, can be driven by arrows, dots and the
 * keyboard, and does not move on its own for visitors who prefer reduced motion.
 */
export function HeroSlider({ slides, label }: { slides: Slide[]; label: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const region = useRef<HTMLElement>(null)
  const count = slides.length
  const autoplay = !reduceMotion && !paused && count > 1

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])

  useEffect(() => {
    if (!autoplay) return
    const timer = window.setTimeout(() => go(index + 1), INTERVAL)
    return () => window.clearTimeout(timer)
  }, [autoplay, index, go])

  const slide = slides[index]

  return (
    <section
      ref={region}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!region.current?.contains(e.relatedTarget as Node)) setPaused(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      className="hero-slider relative isolate overflow-hidden"
    >
      {/* Soft gold light drifting behind the slides */}
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid min-h-[calc(100svh-7rem)] w-full max-w-7xl items-center gap-10 px-4 pb-24 pt-10 sm:px-6 lg:min-h-[44rem] lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-14">
        {/* Text */}
        <div
          className="relative z-10 min-h-[22rem] sm:min-h-[20rem]"
          aria-live={autoplay ? 'off' : 'polite'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              initial="enter"
              animate="show"
              exit="leave"
              variants={{
                enter: {},
                show: { transition: { staggerChildren: reduceMotion ? 0 : 0.09 } },
                leave: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              }}
            >
              {[
                <p key="eyebrow" className="label eyebrow">
                  {slide.eyebrow}
                </p>,
                <h1
                  key="title"
                  className="mt-6 text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-[4.5rem]"
                >
                  {slide.title}
                  {slide.accent && (
                    <span className="hero-accent block italic text-accent">{slide.accent}</span>
                  )}
                </h1>,
                <p key="text" className="mt-6 max-w-xl text-lg sm:text-xl">
                  {slide.text}
                </p>,
                <div key="actions" className="mt-9 flex flex-wrap items-center gap-4">
                  {slide.actions}
                </div>,
              ].map((child, i) => (
                <motion.div
                  key={i}
                  variants={{
                    enter: { opacity: 0, y: reduceMotion ? 0 : 28 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    },
                    leave: {
                      opacity: 0,
                      y: reduceMotion ? 0 : -16,
                      transition: { duration: 0.25 },
                    },
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Picture */}
        <div className="relative aspect-[4/5] w-full max-w-[34rem] justify-self-center sm:aspect-[5/4] lg:aspect-[4/5]">
          <div
            aria-hidden="true"
            className="hero-ring absolute -inset-4 rounded-[2.5rem] border border-line sm:-inset-6"
          />
          <div className="relative h-full overflow-hidden rounded-[2rem] bg-deep-charcoal">
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                }}
                exit={{ opacity: 0, transition: { duration: 0.6 } }}
              >
                {slide.image ? (
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 540px, 92vw"
                    className="hero-kenburns object-cover"
                    style={{ objectPosition: slide.image.position ?? 'center' }}
                  />
                ) : (
                  <div className="hero-art absolute inset-0" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-charcoal/70 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
          {slide.badge && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.5 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
                className="tone-dark hero-float absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-hairline bg-deep-charcoal/95 px-5 py-4 shadow-2xl backdrop-blur sm:left-[-2rem]"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-gold text-charcoal">
                  {slide.badge.icon}
                </span>
                <span className="text-sm font-bold text-heading">{slide.badge.label}</span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 mx-auto flex w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="slider-arrow"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}: ${s.title}`}
                aria-current={i === index ? 'true' : undefined}
                className={cn('slider-dot', i === index && 'is-active')}
              >
                {i === index && autoplay && (
                  <span
                    key={`${s.id}-${index}`}
                    className="slider-progress"
                    style={{ animationDuration: `${INTERVAL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="slider-arrow"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <span className="ml-auto hidden text-sm font-bold text-muted sm:inline">
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
        </div>
      )}
    </section>
  )
}
