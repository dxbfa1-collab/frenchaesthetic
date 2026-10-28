import type { Metadata } from 'next'
import Link from 'next/link'

import { BranchCard } from '@/components/clinic/BranchCard'
import { DoctorCard } from '@/components/clinic/DoctorCard'
import { TreatmentStatus } from '@/components/clinic/TreatmentStatus'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { FaqList } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { Numerals } from '@/components/ui/Numerals'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import {
  getClinicBranches,
  getClinicDoctors,
  getClinicFaqs,
  getConcerns,
  getSiteSettings,
  getTreatmentMenu,
} from '@/lib/payload'
import { DEFAULT_STEPS, treatmentHref } from '@/lib/treatments'
import { siteUrl } from '@/lib/site'
import { clinicMessages, telHref } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: { absolute: 'French Medical Aesthetics · Aesthetic Clinic in Lahore & Karachi' },
  description:
    'Doctor-led aesthetic treatments for skin, face and body at four branches in Lahore and Karachi. Book a consultation on WhatsApp.',
  alternates: { canonical: '/clinic' },
}

/*
  Copy follows the FMA content brief. Treatments, concerns, doctors, branches and questions come
  from the CMS; a treatment shows here only once it may be shown (see lib/treatments.ts).
  Device and trademark names are left out (owner decision D-005).
*/
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

const listFormat = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' })

export default async function ClinicHome() {
  const [settings, branches, menu, concerns, doctors, faqs] = await Promise.all([
    getSiteSettings(),
    getClinicBranches(),
    getTreatmentMenu(),
    getConcerns(),
    getClinicDoctors(),
    getClinicFaqs(),
  ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const treatments = menu.flatMap((category) => category.treatments)
  const signature = treatments.filter((t) => t.featured).slice(0, 4)
  // "Free consultation" is named per branch, never implied for all (FMA brief §2).
  const freeAt = branches.filter((b) => b.consultation === 'free').map((b) => b.shortName || b.name)
  const questions = faqs.filter((f) => !f.treatment).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'French Medical Aesthetics',
    slogan: 'Beauty Heaven',
    url: `${siteUrl}/clinic`,
    logo: `${siteUrl}/brand/fma/horizontal-gold.svg`,
    telephone: telHref(settings.clinicPhone).replace('tel:', ''),
    ...(settings.clinicEmail ? { email: settings.clinicEmail } : {}),
    sameAs: [settings.clinicInstagram, settings.clinicFacebook].filter(Boolean),
    department: branches.map((b) => ({
      '@type': 'MedicalClinic',
      name: `French Medical Aesthetics, ${b.name}`,
      url: `${siteUrl}/clinic/branches/${b.slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
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
            {signature.length > 0 && (
              <ul
                className="rise rise-3 mt-12 flex flex-wrap gap-2.5"
                aria-label="Signature treatments"
              >
                {signature.map((t) => (
                  <li key={t.id}>
                    <Link href={treatmentHref(t)} className="chip">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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

      {/* Concern finder */}
      {concerns.length > 0 && treatments.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_2fr] lg:items-center lg:gap-16 lg:py-20">
            <div data-reveal="">
              <p className="label eyebrow">Start with your concern</p>
              <h2 className="mt-5 text-[2.25rem] sm:text-[2.75rem]">
                What would you
                <span className="block italic text-accent">like to improve?</span>
              </h2>
            </div>
            <ul data-reveal="" className="flex flex-wrap gap-2.5">
              {concerns.map((concern) => (
                <li key={concern.id}>
                  <Link href={`/clinic/concerns/${concern.slug}`} className="chip">
                    {concern.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Signature treatments */}
      {signature.length > 0 && (
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
                <li key={t.id} className="flex flex-col gap-4 bg-bg p-7 sm:p-10">
                  <TreatmentStatus treatment={t} />
                  <h3 className="text-[2rem]">
                    <Link href={treatmentHref(t)} className="hover:text-accent">
                      <Numerals>{t.name}</Numerals>
                    </Link>
                  </h3>
                  <p>{t.summary || t.promise}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-3 pt-4">
                    <Link href={treatmentHref(t)} className="link-arrow">
                      View treatment <ArrowRightIcon size={18} />
                    </Link>
                    <WhatsAppLink
                      number={whatsapp}
                      message={clinicMessages.treatment(t.name)}
                      side="clinic"
                      label={`signature-${t.slug}`}
                      className="text-sm font-bold text-muted transition-colors hover:text-heading"
                    >
                      Ask on WhatsApp
                    </WhatsAppLink>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Results vary from person to person. Treatment is subject to medical assessment.
            </p>
          </Container>
        </section>
      )}

      {/* Categories */}
      {menu.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div
              data-reveal=""
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <SectionHeading eyebrow="Treatments" title="Explore" accent="by category." />
              <Link href="/clinic/treatments" className="link-arrow shrink-0">
                All treatments <ArrowRightIcon size={18} />
              </Link>
            </div>
            <ul data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {menu.map((category) => (
                <li
                  key={category.id}
                  className="relative flex flex-col border border-hairline bg-surface p-7 transition-colors hover:border-line"
                >
                  <h3 className="text-[1.75rem] leading-tight">
                    <Link
                      href={`/clinic/treatments/${category.slug}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {category.name}
                    </Link>
                  </h3>
                  {category.description && <p className="mt-3">{category.description}</p>}
                  <p className="mt-auto pt-6 text-sm text-muted">
                    {category.treatments
                      .slice(0, 3)
                      .map((t) => t.name)
                      .join(' · ')}
                    {category.treatments.length > 3 && ' · more'}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

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
            {DEFAULT_STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="label text-accent">Step {String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-[1.875rem]">{step.title}</h3>
                <p className="mt-3">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div
              data-reveal=""
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <SectionHeading eyebrow="Our team" title="The people" accent="behind your care." />
              <Link href="/clinic/doctors" className="link-arrow shrink-0">
                Meet the team <ArrowRightIcon size={18} />
              </Link>
            </div>
            <div data-reveal="" className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {doctors.slice(0, 3).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Branches */}
      {branches.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Our branches" title="Lahore" accent="and Karachi." />
            </div>
            <div data-reveal="" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} whatsapp={whatsapp} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="grid gap-14 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Questions" title="Good to" accent="know." />
              <Link href="/clinic/faq" className="link-arrow mt-8">
                All questions <ArrowRightIcon size={18} />
              </Link>
            </div>
            <div data-reveal="">
              <FaqList items={questions} />
            </div>
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
