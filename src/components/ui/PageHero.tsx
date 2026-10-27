import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Container } from './Container'

type Props = {
  eyebrow?: ReactNode
  title: ReactNode
  /** Second headline line in italic: gold on charcoal, charcoal on ivory. */
  accent?: ReactNode
  intro?: ReactNode
  actions?: ReactNode
  /** Right-hand column on large screens, e.g. an offer panel. */
  aside?: ReactNode
}

export function PageHero({ eyebrow, title, accent, intro, actions, aside }: Props) {
  return (
    <section>
      <Container
        className={cn(
          'grid gap-14 pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24',
          aside ? 'lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16' : null,
        )}
      >
        <div>
          {eyebrow && <p className="label eyebrow rise">{eyebrow}</p>}
          <h1 className="rise rise-2 mt-6 text-[2.625rem] sm:text-6xl lg:text-[4.25rem]">
            {title}
            {accent && <span className="block italic text-accent">{accent}</span>}
          </h1>
          {intro && <div className="rise rise-3 mt-7 max-w-2xl text-lg sm:text-xl">{intro}</div>}
          {actions && (
            <div className="rise rise-3 mt-10 flex flex-wrap items-center gap-4">{actions}</div>
          )}
        </div>
        {aside && <div className="rise rise-3">{aside}</div>}
      </Container>
    </section>
  )
}
