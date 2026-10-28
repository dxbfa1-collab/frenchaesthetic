import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/forms/ContactForm'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getAcademyCampuses, getClinicBranches, getSiteSettings } from '@/lib/payload'
import { academyMessages, clinicMessages, telHref } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact French Medical Aesthetics (clinic, Lahore and Karachi) or French Aesthetics Academy (training, Lahore) on WhatsApp, by phone or with the contact form.',
  alternates: { canonical: '/contact' },
}

const contactLink =
  'inline-flex items-center gap-3 text-lg text-fg transition-colors hover:text-heading'

export default async function ContactPage() {
  const [settings, branches, campuses] = await Promise.all([
    getSiteSettings(),
    getClinicBranches(),
    getAcademyCampuses(),
  ])
  const clinicWhatsApp = settings.clinicWhatsApp || settings.clinicPhone

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to"
        accent="the right team."
        intro={
          <p>
            WhatsApp is the quickest way to reach us. The clinic and the academy each have their own
            number, so your message goes straight to the people who can help.
          </p>
        }
      />

      <section className="border-t border-hairline">
        <Container className="grid gap-5 py-16 md:grid-cols-2 lg:py-20">
          <article className="border border-hairline bg-surface p-7 sm:p-9">
            <p className="label text-accent">Treatments</p>
            <h2 className="mt-4 text-[2.25rem] leading-tight">French Medical Aesthetics</h2>
            <ul className="mt-7 space-y-4">
              <li>
                <WhatsAppLink
                  number={clinicWhatsApp}
                  message={clinicMessages.consultation()}
                  side="clinic"
                  label="contact-page"
                  className={contactLink}
                >
                  <WhatsAppIcon className="text-gold" />
                  WhatsApp {clinicWhatsApp}
                </WhatsAppLink>
              </li>
              <li>
                <a
                  href={telHref(settings.clinicPhone)}
                  data-track="phone_click"
                  data-side="clinic"
                  data-label="contact-page"
                  className={contactLink}
                >
                  <PhoneIcon className="text-gold" />
                  UAN {settings.clinicPhone}
                </a>
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
            {branches.length > 0 && (
              <div className="mt-8 border-t border-hairline pt-6">
                <p className="label text-muted">Branches</p>
                <ul className="mt-4 space-y-2">
                  {branches.map((branch) => (
                    <li key={branch.id}>
                      <Link href={`/clinic/branches/${branch.slug}`} className="link-arrow">
                        {branch.name}, {branch.city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <article className="border border-hairline bg-surface p-7 sm:p-9">
            <p className="label text-accent">Courses</p>
            <h2 className="mt-4 text-[2.25rem] leading-tight">French Aesthetics Academy</h2>
            <ul className="mt-7 space-y-4">
              <li>
                <WhatsAppLink
                  number={settings.admissionsWhatsApp}
                  message={academyMessages.page('CONTACT')}
                  side="academy"
                  label="contact-page"
                  className={contactLink}
                >
                  <WhatsAppIcon className="text-gold" />
                  Admissions {settings.admissionsWhatsApp}
                </WhatsAppLink>
              </li>
              {settings.academyEmail && (
                <li>
                  <a href={`mailto:${settings.academyEmail}`} className={contactLink}>
                    <MailIcon className="text-gold" />
                    {settings.academyEmail}
                  </a>
                </li>
              )}
            </ul>
            {campuses.length > 0 && (
              <div className="mt-8 border-t border-hairline pt-6">
                <p className="label text-muted">Campuses, Lahore</p>
                <ul className="mt-4 space-y-2">
                  {campuses.map((campus) => (
                    <li key={campus.id} className="text-lg text-fg">
                      {campus.shortName || campus.name}
                    </li>
                  ))}
                </ul>
                <Link href="/academy/contact" className="link-arrow mt-5">
                  Academy contact page
                </Link>
              </div>
            )}
          </article>
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_1.5fr] lg:gap-20 lg:py-24">
          <div>
            <p className="label eyebrow">Write to us</p>
            <h2 className="mt-5 text-[2.375rem] sm:text-5xl">
              Send a<span className="block italic text-accent">message.</span>
            </h2>
            <p className="mt-6 text-lg">
              Prefer to write? Send your question here and the right team replies on WhatsApp. To
              book a treatment, use the{' '}
              <Link href="/clinic/book" className="link-arrow">
                booking form
              </Link>
              ; to apply for a course, the{' '}
              <Link href="/academy/enroll" className="link-arrow">
                enrollment form
              </Link>
              .
            </p>
          </div>
          <ContactForm
            clinicWhatsApp={clinicWhatsApp}
            admissionsWhatsApp={settings.admissionsWhatsApp}
          />
        </Container>
      </section>
    </>
  )
}
