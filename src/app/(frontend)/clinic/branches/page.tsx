import type { Metadata } from 'next'

import { BranchCard } from '@/components/clinic/BranchCard'
import { WhatsAppIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getClinicBranches, getSiteSettings } from '@/lib/payload'
import { clinicMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Branches in Lahore & Karachi',
  description:
    'French Medical Aesthetics branches at DHA Phase 4, Allama Iqbal Town and MM Alam Road in Lahore, and Bahadurabad in Karachi.',
  alternates: { canonical: '/clinic/branches' },
}

export default async function BranchesPage() {
  const [settings, branches] = await Promise.all([getSiteSettings(), getClinicBranches()])
  const whatsapp = settings.clinicWhatsApp || settings.clinicPhone
  const cities = [...new Set(branches.map((b) => b.city))]

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Clinic', href: '/clinic' },
              { label: 'Branches', href: '/clinic/branches' },
            ]}
          />
        }
        eyebrow="Our branches"
        title="Lahore"
        accent="and Karachi."
        intro={
          <p>
            Every treatment is available at all four branches. Consultation terms and timings
            differ, so each branch page shows what applies there, or ask us on WhatsApp.
          </p>
        }
      />

      {cities.map((city) => (
        <section key={city} className="border-t border-hairline">
          <Container className="py-16 lg:py-24">
            <div data-reveal="">
              <SectionHeading title={city} />
            </div>
            <div data-reveal="" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {branches
                .filter((b) => b.city === city)
                .map((branch) => (
                  <BranchCard key={branch.id} branch={branch} whatsapp={whatsapp} />
                ))}
            </div>
          </Container>
        </section>
      ))}

      <CtaBand
        title="Which branch"
        accent="suits you?"
        intro="Message us on WhatsApp with your area and the treatment you are interested in."
      >
        <WhatsAppLink
          number={whatsapp}
          message={clinicMessages.consultation()}
          side="clinic"
          label="branches-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Ask on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
