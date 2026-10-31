'use client'

import { MoonIcon, SunIcon } from '@/components/icons'

/** Switches light and dark. The choice is saved, and read back before first paint (see the root layout). */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next
    try {
      localStorage.setItem('fa-theme-choice', next)
    } catch {
      // Storage blocked (private mode): the theme still changes for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Light or dark theme"
      className="inline-flex size-11 items-center justify-center text-muted transition-colors hover:text-heading"
    >
      <SunIcon className="theme-icon-sun" />
      <MoonIcon className="theme-icon-moon" />
    </button>
  )
}
