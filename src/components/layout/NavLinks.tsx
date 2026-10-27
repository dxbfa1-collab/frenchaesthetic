'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { NavItem } from '@/lib/nav'

/** Desktop menu links; the current section gets a gold underline. */
export function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname()

  return (
    <ul className={className}>
      {items.map((item) => {
        const exact = pathname === item.href
        const inside = exact || pathname.startsWith(`${item.href}/`)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={exact ? 'page' : inside ? 'true' : undefined}
              data-active={inside || undefined}
              className="nav-link"
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
