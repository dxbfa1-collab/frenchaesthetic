import type { ReactNode } from 'react'

/**
 * Headings used Cormorant, whose numbers are old-style, so digits were set in Nunito Sans. Montserrat
 * (since 29 Oct 2026) has lining numbers, so this now passes the text through unchanged.
 */
export function Numerals({ children }: { children: string }): ReactNode {
  return children
}
