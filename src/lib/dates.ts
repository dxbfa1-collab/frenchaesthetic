import { pktDateKey } from './batches'

const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Karachi',
})

/** "28 October 2026", in Pakistan time. */
export const formatLongDate = (value?: string | null): string | null =>
  value ? longDate.format(new Date(value)) : null

const DAY = 24 * 60 * 60 * 1000

/** Dates a visitor may ask for on the booking form: today to six months ahead, in Pakistan time. */
export function bookingWindow(now = new Date()): { min: string; max: string } {
  return { min: pktDateKey(now), max: pktDateKey(new Date(now.getTime() + 180 * DAY)) }
}
