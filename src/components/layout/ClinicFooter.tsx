import Link from 'next/link'

import { FmaLogo } from '@/components/brand/Logo'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { type NavItem, policyNav } from '@/lib/nav'
import { clinicMessages, telHref } from '@/lib/whatsapp'
import type { Branch, SiteSettings } from '@/payload-types'

import { FooterBase, FooterColumn, SocialLinks } from './FooterParts'

const contactLink = 'inline-flex items-center gap-3 text-fg transition-colors hover:text-heading'

export function ClinicFooter({
  settings,
  branches,
  nav,
}: {
  settings: SiteSettings
  branches: Branch[]
  nav: NavItem[]
}) {
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <footer className="tone-dark border-t border-hairline">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:py-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/clinic"
            aria-label="French Medical Aesthetics, clinic home"
            className="inline-block"
          >
            <FmaLogo variant="horizontal" width={320} />
          </Link>
          <p className="mt-12 max-w-xs text-muted">Premium care, priced with fairness.</p>
        </div>

        <FooterColumn title="Clinic" items={nav} />

        <div>
          <p className="label text-accent">Branches</p>
          <ul className="mt-5 space-y-4">
            {branches.map((branch) => (
              <li key={branch.id}>
                <Link href={`/clinic/branches/${branch.slug}`} className="group block">
                  <span className="text-fg transition-colors group-hover:text-heading">
                    {branch.name}
                  </span>
                  <span className="block text-sm text-muted">{branch.city}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label text-accent">Contact</p>
          <ul className="mt-5 space-y-4">
            <li>
              <a
                href={telHref(settings.clinicPhone)}
                data-track="phone_click"
                data-side="clinic"
                data-label="footer"
                className={contactLink}
              >
                <PhoneIcon className="text-gold" />
                UAN {settings.clinicPhone}
              </a>
            </li>
            <li>
              <WhatsAppLink
                number={whatsapp}
                message={clinicMessages.consultation()}
                side="clinic"
                label="footer"
                className={contactLink}
              >
                <WhatsAppIcon className="text-gold" />
                WhatsApp
              </WhatsAppLink>
            </li>
            {settings.clinicEmail && (
              <li>
                <a href={`mailto:${settings.clinicEmail}`} className={contactLink}>
                  <MailIcon className="text-gold" />
                  {settings.clinicEmail}
                </a>
              </li>
            )}
          </ul>
          <SocialLinks
            instagram={settings.clinicInstagram}
            facebook={settings.clinicFacebook}
            name="French Medical Aesthetics"
          />
        </div>
      </Container>
      <FooterBase
        cookieSettings={Boolean(settings.ga4Id || settings.metaPixelId)}
        disclaimer={settings.medicalDisclaimer}
        copyright="French Medical Aesthetics"
        links={policyNav}
      />
    </footer>
  )
}
