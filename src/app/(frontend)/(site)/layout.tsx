import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { TopBar } from '@/components/layout/TopBar'
import { getSiteSettings } from '@/lib/payload'

// Both names, each in full, so no page ever reads as a merged brand.
export const metadata: Metadata = {
  title: {
    default: 'French Medical Aesthetics · French Aesthetics Academy',
    template: '%s · French Medical Aesthetics | French Aesthetics Academy',
  },
}

/**
 * Shared pages (home, about, contact, blog, policies). Neutral on purpose: neither logo leads here,
 * so the site works as one domain now or as two later (CLAUDE.md §1).
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <>
      <TopBar
        links={[
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
    </>
  )
}
