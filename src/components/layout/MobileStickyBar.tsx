import type { ReactNode } from 'react'

/**
 * Phone-only bar with two actions (clinic: Book + WhatsApp; academy: Enroll + WhatsApp).
 * The first child keeps its natural width and the second (the primary) takes the rest, so a
 * longer label such as "Chat on WhatsApp" stays on one line at 360 px.
 * The spacer keeps the end of the footer readable above the fixed bar.
 */
export function MobileStickyBar({ children }: { children: ReactNode }) {
  return (
    <>
      <div aria-hidden="true" className="tone-dark h-20 lg:hidden" />
      <div
        className="tone-dark fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-bg/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-xl gap-3 px-4 py-3 [&>*]:px-4 [&>*:first-child]:shrink-0 [&>*:last-child]:flex-1">
          {children}
        </div>
      </div>
    </>
  )
}
