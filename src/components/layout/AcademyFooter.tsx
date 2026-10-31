import Link from 'next/link'

import { FaaLogo } from '@/components/brand/Logo'
import { MailIcon, WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { Pending } from '@/components/ui/Pending'
import { academyCourseNav, policyNav } from '@/lib/nav'
import type { Branch, SiteSettings } from '@/payload-types'

import { AcademyWhatsApp } from './AcademyWhatsApp'
import { FooterBase, FooterColumn, SocialLinks } from './FooterParts'

const contactLink = 'inline-flex items-center gap-3 text-fg transition-colors hover:text-heading'

/** FAA brief §2: academy name, campuses, WhatsApp, socials and the endorsement line. No clinic numbers. */
export function AcademyFooter({
  settings,
  campuses,
}: {
  settings: SiteSettings
  campuses: Branch[]
}) {
  return (
    <footer className="tone-dark border-t border-hairline">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/academy"
            aria-label="French Aesthetics Academy, academy home"
            className="inline-block"
          >
            <FaaLogo variant="stacked" width={180} />
          </Link>
          <p className="mt-10 max-w-xs text-muted">
            The training academy of French Medical Aesthetics clinic
          </p>
        </div>

        <FooterColumn
          title="Courses"
          items={[
            ...academyCourseNav,
            { label: 'Batches', href: '/academy/batches' },
            { label: 'Enroll', href: '/academy/enroll' },
          ]}
        />

        <FooterColumn
          title="Academy"
          items={[
            { label: 'Internship', href: '/academy/internship' },
            { label: 'Faculty', href: '/academy/faculty' },
            { label: 'About the Academy', href: '/academy/about' },
            { label: 'FAQ', href: '/academy/faq' },
            { label: 'Contact', href: '/academy/contact' },
          ]}
        />

        <div>
          <p className="label text-accent">Admissions</p>
          <ul className="mt-5 space-y-4">
            <li>
              <AcademyWhatsApp
                number={settings.admissionsWhatsApp}
                label="footer"
                className={contactLink}
              >
                <WhatsAppIcon className="text-accent" />
                WhatsApp {settings.admissionsWhatsApp}
              </AcademyWhatsApp>
            </li>
            {settings.academyEmail && (
              <li>
                <a href={`mailto:${settings.academyEmail}`} className={contactLink}>
                  <MailIcon className="text-accent" />
                  {settings.academyEmail}
                </a>
              </li>
            )}
          </ul>

          {campuses.length > 0 && (
            <>
              <p className="label mt-10 text-accent">Campuses</p>
              <ul className="mt-5 space-y-4">
                {campuses.map((campus) => (
                  <li key={campus.id}>
                    <span className="text-fg">
                      {campus.shortName || campus.name}, {campus.city}
                    </span>
                    {campus.address && (
                      <span className="mt-1 block text-sm text-muted">
                        <Pending confirmed={campus.addressStatus === 'confirmed'}>
                          {campus.address}
                        </Pending>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          <SocialLinks
            instagram={settings.academyInstagram}
            facebook={settings.academyFacebook}
            name="French Aesthetics Academy"
          />
        </div>
      </Container>
      <FooterBase
        floatingButton
        cookieSettings={Boolean(settings.ga4Id || settings.metaPixelId)}
        disclaimer={settings.medicalDisclaimer}
        copyright="French Aesthetics Academy"
        links={policyNav}
      />
    </footer>
  )
}
