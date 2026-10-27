import Link from 'next/link'

import { FaaLogo } from '@/components/brand/Logo'
import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { academyMoreNav, academyNav } from '@/lib/nav'

import { AcademyWhatsApp } from './AcademyWhatsApp'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'

/** FAA brief §2: horizontal logo left, menu, gold "WhatsApp Karein" button. */
export function AcademyHeader({ whatsapp }: { whatsapp: string }) {
  return (
    <header className="tone-dark sticky top-0 z-40 border-b border-hairline bg-bg/95 backdrop-blur-md">
      <Container className="flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href="/academy"
          aria-label="French Aesthetics Academy, academy home"
          className="shrink-0"
        >
          <FaaLogo variant="horizontal" width={228} preload />
        </Link>
        <nav aria-label="Academy" className="hidden xl:block">
          <NavLinks items={academyNav} className="flex items-center gap-8" />
        </nav>
        <div className="flex items-center gap-2">
          <AcademyWhatsApp
            number={whatsapp}
            label="header"
            className={buttonClass('primary', { className: 'hidden lg:inline-flex' })}
          >
            <WhatsAppIcon size={18} />
            WhatsApp Karein
          </AcademyWhatsApp>
          <MobileMenu
            label="Academy"
            items={academyNav}
            moreItems={academyMoreNav}
            logo={<FaaLogo variant="horizontal" width={220} />}
          >
            <AcademyWhatsApp
              number={whatsapp}
              label="menu"
              className={buttonClass('primary', { size: 'lg', className: 'w-full' })}
            >
              <WhatsAppIcon size={20} />
              WhatsApp Karein: <span className="whitespace-nowrap">{whatsapp}</span>
            </AcademyWhatsApp>
          </MobileMenu>
        </div>
      </Container>
    </header>
  )
}
