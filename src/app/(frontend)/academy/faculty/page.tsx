import type { Metadata } from 'next'

import { TrainerCard } from '@/components/academy/TrainerCard'
import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { getSiteSettings, getTrainers } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Faculty',
  description:
    'A dermatologist-led team teaches every course at French Aesthetics Academy, inside a working clinic in Lahore.',
  alternates: { canonical: '/academy/faculty' },
}

// FAA brief §8: only documented titles; "Dermatologist-led team", never "best" or "internationally certified".
export default async function FacultyPage() {
  const [settings, trainers] = await Promise.all([getSiteSettings(), getTrainers()])

  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Dermatologist-led"
        accent="team."
        intro={
          <p>Lead Trainer: Dr. Iqra, Dermatologist. Training happens inside a working clinic.</p>
        }
      />
      <section className="border-t border-hairline">
        <Container className="grid gap-5 py-16 md:grid-cols-2 lg:py-24">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </Container>
      </section>
      <CtaBand
        title="Learn inside"
        accent="a working clinic."
        intro="Ask admissions who teaches your batch."
      >
        <WhatsAppLink
          number={settings.admissionsWhatsApp}
          message={academyMessages.page('FAC')}
          side="academy"
          label="faculty-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Chat on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
