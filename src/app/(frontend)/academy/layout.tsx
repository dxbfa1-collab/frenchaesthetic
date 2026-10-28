import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WhatsAppIcon } from '@/components/icons'
import { AcademyFooter } from '@/components/layout/AcademyFooter'
import { AcademyHeader } from '@/components/layout/AcademyHeader'
import { AcademyWhatsApp } from '@/components/layout/AcademyWhatsApp'
import { FilterLine } from '@/components/layout/FilterLine'
import { MobileStickyBar } from '@/components/layout/MobileStickyBar'
import { TopBar } from '@/components/layout/TopBar'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { getAcademyCampuses, getSiteSettings } from '@/lib/payload'
import { telHref } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: { default: 'French Aesthetics Academy', template: '%s · French Aesthetics Academy' },
  openGraph: {
    type: 'website',
    siteName: 'French Aesthetics Academy',
    images: [
      { url: '/og/academy.png', width: 1200, height: 630, alt: 'French Aesthetics Academy' },
    ],
  },
}

/**
 * Academy chrome: FAA logo, academy menu, one admissions number, the filter line and a
 * WhatsApp + Enroll bar on phones. The clinic appears only through the endorsement line.
 */
export default async function AcademyLayout({ children }: { children: ReactNode }) {
  const [settings, campuses] = await Promise.all([getSiteSettings(), getAcademyCampuses()])
  const whatsapp = settings.admissionsWhatsApp

  return (
    <>
      <TopBar
        side="academy"
        contact={{ label: `Admissions WhatsApp ${whatsapp}`, href: telHref(whatsapp) }}
      />
      <AcademyHeader whatsapp={whatsapp} />
      <main id="main">{children}</main>
      <FilterLine text={settings.academyFilterLine} />
      <AcademyFooter settings={settings} campuses={campuses} />

      <MobileStickyBar>
        <ButtonLink href="/academy/enroll" variant="outline">
          Enroll Now
        </ButtonLink>
        <AcademyWhatsApp number={whatsapp} label="sticky-bar" className={buttonClass('primary')}>
          <WhatsAppIcon size={18} />
          WhatsApp Karein
        </AcademyWhatsApp>
      </MobileStickyBar>

      <AcademyWhatsApp
        number={whatsapp}
        label="floating"
        aria-label="Message admissions on WhatsApp"
        className="whatsapp-float"
      >
        <WhatsAppIcon size={26} />
      </AcademyWhatsApp>
    </>
  )
}
