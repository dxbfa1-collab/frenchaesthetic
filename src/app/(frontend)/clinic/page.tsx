import type { Metadata } from 'next'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Numerals } from '@/components/ui/Numerals'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicBranches, getSiteSettings } from '@/lib/payload'
import { clinicMessages } from '@/lib/whatsapp'
import type { Branch } from '@/payload-types'

export const metadata: Metadata = {
  title: { absolute: 'French Medical Aesthetics · Aesthetic Clinic in Lahore & Karachi' },
  description:
    'Doctor-led aesthetic treatments for skin, face and body at four branches in Lahore and Karachi. Book a consultation on WhatsApp.',
  alternates: { canonical: '/clinic' },
}

/*
  Copy follows the FMA content brief. Treatment texts are the brief's neutral drafts (§4.2) and still
  need a doctor's review. Device and trademark names are left out (owner decision D-005).
  Phase 2 replaces these lists with the Treatments collection and real treatment pages.
*/
const signature = [
  {
    name: 'HIFU 22D skin tightening',
    text: 'Focused ultrasound energy beneath the skin supports natural collagen, for mild to moderate laxity on the face, jawline and neck. Most people return to daily activities the same day.',
  },
  {
    name: 'Non-surgical face lifting',
    text: 'A needle-free facial treatment that combines energy-based technologies to work on skin and facial muscle tone. Suitability and the session plan are decided at consultation.',
  },
  {
    name: 'RF microneedling',
    text: 'Fine needles with radiofrequency heat stimulate collagen in deeper layers, for texture, acne scarring and firmness. Some redness for a few days is expected.',
  },
  {
    name: 'Facials',
    text: 'Multi-step and carbon laser facials that cleanse, exfoliate and hydrate the skin, often chosen before events or as regular care.',
  },
]

const reasons = [
  { title: 'Doctor-led care', text: 'Every plan starts with an in-person medical assessment.' },
  {
    title: 'Modern technology',
    text: 'Focused ultrasound, radiofrequency, lasers and AI skin analysis, explained in plain words.',
  },
  {
    title: 'Fair, transparent pricing',
    text: 'You receive a clear quote at your consultation, before any treatment begins.',
  },
  { title: 'Four branches', text: 'Three in Lahore and one in Karachi.' },
]

const steps = [
  {
    title: 'Consultation',
    text: 'Tell us what concerns you. Your skin is assessed and your options are explained.',
  },
  {
    title: 'Your plan',
    text: 'An honest plan: the treatment that suits you, the sessions your doctor recommends, and what it will not do.',
  },
  { title: 'Treatment', text: 'Carried out in a calm clinic setting, with medical oversight.' },
  {
    title: 'Aftercare',
    text: 'Clear aftercare advice, and a WhatsApp line for your questions afterwards.',
  },
]

const listFormat = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' })

function consultationNote(branch: Branch): string | null {
  if (branch.consultation === 'free') {
    return branch.skinAnalysis ? 'Free consultation + AI skin analysis' : 'Free consultation'
  }
  if (branch.consultation === 'paid') {
    return branch.consultationFee
      ? `Consultation fee: PKR ${branch.consultationFee.toLocaleString('en-PK')}`
      : 'Consultation fee applies'
  }
  return null
}

export default async function ClinicHome() {
  const [settings, branches] = await Promise.all([getSiteSettings(), getClinicBranches()])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  // "Free consultation" is named per branch, never implied for all (FMA brief §2).
  const freeAt = branches.filter((b) => b.consultation === 'free').map((b) => b.shortName || b.name)

  return (
    <>
      {/* Hero */}
      <section>
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <p className="label eyebrow rise">French Medical Aesthetics · Lahore & Karachi</p>
            <h1 className="rise rise-2 mt-6 max-w-3xl text-[2.875rem] sm:text-6xl lg:text-[5rem]">
              Premium care,
              <span className="block italic text-accent">priced with fairness.</span>
            </h1>
            <p className="rise rise-3 mt-7 max-w-xl text-lg sm:text-xl">
              Doctor-led aesthetic treatments for skin, face and body. Every plan starts with an
              honest consultation about your skin, your goals and what will suit you.
            </p>
            <div className="rise rise-3 mt-10 flex flex-wrap gap-4">
              <WhatsAppLink
                number={whatsapp}
                message={clinicMessages.consultation()}
                side="clinic"
                label="clinic-hero"
                className={buttonClass('primary', { size: 'lg' })}
              >
                <WhatsAppIcon size={20} />
                Book on WhatsApp
              </WhatsAppLink>
              <ButtonLink href="/clinic/book" variant="outline" size="lg">
                Book a Consultation
              </ButtonLink>
            </div>
            <ul
              className="rise rise-3 mt-12 flex flex-wrap gap-2.5"
              aria-label="Signature treatments"
            >
              {signature.map((t) => (
                <li key={t.name} className="chip">
                  {t.name}
                </li>
              ))}
            </ul>
          </div>
          <OfferPanel
            className="rise rise-3"
            title="Your consultation"
            points={[
              'Doctor-led skin assessment',
              'AI skin analysis at participating branches',
              'A clear quote before any treatment',
            ]}
            footer={
              freeAt.length > 0 ? <>Free consultation at {listFormat.format(freeAt)}.</> : undefined
            }
          />
        </Container>
      </section>

      {/* Signature treatments */}
      <section className="border-t border-hairline">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Signature treatments"
              title="Lift, tighten,"
              accent="refresh."
              intro="The treatments our patients ask about most. Your doctor confirms what suits you at consultation."
            />
          </div>
          <ul
            data-reveal=""
            className="mt-14 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2"
          >
            {signature.map((t) => (
              <li key={t.name} className="flex flex-col bg-bg p-7 sm:p-10">
                <h3 className="text-[2rem]">
                  <Numerals>{t.name}</Numerals>
                </h3>
                <p className="mt-4">{t.text}</p>
                <WhatsAppLink
                  number={whatsapp}
                  message={clinicMessages.treatment(t.name)}
                  side="clinic"
                  label={`signature-${t.name}`}
                  className="link-arrow mt-8 self-start"
                >
                  Ask on WhatsApp <ArrowRightIcon size={18} />
                </WhatsAppLink>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Results vary from person to person. Treatment is subject to medical assessment.
          </p>
        </Container>
      </section>

      {/* Why FMA */}
      <section className="tone-inverse">
        <Container className="grid gap-14 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Why French Medical Aesthetics"
              title="What you can"
              accent="expect from us."
            />
          </div>
          <ul data-reveal="" className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r.title} className="border-t border-line pt-6">
                <h3 className="text-[1.75rem]">{r.title}</h3>
                <p className="mt-3">{r.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How a visit works */}
      <section>
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Your visit"
              title="Four calm steps,"
              accent="from first message to aftercare."
            />
          </div>
          <ol data-reveal="" className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="label text-accent">Step {String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-[1.875rem]">{step.title}</h3>
                <p className="mt-3">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Branches */}
      {branches.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Our branches" title="Lahore" accent="and Karachi." />
            </div>
            <ul data-reveal="" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {branches.map((branch) => {
                const note = consultationNote(branch)
                return (
                  <li
                    key={branch.id}
                    className="flex flex-col border border-hairline bg-surface p-7"
                  >
                    <span className="pill self-start">{branch.city}</span>
                    <h3 className="mt-6 text-[1.875rem]">{branch.name}</h3>
                    {note && <p className="mt-3 font-semibold text-heading">{note}</p>}
                    {branch.address && (
                      <p className="mt-3 text-[0.9375rem]">
                        <Pending confirmed={branch.addressStatus === 'confirmed'}>
                          {branch.address}
                        </Pending>
                      </p>
                    )}
                    <WhatsAppLink
                      number={branch.whatsapp || whatsapp}
                      message={clinicMessages.consultation(branch.name)}
                      side="clinic"
                      label={`branch-${branch.slug}`}
                      className="link-arrow mt-auto self-start pt-8"
                    >
                      Book at {branch.shortName || branch.name} <ArrowRightIcon size={18} />
                    </WhatsAppLink>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      )}

      {/* Closing CTA */}
      <section className="tone-dark border-t border-hairline bg-deep-charcoal">
        <Container className="py-20 text-center lg:py-28">
          <div data-reveal="">
            <SectionHeading
              align="center"
              title="Not sure where"
              accent="to start?"
              intro="Send us a photo on WhatsApp for a free assessment. Your doctor confirms what suits you at an in-person consultation."
            />
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.photo}
              side="clinic"
              label="clinic-closing"
              className={buttonClass('primary', { size: 'lg', className: 'mt-10' })}
            >
              <WhatsAppIcon size={20} />
              Send Us a Photo on WhatsApp
            </WhatsAppLink>
          </div>
        </Container>
      </section>
    </>
  )
}
