/**
 * Academy batch dates. Each course starts on its own day of the month (owner, 28 Oct 2026:
 * Non-Invasive on the 15th, Invasive on the 20th). There is no training on Sundays, so a start
 * day that falls on a Sunday moves to the Monday.
 *
 * Batch dates are stored as noon UTC of the Pakistan calendar day (see normalizeDay), so the day
 * never shifts whichever time zone renders it.
 */

export const TIME_ZONE = 'Asia/Karachi'

const ordinalRules = new Intl.PluralRules('en-GB', { type: 'ordinal' })
const ORDINAL_SUFFIX: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' }
const listFormat = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' })

/** 15 → "15th", 22 → "22nd". */
export function ordinal(n: number): string {
  return `${n}${ORDINAL_SUFFIX[ordinalRules.select(n)] ?? 'th'}`
}

/** The Pakistan calendar day of an instant, as "YYYY-MM-DD". */
export function pktDateKey(value: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(value))
}

/** Pins a picked date to noon UTC of its Pakistan calendar day. */
export function normalizeDay(value: unknown): unknown {
  if (!value || (typeof value !== 'string' && !(value instanceof Date))) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${pktDateKey(date)}T12:00:00.000Z`
}

const keyToDate = (key: string) => new Date(`${key}T12:00:00.000Z`)

/** Start date the rule gives for a month (month is 1–12), with the Sunday → Monday move. */
export function ruleStartKey(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

/** True when a stored batch date is the course's start day, or the Monday after it fell on a Sunday. */
export function followsStartRule(value: string | Date, startDay: number): boolean {
  const key = pktDateKey(value)
  const [year, month] = key.split('-').map(Number)
  return key === ruleStartKey(year, month, startDay)
}

/** "Mon 16 Nov 2026" (short) or "16 November" (long, no year). */
export function formatBatchDate(value: string | Date, style: 'short' | 'long' = 'short'): string {
  const date = keyToDate(pktDateKey(value))
  if (style === 'long') {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(date)
  }
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}`
}

/** "November 2026", for grouping the calendar. */
export function formatBatchMonth(value: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(keyToDate(pktDateKey(value)))
}

/** "Non-Invasive batches start on the 15th and Invasive batches on the 20th of every month." */
export function batchRuleSentence(courses: { shortName: string; batchStartDay: number }[]): string {
  if (courses.length === 0) return 'New batches start every month.'
  const parts = courses.map(
    (c, i) => `${c.shortName} batches ${i === 0 ? 'start ' : ''}on the ${ordinal(c.batchStartDay)}`,
  )
  return `${listFormat.format(parts)} of every month.`
}
