'use client'

export default function FrontendError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <p className="label eyebrow">Something went wrong</p>
      <h1 className="mt-6 max-w-3xl text-[2.875rem] sm:text-6xl">
        This page
        <span className="block italic text-accent">could not load.</span>
      </h1>
      <p className="mt-7 max-w-xl text-lg">Please try again in a moment.</p>
      <button type="button" onClick={reset} className="btn btn-primary btn-lg mt-10">
        Try again
      </button>
    </main>
  )
}
