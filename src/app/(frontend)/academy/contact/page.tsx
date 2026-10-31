import type { Metadata } from 'next'

import { ArrowRightIcon, MailIcon, MapPinIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getAcademyCampuses, getSiteSettings } from '@/lib/payload'
import { isStaging } from '@/lib/site'
import { academyMessages } from '@/lib/whatsapp'
import type { Branch } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Contact & Campuses',
  description:
    'Find French Aesthetics Academy campuses in Lahore and reach admissions on WhatsApp about courses, batches and enrollment.',
  alternates: { canonical: '/academy/contact' },
}

/** The owner's map pin when set; otherwise a map search for a confirmed address (staging: any address). */
function directionsUrl(campus: Branch): string | null {
  if (campus.mapUrl) return campus.mapUrl
  if (campus.address && (campus.addressStatus === 'confirmed' || isStaging)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.address)}`
  }
  return null
}

// FAA brief §10: one admissions number, no clinic numbers, no reply-time promises.
export default async function AcademyContactPage() {
  const [settings, campuses] = await Promise.all([getSiteSettings(), getAcademyCampuses()])
  const whatsapp = settings.admissionsWhatsApp

  return (
    <>
      <PageHero
        eyebrow="Contact & campuses"
        title="Visit us"
        accent="in Lahore."
        intro={<p>One admissions number for every course and campus: WhatsApp {whatsapp}.</p>}
        actions={
          <WhatsAppLink
            number={whatsapp}
            message={academyMessages.page('CONTACT')}
            side="academy"
            label="contact-hero"
            className={buttonClass('primary', { size: 'lg' })}
          >
            <WhatsAppIcon size={20} />
            Chat on WhatsApp
          </WhatsAppLink>
        }
      />

      <section className="border-t border-hairline">
        <Container className="grid gap-5 py-16 md:grid-cols-2 lg:py-24">
          {campuses.map((campus) => {
            const directions = directionsUrl(campus)
            return (
              <article
                key={campus.id}
                className="flex flex-col border border-hairline bg-surface p-7 sm:p-9"
              >
                <span className="pill self-start">{campus.city}</span>
                <h2 className="mt-6 text-[2.25rem]">{campus.shortName || campus.name} Campus</h2>
                {campus.address && (
                  <p className="mt-4 flex items-start gap-3 text-lg">
                    <MapPinIcon className="mt-1 shrink-0 text-gold" />
                    <span>
                      <Pending confirmed={campus.addressStatus === 'confirmed'}>
                        {campus.address}
                      </Pending>
                    </span>
                  </p>
                )}
                {directions && (
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-arrow mt-auto self-start pt-8"
                  >
                    Get directions <ArrowRightIcon size={18} />
                  </a>
                )}
              </article>
            )
          })}
        </Container>
      </section>

      <section className="tone-inverse">
        <Container className="grid gap-10 py-16 md:grid-cols-2 lg:py-20">
          <p data-reveal="" className="font-display text-[2rem] leading-tight text-heading">
            Students join from Gujranwala, Sialkot, Kasur and Daska.
          </p>
          <div data-reveal="" className="space-y-4">
            <WhatsAppLink
              number={whatsapp}
              message={academyMessages.page('CONTACT')}
              side="academy"
              label="contact-details"
              className="inline-flex items-center gap-3 text-lg font-semibold text-heading"
            >
              <WhatsAppIcon className="text-gold" /> WhatsApp {whatsapp}
            </WhatsAppLink>
            {settings.academyEmail && (
              <a
                href={`mailto:${settings.academyEmail}`}
                className="flex items-center gap-3 text-lg font-semibold text-heading"
              >
                <MailIcon className="text-gold" /> {settings.academyEmail}
              </a>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
