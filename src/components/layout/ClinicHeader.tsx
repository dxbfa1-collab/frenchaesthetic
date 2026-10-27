import Link from 'next/link'

import { FmaLogo } from '@/components/brand/Logo'
import { PhoneIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { clinicMoreNav, clinicNav } from '@/lib/nav'
import { clinicMessages, telHref } from '@/lib/whatsapp'

import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'

export function ClinicHeader({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  return (
    <header className="tone-dark sticky top-0 z-40 border-b border-hairline bg-bg/95 backdrop-blur-md">
      <Container className="flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href="/clinic"
          aria-label="French Medical Aesthetics, clinic home"
          className="shrink-0"
        >
          <FmaLogo variant="horizontal-no-tagline" width={260} preload />
        </Link>
        <nav aria-label="Clinic" className="hidden xl:block">
          <NavLinks items={clinicNav} className="flex items-center gap-8" />
        </nav>
        <div className="flex items-center gap-2">
          <WhatsAppLink
            number={whatsapp}
            message={clinicMessages.consultation()}
            side="clinic"
            label="header"
            className={buttonClass('primary', { className: 'hidden lg:inline-flex' })}
          >
            <WhatsAppIcon size={18} />
            Book on WhatsApp
          </WhatsAppLink>
          <MobileMenu
            label="Clinic"
            items={clinicNav}
            moreItems={clinicMoreNav}
            logo={<FmaLogo variant="horizontal-no-tagline" width={240} />}
          >
            <WhatsAppLink
              number={whatsapp}
              message={clinicMessages.consultation()}
              side="clinic"
              label="menu"
              className={buttonClass('primary', { size: 'lg', className: 'w-full' })}
            >
              <WhatsAppIcon size={20} />
              Book on WhatsApp
            </WhatsAppLink>
            <a
              href={telHref(phone)}
              data-track="phone_click"
              data-side="clinic"
              data-label="menu"
              className="mt-5 inline-flex items-center gap-3 text-lg font-semibold text-fg"
            >
              <PhoneIcon className="text-gold" />
              UAN {phone}
            </a>
          </MobileMenu>
        </div>
      </Container>
    </header>
  )
}
