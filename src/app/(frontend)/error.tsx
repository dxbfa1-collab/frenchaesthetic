'use client'

import { useEffect } from 'react'

// After a new deploy, a page still open from the previous build can ask for files that no longer
// exist (Hostinger keeps only the latest builds). A full reload fetches the new build, so in that
// case the page reloads itself once instead of showing this screen.
const STALE_BUILD =
  /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Failed to find Server Action|importing a module script failed/i
const RELOAD_KEY = 'fa-reloaded-after-deploy'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const stale = STALE_BUILD.test(`${error?.name} ${error?.message}`)

  useEffect(() => {
    if (!stale) return
    try {
      if (sessionStorage.getItem(RELOAD_KEY)) return
      sessionStorage.setItem(RELOAD_KEY, '1')
    } catch {
      // Storage blocked: reload anyway, at most once per page load.
    }
    window.location.reload()
  }, [stale])

  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <p className="label eyebrow">Something went wrong</p>
      <h1 className="mt-6 max-w-3xl text-[2.875rem] sm:text-6xl">
        This page
        <span className="block italic text-accent">could not load.</span>
      </h1>
      <p className="mt-7 max-w-xl text-lg">Please try again in a moment.</p>
      <button
        type="button"
        onClick={() => (stale ? window.location.reload() : reset())}
        className="btn btn-primary btn-lg mt-10"
      >
        Try again
      </button>
    </main>
  )
}
