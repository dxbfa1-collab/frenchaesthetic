import { randomBytes } from 'crypto'

import { pktDateKey } from './batches'

// No 0/O or 1/I, so a reference read out on the phone cannot be misheard.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** "FAA-2611-K7Q3": prefix, year and month (Pakistan time), four random characters. */
export function newReference(prefix: 'FAA' | 'FMA' | 'MSG'): string {
  const key = pktDateKey(new Date())
  const code = [...randomBytes(4)].map((b) => ALPHABET[b % ALPHABET.length]).join('')
  return `${prefix}-${key.slice(2, 4)}${key.slice(5, 7)}-${code}`
}

export const referencePattern = (prefix: 'FAA' | 'FMA' | 'MSG') =>
  new RegExp(`^${prefix}-\\d{4}-[A-Z0-9]{4}$`)
