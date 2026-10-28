import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { BranchCard } from '@/components/clinic/BranchCard'
import { DoctorCard } from '@/components/clinic/DoctorCard'
import { TreatmentCard } from '@/components/clinic/TreatmentCard'
import { TreatmentStatus } from '@/components/clinic/TreatmentStatus'
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { FaqList } from '@/components/ui/FaqList'
import { JsonLd } from '@/components/ui/JsonLd'
import { Numerals } from '@/components/ui/Numerals'
import { OfferPanel } from '@/components/ui/OfferPanel'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { treatmentPhoto } from '@/lib/images'
import { publicImage } from '@/lib/media'
import {
  findTreatment,
  getClinicBranches,
  getClinicDoctors,
  getClinicFaqs,
  getConcerns,
  getResults,
  getReviews,
  getSiteSettings,
  getTreatmentMenu,
  getTreatments,
} from '@/lib/payload'
import { relationId } from '@/lib/relation'
import { siteUrl } from '@/lib/site'
import { DEFAULT_STEPS, TREATMENT_DISCLAIMER, treatmentHref } from '@/lib/treatments'
import { clinicMessages } from '@/lib/whatsapp'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateStaticParams() {
  return (await getTreatments()).map((t) => ({ category: t.category.slug, slug: t.slug }))
}

/** The treatment, if it may be shown on this site (live, or any treatment on staging). */
async function shownTreatment(slug: string) {
  return (await getTreatments()).find((t) => t.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const treatment = await shownTreatment((await params).slug)
  if (!treatment) return {}
  const image = publicImage(treatment.heroImage)
  return {
    title: treatment.metaTitle || treatment.name,
    description: treatment.metaDescription || treatment.promise || treatment.summary || undefined,
    alternates: { canonical: treatmentHref(treatment) },
    openGraph: image ? { images: [{ url: image.url!, alt: image.alt }] } : undefined,
  }
}

const ids = (values?: unknown[] | null) =>
  new Set((values ?? []).map(relationId).filter((id): id is string => Boolean(id)))

const absolute = (url: string) => (url.startsWith('/') ? `${siteUrl}${url}` : url)

export default async function TreatmentPage({ params }: Props) {
  const { category: categorySlug, slug } = await params
  const treatment = await shownTreatment(slug)
  if (!treatment) {
    // Not on the live site (yet): send visitors and old links to its category, or the full list.
    const hidden = await findTreatment(slug)
    if (!hidden) notFound()
    const menu = await getTreatmentMenu()
    redirect(
      menu.some((c) => c.id === hidden.category.id)
        ? `/clinic/treatments/${hidden.category.slug}`
        : '/clinic/treatments',
    )
  }
  if (treatment.category.slug !== categorySlug) permanentRedirect(treatmentHref(treatment))

  const [settings, branches, doctors, concerns, faqs, results, reviews, treatments] =
    await Promise.all([
      getSiteSettings(),
      getClinicBranches(),
      getClinicDoctors(),
      getConcerns(),
      getClinicFaqs(),
      getResults(),
      getReviews(),
      getTreatments(),
    ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const message = clinicMessages.treatment(treatment.name)
  const bookHref = `/clinic/book?treatment=${treatment.slug}`

  const branchIds = ids(treatment.branches)
  const offeredAt = branches.filter((b) => branchIds.has(b.id))
  const doctorIds = ids(treatment.doctors)
  const performedBy = doctors.filter((d) => doctorIds.has(d.id))
  const concernIds = ids(treatment.concerns)
  const helpsWith = concerns.filter((c) => concernIds.has(c.id))
  const ownFaqs = faqs.filter((f) => relationId(f.treatment) === treatment.id)
  const generalFaqs = faqs.filter((f) => !f.treatment).slice(0, 4)
  const cases = results.filter((r) => relationId(r.treatment) === treatment.id)
  const quotes = reviews.filter((r) => relationId(r.treatment) === treatment.id).slice(0, 3)
  const relatedIds = ids(treatment.related)
  const related = (
    relatedIds.size > 0
      ? treatments.filter((t) => relatedIds.has(t.id))
      : treatments.filter((t) => t.category.id === treatment.category.id && t.id !== treatment.id)
  ).slice(0, 3)

  const quick = treatment.quickFacts
  const facts: Array<[string, string]> = []
  for (const [label, value] of [
    ['Session time', quick?.sessionTime],
    ['Downtime', quick?.downtime],
    ['Sessions', quick?.sessions],
    ['Results visible', quick?.resultsVisible],
    ['Results last', quick?.resultsLast],
  ] as const) {
    if (value) facts.push([label, value])
  }
  const steps = treatment.steps && treatment.steps.length > 0 ? treatment.steps : DEFAULT_STEPS
  const suits = treatment.suits ?? []
  const avoid = treatment.avoid ?? []
  const aftercare = treatment.aftercare ?? []
  const timeline = treatment.timeline ?? []
  const priceFactors = treatment.priceFactors ?? []
  const uploaded = publicImage(treatment.heroImage)
  // A photo uploaded in the CMS wins; otherwise the illustrative photo for this treatment.
  const hero = uploaded
    ? { url: uploaded.url!, alt: uploaded.alt, focal: focalPoint(uploaded) }
    : (() => {
        const p = treatmentPhoto(treatment.slug)
        return p
          ? { url: p.src, alt: p.alt, focal: { objectPosition: p.position ?? 'center' } }
          : null
      })()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: treatment.name,
    description: treatment.summary || treatment.promise || undefined,
    url: `${siteUrl}${treatmentHref(treatment)}`,
    ...(treatment.howItWorks ? { howPerformed: treatment.howItWorks } : {}),
    ...(hero ? { image: absolute(hero.url) } : {}),
  }

  const whatsappButton = (label: string, place: string, size: 'md' | 'lg' = 'lg') => (
    <WhatsAppLink
      number={whatsapp}
      message={message}
      side="clinic"
      label={`treatment-${treatment.slug}-${place}`}
      className={buttonClass('primary', { size })}
    >
      <WhatsAppIcon size={20} />
      {label}
    </WhatsAppLink>
  )

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        breadcrumbs={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs
              items={[
                { label: 'Clinic', href: '/clinic' },
                { label: 'Treatments', href: '/clinic/treatments' },
                { label: treatment.category.name, href: `/clinic/treatments/${categorySlug}` },
                { label: treatment.name, href: treatmentHref(treatment) },
              ]}
            />
            <TreatmentStatus treatment={treatment} />
          </div>
        }
        eyebrow={treatment.category.name}
        title={<Numerals>{treatment.name}</Numerals>}
        intro={
          <>
            {treatment.promise && <p className="font-semibold text-heading">{treatment.promise}</p>}
            {treatment.summary && (
              <p className={treatment.promise ? 'mt-4' : undefined}>{treatment.summary}</p>
            )}
          </>
        }
        actions={
          <>
            {whatsappButton('Ask on WhatsApp', 'hero')}
            <ButtonLink href={bookHref} variant="outline" size="lg">
              Book a Consultation
            </ButtonLink>
          </>
        }
        note={TREATMENT_DISCLAIMER}
        aside={
          facts.length > 0 ? (
            <div className="tone-dark rounded-[6px] border border-hairline bg-deep-charcoal p-7 sm:p-9">
              <p className="label text-accent">At a glance</p>
              <dl className="mt-4 divide-y divide-hairline">
                {facts.map(([label, value]) => (
                  <div key={label} className="py-4">
                    <dt className="label text-muted">{label}</dt>
                    <dd className="mt-1.5 text-lg font-semibold text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 border-t border-hairline pt-5 text-sm text-muted">
                Your doctor confirms what applies to you at consultation.
              </p>
            </div>
          ) : (
            <OfferPanel
              title="Your consultation"
              points={[
                'Doctor-led skin assessment',
                'An honest plan, including what it will not do',
                'A clear quote before any treatment',
              ]}
            />
          )
        }
      />

      {hero && (
        <Container className="pb-16 lg:pb-24">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[21/9]">
            <Image
              src={hero.url}
              alt={hero.alt}
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="hero-kenburns object-cover"
              style={hero.focal}
            />
          </div>
        </Container>
      )}

      {/* What it is, how it works, what it will not do */}
      {(treatment.howItWorks || treatment.limits || helpsWith.length > 0) && (
        <section className="border-t border-hairline">
          <Container className="grid gap-14 py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="How it works" title="What to" accent="expect." />
              {treatment.howItWorks && <p className="mt-8 text-lg">{treatment.howItWorks}</p>}
              {helpsWith.length > 0 && (
                <div className="mt-10">
                  <p className="label text-muted">Concerns it may help with</p>
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {helpsWith.map((concern) => (
                      <li key={concern.id}>
                        <Link href={`/clinic/concerns/${concern.slug}`} className="chip">
                          {concern.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {treatment.limits && (
              <aside data-reveal="" className="self-start border-l-2 border-gold pl-6 lg:mt-24">
                <p className="label text-accent">What it will not do</p>
                <p className="mt-4 text-lg">{treatment.limits}</p>
              </aside>
            )}
          </Container>
        </section>
      )}

      {/* Who it may suit, and the screening questions */}
      {(suits.length > 0 || avoid.length > 0) && (
        <section className="tone-inverse">
          <Container className="grid gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
            {suits.length > 0 && (
              <div data-reveal="">
                <SectionHeading eyebrow="Is it for you?" title="Who it" accent="may suit." />
                <ul className="mt-8 space-y-4">
                  {suits.map((line) => (
                    <li key={line.id ?? line.text} className="flex items-start gap-3 text-lg">
                      <CheckIcon size={22} className="mt-0.5 shrink-0 text-accent" />
                      {line.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {avoid.length > 0 && (
              <div data-reveal="">
                <SectionHeading eyebrow="Your safety" title="Tell your" accent="doctor if…" />
                <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
                  {avoid.map((line) => (
                    <li key={line.id ?? line.text} className="py-4 text-lg">
                      {line.text}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-muted">
                  Your doctor goes through your medical history with you before any treatment.
                </p>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* The visit, step by step */}
      <section>
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Your visit"
              title="Step by step,"
              accent="from consultation to aftercare."
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

      {/* Results timeline and aftercare */}
      {(timeline.length > 0 || aftercare.length > 0) && (
        <section className="border-t border-hairline">
          <Container className="grid gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
            {timeline.length > 0 && (
              <div data-reveal="">
                <SectionHeading eyebrow="Results" title="What happens" accent="and when." />
                <ol className="mt-10 space-y-0 border-l border-line">
                  {timeline.map((row) => (
                    <li key={row.id ?? row.when} className="relative pb-8 pl-8 last:pb-0">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-gold"
                      />
                      <p className="label text-accent">{row.when}</p>
                      <p className="mt-2 text-lg">{row.text}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 text-sm text-muted">Results vary from person to person.</p>
              </div>
            )}
            {aftercare.length > 0 && (
              <div data-reveal="">
                <SectionHeading eyebrow="Aftercare" title="Looking after" accent="your skin." />
                <ul className="mt-8 space-y-4">
                  {aftercare.map((line) => (
                    <li key={line.id ?? line.text} className="flex items-start gap-3 text-lg">
                      <CheckIcon size={22} className="mt-0.5 shrink-0 text-accent" />
                      {line.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Before and afters, consented only */}
      {cases.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading
                eyebrow="Before and after"
                title="Real patients,"
                accent="shared with consent."
              />
            </div>
            <ul data-reveal="" className="mt-12 grid gap-10 lg:grid-cols-2">
              {cases.map((result) => (
                <li key={result.id}>
                  <div className="grid grid-cols-2 gap-2">
                    {(['before', 'after'] as const).map((side) => {
                      const photo = result[side] as Media
                      return (
                        <figure key={side} className="relative aspect-square overflow-hidden">
                          <Image
                            src={photo.url!}
                            alt={photo.alt}
                            fill
                            sizes="(min-width: 1024px) 300px, 50vw"
                            className="object-cover"
                          />
                          <figcaption className="pill absolute left-3 top-3">
                            {side === 'before' ? 'Before' : 'After'}
                          </figcaption>
                        </figure>
                      )
                    })}
                  </div>
                  <p className="mt-4 font-semibold text-heading">{result.caption}</p>
                  {(result.sessions || result.timeBetween) && (
                    <p className="mt-1 text-sm text-muted">
                      {[result.sessions, result.timeBetween].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted">
              Shown with each patient&apos;s written consent. Individual results vary.
            </p>
          </Container>
        </section>
      )}

      {/* Price: given at consultation (owner, 28 Oct 2026: no prices on the website) */}
      <section className="border-t border-hairline">
        <Container className="grid gap-14 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Price"
              title="Your price is given"
              accent="at consultation."
              intro="You receive a clear quote once your doctor has assessed your skin and agreed a plan with you, before any treatment begins. You can also ask for a quote on WhatsApp."
            />
            <div className="mt-10">
              {whatsappButton('Ask for a Quote on WhatsApp', 'price', 'md')}
            </div>
          </div>
          {priceFactors.length > 0 && (
            <OfferPanel
              title="What changes the price"
              points={priceFactors.map((line) => line.text)}
            />
          )}
        </Container>
      </section>

      {/* Where, and who */}
      <section className="tone-inverse">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            {performedBy.length > 0 ? (
              <SectionHeading eyebrow="Where" title="Branches and" accent="doctors." />
            ) : (
              <SectionHeading eyebrow="Where" title="Where it is" accent="offered." />
            )}
          </div>
          {offeredAt.length > 0 ? (
            <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {offeredAt.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  whatsapp={whatsapp}
                  message={clinicMessages.consultation(branch.name)}
                />
              ))}
            </div>
          ) : (
            <p data-reveal="" className="mt-8 max-w-2xl text-lg">
              Availability differs by branch. Ask us on WhatsApp which branch offers{' '}
              {treatment.name.replace(/\s*\(.*\)$/, '')}, and when.
            </p>
          )}
          {performedBy.length > 0 && (
            <div data-reveal="" className="mt-14">
              <p className="label text-muted">Performed by</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {performedBy.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          )}
          <Link href="/clinic/branches" className="link-arrow mt-12">
            All branches <ArrowRightIcon size={18} />
          </Link>
        </Container>
      </section>

      {/* Reviews: real, consented ones only */}
      {quotes.length > 0 && (
        <section>
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Reviews" title="In our" accent="patients' words." />
            </div>
            <ul data-reveal="" className="mt-12 grid gap-5 lg:grid-cols-3">
              {quotes.map((review) => (
                <li key={review.id} className="border border-hairline bg-surface p-7">
                  <blockquote className="text-lg">&ldquo;{review.text}&rdquo;</blockquote>
                  <p className="mt-5 font-semibold text-heading">
                    {review.name}
                    {review.source && (
                      <span className="font-normal text-muted"> · {review.source}</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Questions, and related treatments */}
      <section className="border-t border-hairline">
        <Container className="grid gap-16 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading eyebrow="Questions" title="Good to" accent="know." />
            <Link href="/clinic/faq" className="link-arrow mt-8">
              All questions <ArrowRightIcon size={18} />
            </Link>
          </div>
          <div data-reveal="">
            <FaqList items={[...ownFaqs, ...generalFaqs]} />
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-20 lg:py-28">
            <div data-reveal="">
              <SectionHeading eyebrow="Related" title="You may also" accent="ask about." />
            </div>
            <div data-reveal="" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TreatmentCard key={t.id} treatment={t} showCategory />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand
        title="Talk it through"
        accent="with a doctor."
        intro="Message us on WhatsApp or book a consultation at the branch that suits you."
      >
        {whatsappButton('Ask on WhatsApp', 'closing')}
        <ButtonLink href={bookHref} variant="outline" size="lg">
          Book a Consultation
        </ButtonLink>
      </CtaBand>
    </>
  )
}

/** Uses the focal point set in the admin, so the crop keeps what matters. */
function focalPoint(media: Media) {
  return media.focalX != null && media.focalY != null
    ? { objectPosition: `${media.focalX}% ${media.focalY}%` }
    : undefined
}
