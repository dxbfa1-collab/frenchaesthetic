/** Booking form choices, shared by the Bookings collection, the form and its server action. */

export const TIME_SLOTS = [
  { label: 'Any time', value: 'any' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Late afternoon', value: 'lateAfternoon' },
  { label: 'Evening', value: 'evening' },
] as const

export const HEARD_FROM = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google', value: 'google' },
  { label: 'A friend', value: 'friend' },
  { label: 'Walked past a branch', value: 'walkIn' },
  { label: 'Other', value: 'other' },
] as const

export const GENDERS = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Prefer not to say', value: 'preferNot' },
] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]['value']
export type HeardFrom = (typeof HEARD_FROM)[number]['value']
export type Gender = (typeof GENDERS)[number]['value']
