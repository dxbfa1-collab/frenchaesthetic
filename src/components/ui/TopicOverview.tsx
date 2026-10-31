import type { ReactNode } from 'react'

import { Container } from './Container'
import { SectionHeading } from './SectionHeading'

export type TopicPoint = { heading: string; text: ReactNode }

/**
 * The context a page's questions sit in: short, self-contained answers at topic level, placed
 * before the FAQ so readers and search engines get the whole picture without opening an accordion.
 */
export function TopicOverview({
  title,
  accent,
  points,
}: {
  title: string
  accent?: string
  points: TopicPoint[]
}) {
  return (
    <section className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div data-reveal="">
          <SectionHeading eyebrow="Overview" title={title} accent={accent} />
        </div>
        <div data-reveal="" className="mt-12 grid gap-10 md:grid-cols-3 lg:gap-14">
          {points.map((point) => (
            <div key={point.heading}>
              <h3 className="text-xl">{point.heading}</h3>
              <p className="mt-3">{point.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
