import { revalidatePath } from 'next/cache'

/**
 * Refreshes every cached page after a CMS change, so staff edits show without a redeploy.
 * Outside a Next.js request (the seed script, or `context.disableRevalidate`) it does nothing.
 */
export function revalidateSite({ context }: { context?: Record<string, unknown> }): void {
  if (context?.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside Next.js; nothing is cached there.
  }
}
