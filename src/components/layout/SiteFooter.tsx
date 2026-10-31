import Link from 'next/link'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { policyNav } from '@/lib/nav'
import { academyMessages, clinicMessages } from '@/lib/whatsapp'
import type { SiteSettings } from '@/payload-types'

import { FooterBase } from './FooterParts'

const contactLink = 'inline-flex items-center gap-3 text-fg transition-colors hover:text-heading'

/** Footer for shared pages: each business with its own number, names in type only (no logos side by side). */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const clinicWhatsApp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <footer className="tone-dark border-t border-hairline">
      <Container className="grid gap-14 py-16 md:grid-cols-2 lg:py-20">
        <div>
          <p className="label text-accent">The clinic</p>
          <p className="mt-4 font-display text-[2rem] leading-tight text-heading">
            French Medical Aesthetics
          </p>
          <p className="mt-2 text-muted">Lahore and Karachi</p>
          <ul className="mt-6 space-y-4">
            <li>
              <WhatsAppLink
                number={clinicWhatsApp}
                message={clinicMessages.consultation()}
                side="clinic"
                label="site-footer"
                className={contactLink}
              >
                <WhatsAppIcon className="text-accent" />
                UAN / WhatsApp {settings.clinicPhone}
              </WhatsAppLink>
            </li>
            <li>
              <Link href="/clinic" className="link-arrow">
                Visit the Clinic <ArrowRightIcon size={18} />
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="label text-accent">The academy</p>
          <p className="mt-4 font-display text-[2rem] leading-tight text-heading">
            French Aesthetics Academy
          </p>
          <p className="mt-2 text-muted">Lahore</p>
          <ul className="mt-6 space-y-4">
            <li>
              <WhatsAppLink
                number={settings.admissionsWhatsApp}
                message={academyMessages.page('MAIN')}
                side="academy"
                label="site-footer"
                className={contactLink}
              >
                <WhatsAppIcon className="text-accent" />
                Admissions WhatsApp {settings.admissionsWhatsApp}
              </WhatsAppLink>
            </li>
            <li>
              <Link href="/academy" className="link-arrow">
                Explore the Academy <ArrowRightIcon size={18} />
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <FooterBase
        cookieSettings={Boolean(settings.ga4Id || settings.metaPixelId)}
        disclaimer={settings.medicalDisclaimer}
        copyright="French Medical Aesthetics · French Aesthetics Academy"
        links={[
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          ...policyNav,
        ]}
      />
    </footer>
  )
}
