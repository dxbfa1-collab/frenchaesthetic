import { HeartHandshake, ScanFace, Waves } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { BranchCard } from '@/components/clinic/BranchCard'
import { DoctorCard } from '@/components/clinic/DoctorCard'
import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { HeroSlider, type Slide } from '@/components/motion/HeroSlider'
import { Marquee } from '@/components/motion/Marquee'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { FaqList } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { IconBadge, TopicIcon } from '@/components/ui/TopicIcon'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { categoryPhoto, SITE_PHOTOS, treatmentPhoto } from '@/lib/images'
import { publicImage } from '@/lib/media'
import {
  getClinicBranches,
  getClinicDoctors,
  getClinicFaqs,
  getConcerns,
  getSiteSettings,
  getTreatmentMenu,
} from '@/lib/payload'
import { siteUrl } from '@/lib/site'
import { DEFAULT_STEPS, treatmentHref } from '@/lib/treatments'
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
  {
    topic: 'doctor',
    title: 'Doctor-led care',
    text: 'Every plan starts with an in-person medical assessment.',
  },
  {
    topic: 'technology',
    title: 'Modern technology',
    text: 'Focused ultrasound, radiofrequency, lasers and AI skin analysis, explained in plain words.',
  },
  {
    topic: 'price',
    title: 'Fair, transparent pricing',
    text: 'You receive a clear quote at your consultation, before any treatment begins.',
  },
  { topic: 'branches', title: 'Four branches', text: 'Three in Lahore and one in Karachi.' },
]

const STEP_TOPICS = ['consultation', 'plan', 'treatment', 'aftercare']

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
  const lifting = menu.find((c) => c.slug === 'face-lifting-and-tightening')
  // Bento grid of 4 columns: the first tile takes 4 cells and the fourth 2; the last tile widens
  // when that would otherwise leave an empty cell at the end.
  const tileGap = (4 - ((menu.length + (menu.length > 3 ? 4 : 3)) % 4)) % 4
  const facials = menu.find((c) => c.slug === 'skin-and-facials')

  const whatsappButton = (
    label: string,
    place: string,
    message = clinicMessages.consultation(),
  ) => (
    <WhatsAppLink
      number={whatsapp}
      message={message}
      side="clinic"
      label={place}
      className={buttonClass('primary', { size: 'lg' })}
    >
      <WhatsAppIcon size={20} />
      {label}
    </WhatsAppLink>
  )

  // Owner, 29 Oct 2026: a slider of 2–3 slides on the clinic home.
  const slides: Slide[] = [
    {
      id: 'lift',
      eyebrow: 'Face lifting & tightening',
      title: 'Lift and tighten,',
      accent: 'without surgery.',
      text: 'Focused ultrasound and energy-based treatments for the face, jawline and neck, planned by a doctor for your skin.',
      image: treatmentPhoto('hifu-22d-skin-tightening') ?? undefined,
      badge: { icon: <Waves size={22} />, label: 'Non-surgical, doctor-led' },
      actions: (
        <>
          {whatsappButton('Book on WhatsApp', 'slider-lift')}
          <ButtonLink
            href={lifting ? `/clinic/treatments/${lifting.slug}` : '/clinic/treatments'}
            variant="outline"
            size="lg"
          >
            Explore treatments
          </ButtonLink>
        </>
      ),
    },
    {
      id: 'glow',
      eyebrow: 'Skin & facials',
      title: 'Healthy, glowing skin,',
      accent: 'made simple.',
      text: 'Hydrating facials, peels and laser facials, chosen after an assessment of your skin type.',
      image: treatmentPhoto('hydrating-facial') ?? undefined,
      badge: { icon: <ScanFace size={22} />, label: 'AI skin analysis at participating branches' },
      actions: (
        <>
          {whatsappButton('Ask on WhatsApp', 'slider-glow', clinicMessages.treatment('facials'))}
          <ButtonLink
            href={facials ? `/clinic/treatments/${facials.slug}` : '/clinic/treatments'}
            variant="outline"
            size="lg"
          >
            See facials
          </ButtonLink>
        </>
      ),
    },
    {
      id: 'care',
      eyebrow: 'French Medical Aesthetics · Lahore & Karachi',
      title: 'Premium care,',
      accent: 'priced with fairness.',
      text:
        freeAt.length > 0
          ? `A doctor-led assessment and a clear quote before any treatment. Free consultation at ${listFormat.format(freeAt)}.`
          : 'A doctor-led assessment and a clear quote before any treatment.',
      image: SITE_PHOTOS.consultation,
      badge: { icon: <HeartHandshake size={22} />, label: 'A clear quote before treatment' },
      actions: (
        <>
          {whatsappButton('Book on WhatsApp', 'slider-care')}
          <ButtonLink href="/clinic/book" variant="outline" size="lg">
            Book a Consultation
          </ButtonLink>
        </>
      ),
    },
  ]

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

      <HeroSlider slides={slides} label="French Medical Aesthetics highlights" />

      {treatments.length > 0 && (
        <Marquee
          label="Treatments"
          items={treatments.map((t) => ({ label: t.name, href: treatmentHref(t), topic: t.slug }))}
        />
      )}

      {/* Concern finder */}
      {concerns.length > 0 && treatments.length > 0 && (
        <section>
          <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_2fr] lg:items-center lg:gap-16 lg:py-20">
            <div data-reveal="">
              <p className="label eyebrow">Start with your concern</p>
              <h2 className="mt-5 text-[2.25rem] sm:text-[2.75rem]">
                What would you
                <span className="block italic text-accent">like to improve?</span>
              </h2>
            </div>
            <ul data-reveal="" className="stagger flex flex-wrap gap-2.5">
              {concerns.map((concern) => (
                <li key={concern.id}>
                  <Link href={`/clinic/concerns/${concern.slug}`} className="chip chip-hover">
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
            <div
              data-reveal=""
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <SectionHeading
                eyebrow="Signature treatments"
                title="Lift, tighten,"
                accent="refresh."
                intro="The treatments our patients ask about most. Your doctor confirms what suits you at consultation."
              />
              <Link href="/clinic/treatments" className="link-arrow shrink-0">
                All treatments <ArrowRightIcon size={18} />
              </Link>
            </div>
            <div data-reveal="" className="stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {signature.map((t) => (
                <TreatmentCard key={t.id} treatment={t} />
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">
              Results vary from person to person. Treatment is subject to medical assessment.
            </p>
          </Container>
        </section>
      )}

      {/* Categories as photo tiles */}
      {menu.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Treatments" title="Explore" accent="by category." />
            </div>
            <ul
              data-reveal=""
              className="stagger mt-12 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {menu.map((category, i) => {
                const uploaded = publicImage(category.image)
                const photo = uploaded
                  ? { src: uploaded.url!, alt: uploaded.alt, position: undefined }
                  : categoryPhoto(category.slug)
                return (
                  <li
                    key={category.id}
                    className={
                      i === 0
                        ? 'sm:col-span-2 sm:row-span-2'
                        : i === 3 || (i === menu.length - 1 && tileGap > 0)
                          ? 'lg:col-span-2'
                          : undefined
                    }
                  >
                    <Link
                      href={`/clinic/treatments/${category.slug}`}
                      className="tile group tone-dark relative flex h-full flex-col justify-end overflow-hidden rounded-2xl bg-deep-charcoal p-6"
                    >
                      {photo && (
                        <Image
                          src={photo.src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="-z-0 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          style={{ objectPosition: photo.position ?? 'center' }}
                        />
                      )}
                      <span className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/45 to-transparent" />
                      <span className="relative flex items-end justify-between gap-4">
                        <span>
                          <span className="icon-badge mb-4">
                            <TopicIcon topic={category.slug} />
                          </span>
                          <span className="block font-display text-2xl font-bold text-ivory">
                            {category.name}
                          </span>
                          <span className="mt-1 block text-sm text-ivory/75">
                            {category.treatments.length} treatment
                            {category.treatments.length === 1 ? '' : 's'}
                          </span>
                        </span>
                        <span className="tile-arrow" aria-hidden="true">
                          <ArrowRightIcon size={20} />
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
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
            <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
              <Image
                src={SITE_PHOTOS.reception.src}
                alt={SITE_PHOTOS.reception.alt}
                fill
                sizes="40vw"
                className="object-cover"
                style={{ objectPosition: SITE_PHOTOS.reception.position }}
              />
            </div>
          </div>
          <ul data-reveal="" className="stagger grid gap-5 self-center sm:grid-cols-2">
            {reasons.map((r) => (
              <li
                key={r.title}
                className="group lift rounded-2xl border border-hairline bg-surface p-7"
              >
                <IconBadge topic={r.topic} />
                <h3 className="mt-6 text-[1.375rem]">{r.title}</h3>
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
          <ol
            data-reveal=""
            className="steps stagger relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          >
            {DEFAULT_STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="step-icon">
                  <TopicIcon topic={STEP_TOPICS[i]} size={26} />
                </span>
                <span className="label mt-6 block text-accent">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[1.5rem]">{step.title}</h3>
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
            <div data-reveal="" className="stagger mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
            <div data-reveal="" className="stagger mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Closing CTA over a photo */}
      <section className="tone-dark relative isolate overflow-hidden border-t border-hairline bg-charcoal">
        <Image
          src={SITE_PHOTOS.waitingRoom.src}
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover opacity-40"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-charcoal/70" />
        <Container className="py-24 text-center lg:py-32">
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
