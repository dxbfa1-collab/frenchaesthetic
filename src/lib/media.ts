import type { Media } from '@/payload-types'

/**
 * An uploaded image that may be shown on the website: it has a file, and it either shows no
 * identifiable person or has written consent on file for everyone in it (brand rule, brief §3).
 */
export function publicImage(value: string | Media | null | undefined): Media | null {
  if (!value || typeof value !== 'object' || !value.url) return null
  return value.peopleConsent === 'missing' ? null : value
}
