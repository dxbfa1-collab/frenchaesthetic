import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getSiteSettings } from '@/lib/payload'
import { academyMessages, clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: { absolute: 'French Medical Aesthetics · French Aesthetics Academy' },
  description:
    'Doctor-led aesthetic treatments at four branches in Lahore and Karachi, and hands-on aesthetics training in Lahore with a 2-week supervised internship.',
  alternates: { canonical: '/' },
}

// Only owner-confirmed facts (CLAUDE.md §5, §6). No counters, no unproven claims.
const trust = [
  {
    title: 'Doctor-led care',
    text: 'Every treatment starts with an in-person medical assessment.',
  },
  { title: 'Lahore and Karachi', text: 'Three clinic branches in Lahore and one in Karachi.' },
  {
    title: 'Internship included',
    text: 'Every academy course includes a 2-week supervised internship.',
  },
  { title: 'Small batches', text: 'A maximum of 20 students in each academy batch.' },
]

export default async function HomePage() {
  const settings = await getSiteSettings()
  const clinicWhatsApp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <section>
        <Container className="pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
          <p className="label eyebrow rise">Lahore · Karachi</p>
          <h1 className="rise rise-2 mt-6 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-7xl">
            Care for your skin.
            <span className="block italic text-accent">Training for your career.</span>
          </h1>

          <div className="rise rise-3 mt-12 grid gap-5 sm:mt-16 lg:grid-cols-2 lg:gap-6">
            <Door
              label="The clinic"
              title="French Medical"
              accent="Aesthetics"
              text="Doctor-led aesthetic treatments for skin, face and body, at three branches in Lahore and one in Karachi."
              href="/clinic"
              cta="Visit the Clinic"
              contact={
                <WhatsAppLink
                  number={clinicWhatsApp}
                  message={clinicMessages.consultation()}
                  side="clinic"
                  label="home-door"
                  className="inline-flex items-center gap-2 font-semibold text-fg transition-colors hover:text-heading"
                >
                  <WhatsAppIcon size={18} className="text-gold" />
                  {settings.clinicPhone}
                </WhatsAppLink>
              }
            />
            <Door
              label="The academy"
              title="French Aesthetics"
              accent="Academy"
              text="Hands-on aesthetics training in Lahore: 1 week of training, then a 2-week supervised internship at no extra fee."
              href="/academy"
              cta="Explore the Academy"
              contact={
                <WhatsAppLink
                  number={settings.admissionsWhatsApp}
                  message={academyMessages.page('MAIN')}
                  side="academy"
                  label="home-door"
                  className="inline-flex items-center gap-2 font-semibold text-fg transition-colors hover:text-heading"
                >
                  <WhatsAppIcon size={18} className="text-gold" />
                  {settings.admissionsWhatsApp}
                </WhatsAppLink>
              }
            />
          </div>
        </Container>
      </section>

      <section className="tone-inverse">
        <Container className="py-16 lg:py-20">
          <h2 className="sr-only">Why people choose us</h2>
          <ul data-reveal="" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {trust.map((item) => (
              <li
                key={item.title}
                className="lg:border-l lg:border-line lg:px-8 lg:first:border-l-0 lg:first:pl-0"
              >
                <h3 className="text-[1.75rem]">{item.title}</h3>
                <p className="mt-3">{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}

function Door({
  label,
  title,
  accent,
  text,
  href,
  cta,
  contact,
}: {
  label: string
  title: string
  accent: string
  text: string
  href: string
  cta: string
  contact: ReactNode
}) {
  return (
    <article className="relative flex flex-col border border-hairline bg-surface p-7 sm:p-10 lg:min-h-[26rem]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gold" />
      <p className="label text-accent">{label}</p>
      <h2 className="mt-5 text-[2.5rem] sm:text-5xl">
        {title}
        <span className="block italic text-accent">{accent}</span>
      </h2>
      <p className="mt-6 max-w-md text-lg">{text}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-5 pt-10">
        <ButtonLink href={href} size="lg">
          {cta}
          <ArrowRightIcon size={18} />
        </ButtonLink>
        {contact}
      </div>
    </article>
  )
}
