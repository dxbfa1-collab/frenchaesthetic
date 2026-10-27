import type { Metadata } from 'next'

import { CourseCard } from '@/components/academy/CourseCard'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { batchRuleSentence } from '@/lib/batches'
import { getCourses, getSiteSettings, getUpcomingBatches } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Courses',
  description:
    'Two aesthetics courses in Lahore, each with 1 week of training and a 2-week supervised internship: Non-Invasive for beauty professionals, Invasive for MBBS & BDS doctors.',
  alternates: { canonical: '/academy/courses' },
}

export const revalidate = 3600

export default async function CoursesPage() {
  const [settings, courses, batches] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getUpcomingBatches(),
  ])

  return (
    <>
      <PageHero
        eyebrow="Courses"
        title="Two courses,"
        accent="one way of teaching."
        intro={
          <p>
            Every course pairs 1 week of training with a 2-week supervised internship, in batches of
            at most 20. {batchRuleSentence(courses)}
          </p>
        }
      />
      <section className="border-t border-hairline">
        <Container className="grid gap-5 py-16 lg:grid-cols-2 lg:py-24">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              as="h2"
              course={course}
              nextBatch={batches.find((b) => b.course.id === course.id)}
              whatsapp={settings.admissionsWhatsApp}
            />
          ))}
        </Container>
      </section>
    </>
  )
}
