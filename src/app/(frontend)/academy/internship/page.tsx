import type { Metadata } from 'next'

import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Numerals } from '@/components/ui/Numerals'
import { PageHero } from '@/components/ui/PageHero'
import { Pending } from '@/components/ui/Pending'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getSiteSettings, visible } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

// Meta title and description from the FAA brief's SEO starter pack (§14).
export const metadata: Metadata = {
  title: { absolute: 'Aesthetics Internship Included · French Aesthetics Academy' },
  description:
    'Every course includes a 2 week supervised internship on real clients and patients, at no extra fee.',
  alternates: { canonical: '/academy/internship' },
}

// FAA brief §7. Rows still marked [CONFIRM] there show on staging only.
const rows: {
  item: string
  nonInvasive: string
  invasive: string
  status: 'confirmed' | 'confirm'
}[] = [
  { item: 'Length', nonInvasive: '2 weeks', invasive: '2 weeks', status: 'confirmed' },
  {
    item: 'Who you work on',
    nonInvasive: 'Live clients',
    invasive: 'Real patients',
    status: 'confirmed',
  },
  {
    item: 'What you do',
    nonInvasive: 'Perform treatments yourself',
    invasive: 'Perform procedures yourself',
    status: 'confirmed',
  },
  {
    item: 'Supervision',
    nonInvasive: 'Doctors supervise every step',
    invasive: 'Every procedure supervised',
    status: 'confirmed',
  },
  { item: 'Extra fee', nonInvasive: 'None', invasive: 'None', status: 'confirmed' },
  {
    item: 'Where',
    nonInvasive: 'Campus or clinic to confirm',
    invasive: 'Campus or clinic to confirm',
    status: 'confirm',
  },
  {
    item: 'Supervisors',
    nonInvasive: 'Names to confirm',
    invasive: 'Names and PMDC numbers to confirm',
    status: 'confirm',
  },
  {
    item: 'Cases per trainee',
    nonInvasive: 'To confirm',
    invasive: 'To confirm',
    status: 'confirm',
  },
]

export default async function InternshipPage() {
  const settings = await getSiteSettings()
  const whatsappButton = (place: string) => (
    <WhatsAppLink
      number={settings.admissionsWhatsApp}
      message={academyMessages.internship}
      side="academy"
      label={`internship-${place}`}
      className={buttonClass('primary', { size: 'lg' })}
    >
      <WhatsAppIcon size={20} />
      WhatsApp Karein
    </WhatsAppLink>
  )

  return (
    <>
      <PageHero
        eyebrow="Internship included"
        title="Certificate le kar ghar jaana asaan hai."
        accent="Asli client ke saamne confidence se kaam karna mushkil."
        intro={
          <p>That is why every course includes a 2 week supervised internship. No separate fee.</p>
        }
        actions={whatsappButton('hero')}
      />

      <section className="border-t border-hairline">
        <Container className="py-20 lg:py-28">
          <div data-reveal="">
            <SectionHeading
              eyebrow="Side by side"
              title="Two internships,"
              accent="one standard of supervision."
            />
          </div>
          <div data-reveal="" className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="label w-1/4 py-4 pr-6 text-muted">
                    <span className="sr-only">Detail</span>
                  </th>
                  <th scope="col" className="label py-4 pr-6 text-accent">
                    Non-Invasive internship
                  </th>
                  <th scope="col" className="label py-4 text-accent">
                    Invasive clinical internship
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((row) => visible(row.status))
                  .map((row) => (
                    <tr key={row.item} className="border-b border-hairline">
                      <th scope="row" className="py-4 pr-6 font-bold text-heading">
                        {row.item}
                      </th>
                      <td className="py-4 pr-6">
                        <Pending confirmed={row.status === 'confirmed'}>{row.nonInvasive}</Pending>
                      </td>
                      <td className="py-4">
                        <Pending confirmed={row.status === 'confirmed'}>{row.invasive}</Pending>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Comparison without naming anyone (FAA brief §7) */}
      <section className="tone-inverse">
        <Container className="grid gap-10 py-20 md:grid-cols-2 lg:py-28">
          <div data-reveal="" className="border-t border-line pt-6">
            <p className="label text-muted">Many courses</p>
            <p className="mt-4 font-display text-[2rem] leading-tight text-heading">
              A few days of class, a certificate, and the internship sold separately.
            </p>
          </div>
          <div data-reveal="" className="border-t-2 border-line pt-6">
            <p className="label text-accent">Our course</p>
            <p className="mt-4 font-display text-[2rem] leading-tight text-heading">
              <Numerals>1 week training + 2 weeks internship, one fee.</Numerals>
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Practice that"
        accent="counts."
        intro="Ask admissions about the next internship batch."
      >
        {whatsappButton('closing')}
      </CtaBand>
    </>
  )
}
