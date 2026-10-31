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
        className="menu-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-bg p-0"
      >
        <div className="tone-dark flex h-[4.5rem] items-center justify-between gap-4 border-b border-hairline bg-bg px-4 sm:px-6">
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
        <nav aria-label={label} className="px-4 pb-4 pt-3 sm:px-6">
          <ul className="divide-y divide-hairline">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-3.5 text-lg font-bold text-heading"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {moreItems.length > 0 && (
            <ul className="mt-2 border-t border-hairline pt-3">
              {moreItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block py-2 text-base font-semibold text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
        {children && (
          <div className="border-t border-hairline px-4 pb-8 pt-5 sm:px-6">{children}</div>
        )}
      </dialog>
    </>
  )
}
