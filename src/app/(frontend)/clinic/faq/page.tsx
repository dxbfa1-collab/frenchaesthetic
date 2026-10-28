import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList, faqJsonLd } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { Numerals } from '@/components/ui/Numerals'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicFaqs, getSiteSettings, getTreatments } from '@/lib/payload'
import { relationId } from '@/lib/relation'
import { treatmentHref } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Questions and Answers',
  description:
    'Consultations, prices, booking and branches at French Medical Aesthetics in Lahore and Karachi: answers to common questions.',
  alternates: { canonical: '/clinic/faq' },
}

export default async function ClinicFaqPage() {
  const [settings, faqs, treatments] = await Promise.all([
    getSiteSettings(),
    getClinicFaqs(),
    getTreatments(),
  ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const general = faqs.filter((f) => !f.treatment)
  const byTreatment = treatments
    .map((treatment) => ({
      treatment,
      items: faqs.filter((f) => relationId(f.treatment) === treatment.id),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'FAQ', href: '/clinic/faq' },
            ]}
          />
        }
        eyebrow="Questions"
        title="Questions,"
        accent="answered."
        intro={
          <p>
            The questions we are asked most. For anything else, message us on WhatsApp and our team
            will reply.
          </p>
        }
      />

      {general.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_2fr] lg:gap-20 lg:py-24">
            <h2 className="text-[2rem] sm:text-[2.5rem]">Your visit</h2>
            <FaqList items={general} />
          </Container>
        </section>
      )}

      {byTreatment.map(({ treatment, items }) => (
        <section key={treatment.id} className="border-t border-hairline">
          <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_2fr] lg:gap-20 lg:py-24">
            <div>
              <h2 className="text-[2rem] sm:text-[2.5rem]">
                <Numerals>{treatment.name}</Numerals>
              </h2>
              <Link href={treatmentHref(treatment)} className="link-arrow mt-6">
                About this treatment <ArrowRightIcon size={18} />
              </Link>
            </div>
            <FaqList items={items} />
          </Container>
        </section>
      ))}

      <CtaBand
        title="Still have"
        accent="a question?"
        intro="Message us on WhatsApp. Our team replies during clinic hours."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.consultation()}
          side="clinic"
          label="faq-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Ask on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
