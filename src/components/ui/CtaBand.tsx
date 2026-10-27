import type { ReactNode } from 'react'

import { Container } from './Container'
import { SectionHeading } from './SectionHeading'

/** Closing call to action on deep charcoal, at the end of a page. */
export function CtaBand({
  title,
  accent,
  intro,
  children,
}: {
  title: ReactNode
  accent?: ReactNode
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="tone-dark border-t border-hairline bg-deep-charcoal">
      <Container className="py-20 text-center lg:py-28">
        <div data-reveal="">
          <SectionHeading align="center" title={title} accent={accent} intro={intro} />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">{children}</div>
        </div>
      </Container>
    </section>
  )
}
