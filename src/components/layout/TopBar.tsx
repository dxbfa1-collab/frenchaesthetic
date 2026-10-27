import Link from 'next/link'
import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/lib/nav'

import { ThemeToggle } from './ThemeToggle'

type Props = {
  side?: 'clinic' | 'academy'
  contact?: { label: string; href: string }
  links?: NavItem[]
}

/** Thin bar above every header: the Clinic / Academy switch, one contact line and the theme toggle. */
export function TopBar({ side, contact, links }: Props) {
  return (
    <div className="tone-dark border-b border-hairline">
      <Container className="flex h-11 items-center justify-between gap-4">
        <nav aria-label="Clinic or academy" className="flex h-full items-stretch gap-6">
          <SideTab href="/clinic" active={side === 'clinic'}>
            Clinic
          </SideTab>
          <SideTab href="/academy" active={side === 'academy'}>
            Academy
          </SideTab>
        </nav>
        <div className="flex items-center gap-5">
          {links?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-sm font-semibold text-muted transition-colors hover:text-heading sm:inline"
            >
              {link.label}
            </Link>
          ))}
          {contact && (
            <a
              href={contact.href}
              data-track="phone_click"
              data-side={side}
              data-label="top-bar"
              className="hidden text-sm font-semibold text-muted transition-colors hover:text-heading md:inline"
            >
              {contact.label}
            </a>
          )}
          <ThemeToggle />
        </div>
      </Container>
    </div>
  )
}

function SideTab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'label relative inline-flex items-center transition-colors',
        active ? 'text-accent' : 'text-muted hover:text-heading',
      )}
    >
      {children}
      {active && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gold" />
      )}
    </Link>
  )
}
