import Link from 'next/link'

import { FaaLogo } from '@/components/brand/Logo'
import { WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { academyMoreNav, academyNav, type NavItem } from '@/lib/nav'

import { AcademyWhatsApp } from './AcademyWhatsApp'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'

/** FAA brief §2: horizontal logo left, menu, gold "Chat on WhatsApp" button. */
export function AcademyHeader({ whatsapp, nav }: { whatsapp: string; nav: NavItem[] }) {
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
          <NavLinks items={nav} className="flex items-center gap-8" />
        </nav>
        <div className="flex items-center gap-2">
          <AcademyWhatsApp
            number={whatsapp}
            label="header"
            className={buttonClass('primary', { className: 'hidden lg:inline-flex' })}
          >
            <WhatsAppIcon size={18} />
            Chat on WhatsApp
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
              className={buttonClass('primary', { className: 'w-full' })}
            >
              <WhatsAppIcon size={20} />
              <span className="whitespace-nowrap">Chat on WhatsApp: {whatsapp}</span>
            </AcademyWhatsApp>
          </MobileMenu>
        </div>
      </Container>
    </header>
  )
}
