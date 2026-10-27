import type { ReactNode } from 'react'

import { isStaging } from '@/lib/site'

/**
 * A fact the owner has not signed off yet. On staging it shows with a CONFIRM marker so the owner
 * can review it in place; on the live site it is replaced by `fallback` (nothing by default).
 */
export function Pending({
  confirmed,
  children,
  fallback = null,
}: {
  confirmed: boolean
  children: ReactNode
  fallback?: ReactNode
}) {
  if (confirmed) return <>{children}</>
  if (!isStaging) return <>{fallback}</>
  return (
    <>
      {children}
      <span
        className="ml-2 inline-flex items-center rounded-sm border border-dashed border-line px-1.5 py-px align-middle font-sans text-[0.6875rem] font-bold uppercase not-italic tracking-[0.16em] text-muted"
        title="Not confirmed by the owner yet. Hidden on the live site."
      >
        Confirm
      </span>
    </>
  )
}
