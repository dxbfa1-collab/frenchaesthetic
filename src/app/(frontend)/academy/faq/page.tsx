import type { Metadata } from 'next'

import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList, faqJsonLd } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getAcademyFaqs, getCourses, getSiteSettings } from '@/lib/payload'
import { relationId } from '@/lib/relation'
import { academyMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about the internship, batch size, campuses, eligibility and the training at French Aesthetics Academy, Lahore.',
  alternates: { canonical: '/academy/faq' },
}

// FAA brief §11: grouped by course. Questions without a confirmed answer stay off the page.
export default async function AcademyFaqPage() {
  const [settings, faqs, courses] = await Promise.all([
    getSiteSettings(),
    getAcademyFaqs(),
    getCourses(),
  ])
  const groups = [
    { title: 'General', items: faqs.filter((f) => !f.course) },
    ...courses.map((course) => ({
      title: course.shortName,
      items: faqs.filter((f) => relationId(f.course) === course.id),
    })),
  ].filter((group) => group.items.length > 0)

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHero eyebrow="FAQ" title="Questions," accent="answered." />
      <section className="border-t border-hairline">
        <Container className="space-y-16 py-16 lg:py-24">
          {groups.map((group) => (
            <div
              key={group.title}
              data-reveal=""
              className="grid gap-8 lg:grid-cols-[1fr_2.4fr] lg:gap-16"
            >
              <h2 className="text-4xl">{group.title}</h2>
              <FaqList items={group.items} />
            </div>
          ))}
        </Container>
      </section>
      <CtaBand title="Aur koi" accent="sawal?" intro="Admissions answer on WhatsApp.">
        <WhatsAppLink
          number={settings.admissionsWhatsApp}
          message={academyMessages.page('FAQ')}
          side="academy"
          label="faq-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          WhatsApp Karein
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
