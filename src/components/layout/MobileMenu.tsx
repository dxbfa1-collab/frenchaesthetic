'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useRef } from 'react'

import { CloseIcon, MenuIcon } from '@/components/icons'
import type { NavItem } from '@/lib/nav'

type Props = {
  /** "Clinic" or "Academy", used in the accessible names. */
  label: string
  items: NavItem[]
  moreItems?: NavItem[]
  logo: ReactNode
  /** Contact block under the links (rendered on the server). */
  children?: ReactNode
}

/** Full-screen menu below the xl breakpoint. A native <dialog> gives focus trapping and Esc to close. */
export function MobileMenu({ label, items, moreItems = [], logo, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  const close = () => dialog.current?.close()

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        aria-label={`Open the ${label.toLowerCase()} menu`}
        className="inline-flex size-11 items-center justify-center text-heading xl:hidden"
      >
        <MenuIcon size={26} />
      </button>
      <dialog
        ref={dialog}
        aria-label={`${label} menu`}
        className="menu-sheet tone-dark fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto p-0"
      >
        <div className="flex h-[4.5rem] items-center justify-between gap-4 border-b border-hairline px-4 sm:px-6">
          {logo}
          <button
            type="button"
            onClick={close}
            aria-label="Close the menu"
            className="inline-flex size-11 items-center justify-center text-heading"
          >
            <CloseIcon size={26} />
          </button>
        </div>
        <nav aria-label={label} className="px-4 pb-6 pt-8 sm:px-6">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-1.5 font-display text-[2.125rem] leading-tight text-heading"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {moreItems.length > 0 && (
            <ul className="mt-8 space-y-1 border-t border-hairline pt-6">
              {moreItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block py-2 text-lg font-semibold text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
        {children && (
          <div className="border-t border-hairline px-4 pb-10 pt-8 sm:px-6">{children}</div>
        )}
      </dialog>
    </>
  )
}
