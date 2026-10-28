import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { PlainText } from '@/components/ui/PlainText'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { POLICIES } from '@/globals/Policies'
import { getPolicies, getSiteSettings } from '@/lib/payload'
import { DEFAULT_ACADEMY_FILTER_LINE, DEFAULT_MEDICAL_DISCLAIMER, isStaging } from '@/lib/site'
import { TREATMENT_DISCLAIMER } from '@/lib/treatments'
import { academyMessages, clinicMessages } from '@/lib/whatsapp'

type Props = { params: Promise<{ slug: string }> }

const DISCLAIMER = { key: 'medical-disclaimer', title: 'Medical disclaimer' } as const
const PAGES = [...POLICIES, DISCLAIMER]

export function generateStaticParams() {
  return PAGES.map((page) => ({ slug: page.key }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = PAGES.find((p) => p.key === slug)
  if (!page) return {}
  return {
    title: page.title,
    description: `${page.title} for French Medical Aesthetics and French Aesthetics Academy.`,
    alternates: { canonical: `/policies/${page.key}` },
  }
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const page = PAGES.find((p) => p.key === slug)
  if (!page) notFound()
  const [settings, policies] = await Promise.all([getSiteSettings(), getPolicies()])

  let text: string | null = null
  let confirmed = true
  if (page.key === DISCLAIMER.key) {
    // Required wording (FMA brief §9); Site settings can override the site-wide line.
    text = [
      settings.medicalDisclaimer || DEFAULT_MEDICAL_DISCLAIMER,
      `On every treatment page: ${TREATMENT_DISCLAIMER}`,
      'Before and after photos are shown only with the written consent of each patient. Individual results vary.',
      settings.academyFilterLine || DEFAULT_ACADEMY_FILTER_LINE,
    ].join('\n\n')
  } else {
    text = policies[page.key] || null
    confirmed = policies[`${page.key}Status` as const] === 'confirmed'
  }
  // Until the owner confirms a policy, the live site shows a short notice instead of the draft.
  const showText = Boolean(text) && (confirmed || isStaging)

  return (
    <>
      <PageHero eyebrow="Policies" title={page.title} />
      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-20">
          <div className="max-w-3xl">
            {showText && !confirmed && (
              <p className="mb-10 rounded-sm border border-dashed border-line px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-muted">
                Draft · not confirmed by the owner. The live site shows a short notice instead.
              </p>
            )}
            {showText ? (
              <PlainText text={text!} />
            ) : (
              <div className="space-y-8 text-lg">
                <p>
                  We are finalising this policy. If you have a question about it, message us on
                  WhatsApp and our team will answer.
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-4">
                  <WhatsAppLink
                    number={settings.clinicWhatsApp || settings.clinicPhone}
                    message={clinicMessages.consultation()}
                    side="clinic"
                    label={`policy-${page.key}`}
                    className="link-arrow"
                  >
                    <WhatsAppIcon size={18} className="text-gold" />
                    Clinic {settings.clinicPhone}
                  </WhatsAppLink>
                  <WhatsAppLink
                    number={settings.admissionsWhatsApp}
                    message={academyMessages.page('POLICY')}
                    side="academy"
                    label={`policy-${page.key}`}
                    className="link-arrow"
                  >
                    <WhatsAppIcon size={18} className="text-gold" />
                    Academy admissions {settings.admissionsWhatsApp}
                  </WhatsAppLink>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
