import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WhatsAppIcon } from '@/components/icons'
import { ClinicFooter } from '@/components/layout/ClinicFooter'
import { ClinicHeader } from '@/components/layout/ClinicHeader'
import { MobileStickyBar } from '@/components/layout/MobileStickyBar'
import { TopBar } from '@/components/layout/TopBar'
import { buttonClass, ButtonLink } from '@/components/ui/Button'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicBranches, getSiteSettings } from '@/lib/payload'
import { clinicMessages, telHref } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: { default: 'French Medical Aesthetics', template: '%s · French Medical Aesthetics' },
}

/** Clinic chrome: FMA logo, clinic menu, the UAN only, and a Book + WhatsApp bar on phones. */
export default async function ClinicLayout({ children }: { children: ReactNode }) {
  const [settings, branches] = await Promise.all([getSiteSettings(), getClinicBranches()])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <TopBar
        side="clinic"
        contact={{
          label: `UAN / WhatsApp ${settings.clinicPhone}`,
          href: telHref(settings.clinicPhone),
        }}
      />
      <ClinicHeader phone={settings.clinicPhone} whatsapp={whatsapp} />
      <main id="main">{children}</main>
      <ClinicFooter settings={settings} branches={branches} />

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
