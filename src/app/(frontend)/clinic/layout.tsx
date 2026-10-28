import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WhatsAppIcon } from '@/components/icons'
import { ClinicFooter } from '@/components/layout/ClinicFooter'
import { ClinicHeader } from '@/components/layout/ClinicHeader'
import { MobileStickyBar } from '@/components/layout/MobileStickyBar'
import { TopBar } from '@/components/layout/TopBar'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { clinicMoreNav, clinicNav, withContent } from '@/lib/nav'
import { getClinicBranches, getClinicSections, getSiteSettings } from '@/lib/payload'
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
  const [settings, branches, sections] = await Promise.all([
    getSiteSettings(),
    getClinicBranches(),
    getClinicSections(),
  ])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  // A section with nothing to show yet (e.g. no treatment signed off) stays out of the menus.
  const nav = withContent(clinicNav, sections)
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
