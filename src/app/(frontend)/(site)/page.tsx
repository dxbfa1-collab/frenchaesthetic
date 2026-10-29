import { GraduationCap, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { type SitePhoto, SITE_PHOTOS } from '@/lib/images'
import { getSiteSettings } from '@/lib/payload'
import { academyMessages, clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: { absolute: 'French Medical Aesthetics · French Aesthetics Academy' },
  description:
    'Doctor-led aesthetic treatments at four branches in Lahore and Karachi, and hands-on aesthetics training in Lahore with a 2-week supervised internship.',
  alternates: { canonical: '/' },
}

/*
  The shared home (owner, 29 Oct 2026: make it simpler): two large doors, nothing else to read.
  Names are set in type, never logos side by side (brand rule).
*/
export default async function HomePage() {
  const settings = await getSiteSettings()
  const clinicWhatsApp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <section aria-label="Choose where to go" className="relative">
      <h1 className="sr-only">French Medical Aesthetics and French Aesthetics Academy</h1>
      <div className="grid min-h-[calc(100svh-2.75rem)] gap-px bg-hairline md:grid-cols-2">
        <Door
          photo={SITE_PHOTOS.facial}
          icon={<Sparkles size={30} strokeWidth={1.5} />}
          label="Treatments"
          title="French Medical Aesthetics"
          text="Doctor-led skin, face and body treatments in Lahore and Karachi."
          href="/clinic"
          cta="Visit the Clinic"
          whatsapp={
            <WhatsAppLink
              number={clinicWhatsApp}
              message={clinicMessages.consultation()}
              side="clinic"
              label="home-door"
              className="door-whatsapp"
            >
              <WhatsAppIcon size={18} />
              {settings.clinicPhone}
            </WhatsAppLink>
          }
        />
        <Door
          photo={SITE_PHOTOS.supervisedPractice}
          icon={<GraduationCap size={30} strokeWidth={1.5} />}
          label="Training"
          title="French Aesthetics Academy"
          text="Hands-on aesthetics courses in Lahore, with a supervised internship."
          href="/academy"
          cta="Explore the Academy"
          whatsapp={
            <WhatsAppLink
              number={settings.admissionsWhatsApp}
              message={academyMessages.page('MAIN')}
              side="academy"
              label="home-door"
              className="door-whatsapp"
            >
              <WhatsAppIcon size={18} />
              {settings.admissionsWhatsApp}
            </WhatsAppLink>
          }
        />
      </div>
    </section>
  )
}

function Door({
  photo,
  icon,
  label,
  title,
  text,
  href,
  cta,
  whatsapp,
}: {
  photo: SitePhoto
  icon: ReactNode
  label: string
  title: string
  text: string
  href: string
  cta: string
  whatsapp: ReactNode
}) {
  return (
    <article className="door group tone-dark relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden bg-charcoal p-7 sm:p-12 lg:p-16">
      <Image
        src={photo.src}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="door-photo -z-20 object-cover"
        style={{ objectPosition: photo.position ?? 'center' }}
      />
      <div aria-hidden="true" className="door-shade absolute inset-0 -z-10" />
      <span className="door-icon rise">{icon}</span>
      <p className="label mt-8 text-accent rise rise-2">{label}</p>
      <h2 className="mt-3 max-w-md text-[2.25rem] leading-tight text-ivory sm:text-5xl rise rise-2">
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </h2>
      <p className="mt-4 max-w-sm text-lg text-ivory/85 rise rise-3">{text}</p>
      <div className="relative z-10 mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 rise rise-3">
        {/* Sits above the card's stretched link, so it needs its own link; the heading link stays the one tab stop. */}
        <Link href={href} tabIndex={-1} aria-hidden="true" className="btn btn-primary btn-lg door-cta">
          {cta}
          <ArrowRightIcon size={18} />
        </Link>
        {whatsapp}
      </div>
    </article>
  )
}
