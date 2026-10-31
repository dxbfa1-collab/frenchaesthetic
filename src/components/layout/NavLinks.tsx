'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { TopicIcon } from '@/components/ui/TopicIcon'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/lib/nav'

/**
 * Desktop menu. The current section gets a gold underline. An item with a `menu` opens a panel
 * under the header (owner, 29 Oct 2026): on hover, when its link or chevron has keyboard focus, or
 * when the chevron is clicked or tapped. Escape, clicking elsewhere or leaving closes it.
 */
export function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState<string | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const root = useRef<HTMLUListElement>(null)

  const show = (href: string) => {
    window.clearTimeout(closeTimer.current)
    setOpen(href)
  }
  const hide = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(null), 160)
  }

  // A new page closes the panel.
  useEffect(() => {
    setOpen(null) // eslint-disable-line react-hooks/set-state-in-effect -- reset on navigation
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <ul ref={root} className={className}>
      {items.map((item) => {
        const exact = pathname === item.href
        const inside = exact || pathname.startsWith(`${item.href}/`)
        const isOpen = open === item.href
        const panelId = `menu-${item.href.replace(/\W+/g, '-')}`
        return (
          <li
            key={item.href}
            className="flex items-center"
            onMouseEnter={item.menu ? () => show(item.href) : undefined}
            onMouseLeave={item.menu ? hide : undefined}
          >
            <Link
              href={item.href}
              aria-current={exact ? 'page' : inside ? 'true' : undefined}
              data-active={inside || undefined}
              className="nav-link"
              onFocus={item.menu ? () => show(item.href) : undefined}
            >
              {item.label}
            </Link>
            {item.menu && (
              <>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-label={`${item.label} menu`}
                  onClick={() => (isOpen ? setOpen(null) : show(item.href))}
                  className="ml-1 inline-flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:text-heading"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                    className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  id={panelId}
                  hidden={!isOpen}
                  className="mega-panel tone-dark absolute inset-x-0 top-full border-b border-hairline bg-deep-charcoal shadow-[0_30px_60px_-20px_rgb(0_0_0_/0.8)]"
                  onMouseEnter={() => show(item.href)}
                  onMouseLeave={hide}
                >
                  <Container className="py-8">
                    <div
                      className={cn(
                        'grid gap-x-10 gap-y-8',
                        item.menu.columns.length > 2
                          ? 'grid-cols-4'
                          : item.menu.columns.length === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-1',
                      )}
                    >
                      {item.menu.columns.map((column, ci) => (
                        <div key={column.heading ?? ci}>
                          {column.heading &&
                            (column.href ? (
                              <Link
                                href={column.href}
                                className="group mb-3 flex items-center gap-3 font-display text-lg font-bold text-heading"
                              >
                                {column.topic && (
                                  <span className="icon-badge size-9 rounded-lg">
                                    <TopicIcon topic={column.topic} size={18} />
                                  </span>
                                )}
                                <span className="group-hover:text-gold">{column.heading}</span>
                              </Link>
                            ) : (
                              <p className="label mb-3 text-accent">{column.heading}</p>
                            ))}
                          <ul
                            className={cn(
                              'space-y-1',
                              item.menu!.columns.length === 1 &&
                                'grid grid-cols-3 gap-x-8 gap-y-1 space-y-0',
                            )}
                          >
                            {column.items.map((link) => (
                              <li key={link.href}>
                                <Link href={link.href} className="mega-link group">
                                  {link.image ? (
                                    <Image
                                      src={link.image}
                                      alt=""
                                      width={44}
                                      height={44}
                                      className="size-11 shrink-0 rounded-full object-cover object-[center_20%] ring-1 ring-gold transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : null}
                                  {!link.image && link.topic && !column.heading && (
                                    <TopicIcon
                                      topic={link.topic}
                                      size={18}
                                      className="shrink-0 text-accent"
                                    />
                                  )}
                                  <span>
                                    <span className="block font-semibold text-fg group-hover:text-heading">
                                      {link.label}
                                    </span>
                                    {link.text && (
                                      <span className="block text-sm text-muted">{link.text}</span>
                                    )}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {item.menu.footer && (
                      <div className="mt-8 border-t border-hairline pt-5">
                        <Link href={item.menu.footer.href} className="link-arrow">
                          {item.menu.footer.label} <ArrowRightIcon size={18} />
                        </Link>
                      </div>
                    )}
                  </Container>
                </div>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
