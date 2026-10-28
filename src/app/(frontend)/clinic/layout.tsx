import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WhatsAppIcon } from '@/components/icons'
import { ClinicFooter } from '@/components/layout/ClinicFooter'
import { ClinicHeader } from '@/components/layout/ClinicHeader'
import { MobileStickyBar } from '@/components/layout/MobileStickyBar'
import { TopBar } from '@/components/layout/TopBar'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { credentials } from '@/components/ui/Portrait'
import { doctorPhoto } from '@/lib/images'
import { clinicMoreNav, clinicNav, type NavItem, withContent } from '@/lib/nav'
import {
  getClinicBranches,
  getClinicDoctors,
  getClinicSections,
  getConcerns,
  getSiteSettings,
  getTreatmentMenu,
} from '@/lib/payload'
import { consultationNote, treatmentHref } from '@/lib/treatments'
import { clinicMessages, telHref } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: { default: 'French Medical Aesthetics', template: '%s · French Medical Aesthetics' },
  openGraph: {
    type: 'website',
    siteName: 'French Medical Aesthetics',
    images: [{ url: '/og/clinic.png', width: 1200, height: 630, alt: 'French Medical Aesthetics' }],
  },
}

/** Clinic chrome: FMA logo, clinic menu, the UAN only, and a Book + WhatsApp bar on phones. */
export default async function ClinicLayout({ children }: { children: ReactNode }) {
  const [settings, branches, sections, menu, concerns, doctors] = await Promise.all([
    getSiteSettings(),
    getClinicBranches(),
    getClinicSections(),
    getTreatmentMenu(),
    getConcerns(),
    getClinicDoctors(),
  ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  // Dropdown panels for the desktop header (owner, 29 Oct 2026).
  const menus: Record<string, NavItem['menu']> = {
    '/clinic/treatments': {
      columns: menu.map((category) => ({
        heading: category.name,
        href: `/clinic/treatments/${category.slug}`,
        topic: category.slug,
        items: category.treatments
          .slice(0, 5)
          .map((t) => ({ label: t.name, href: treatmentHref(t) })),
      })),
      footer: { label: 'All treatments', href: '/clinic/treatments' },
    },
    '/clinic/concerns': {
      columns: [
        {
          items: concerns.map((c) => ({
            label: c.name,
            href: `/clinic/concerns/${c.slug}`,
            topic: 'treatment',
          })),
        },
      ],
      footer: { label: 'All concerns', href: '/clinic/concerns' },
    },
    '/clinic/doctors': {
      columns: [
        {
          items: doctors.map((d) => ({
            label: d.name,
            href: `/clinic/doctors/${d.slug}`,
            topic: 'doctor',
            text: credentials(d),
            image: doctorPhoto(d.slug)?.src,
          })),
        },
      ],
      footer: { label: 'Meet the team', href: '/clinic/doctors' },
    },
    '/clinic/branches': {
      columns: [
        {
          items: branches.map((b) => ({
            label: b.name,
            href: `/clinic/branches/${b.slug}`,
            topic: 'branches',
            text: [b.city, consultationNote(b)].filter(Boolean).join(' · '),
          })),
        },
      ],
      footer: { label: 'All branches', href: '/clinic/branches' },
    },
  }
  // A section with nothing to show yet (e.g. no treatment signed off) stays out of the menus.
  const nav = withContent(clinicNav, sections).map((item) => ({ ...item, menu: menus[item.href] }))
  const moreNav = withContent(clinicMoreNav, sections)

  return (
    <>
      <TopBar
        side="clinic"
        contact={{
          label: `UAN / WhatsApp ${settings.clinicPhone}`,
          href: telHref(settings.clinicPhone),
        }}
      />
      <ClinicHeader phone={settings.clinicPhone} whatsapp={whatsapp} nav={nav} moreNav={moreNav} />
      <main id="main">{children}</main>
      <ClinicFooter
        settings={settings}
        branches={branches}
        nav={[...nav, ...moreNav.filter((item) => item.href.startsWith('/clinic/'))]}
      />

      <MobileStickyBar>
        <ButtonLink href="/clinic/book" variant="outline" aria-label="Book a consultation">
          Book
        </ButtonLink>
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.consultation()}
          side="clinic"
          label="sticky-bar"
          className={buttonClass('primary')}
        >
          <WhatsAppIcon size={18} />
          WhatsApp
        </WhatsAppLink>
      </MobileStickyBar>

      <WhatsAppLink
        number={whatsapp}
        message={clinicMessages.consultation()}
        side="clinic"
        label="floating"
        aria-label="Message the clinic on WhatsApp"
        className="whatsapp-float"
      >
        <WhatsAppIcon size={26} />
      </WhatsAppLink>
    </>
  )
}
