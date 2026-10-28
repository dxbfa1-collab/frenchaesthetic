'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { z } from 'zod'

import { GENDERS, HEARD_FROM, TIME_SLOTS } from '@/lib/bookingOptions'
import { bookingWindow } from '@/lib/dates'
import { readSource } from '@/lib/formSource'
import {
  consentField,
  fieldErrors,
  type FormState,
  inFormOrder,
  nameField,
  optionalEmailField,
  phoneField,
  stringValues,
  withNonce,
} from '@/lib/forms'
import { getClinicBranches, getConcerns, getTreatments } from '@/lib/payload'
import { clientIp, tooManyAttempts } from '@/lib/rateLimit'

export async function submitBooking(prev: FormState, formData: FormData): Promise<FormState> {
  return withNonce(await book(prev, formData))
}

const optionValues = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [T[number]['value'], ...T[number]['value'][]]

const bookingSchema = z.object({
  branch: z.string().min(1, 'Choose a branch.'),
  interest: z.string().max(100).default(''),
  preferredDate: z
    .union([
      z.literal(''),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date from the calendar.'),
    ])
    .default(''),
  timeSlot: z.enum(optionValues(TIME_SLOTS), { error: 'Choose a time of day.' }).default('any'),
  name: nameField,
  phone: phoneField,
  email: optionalEmailField,
  gender: z.union([z.literal(''), z.enum(optionValues(GENDERS))]).default(''),
  age: z
    .string()
    .trim()
    .default('')
    .refine(
      (v) => v === '' || (/^\d{1,3}$/.test(v) && Number(v) >= 12 && Number(v) <= 100),
      'Enter an age between 12 and 100, or leave it empty.',
    ),
  heardFrom: z.union([z.literal(''), z.enum(optionValues(HEARD_FROM))]).default(''),
  notes: z.string().trim().max(1000, 'Keep the notes under 1,000 characters.').default(''),
  consent: consentField,
})

// Errors are listed in the order the fields appear on the form.
const FIELD_ORDER = [
  'branch',
  'interest',
  'preferredDate',
  'timeSlot',
  'name',
  'phone',
  'email',
  'gender',
  'age',
  'heardFrom',
  'notes',
  'consent',
]

async function book(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = stringValues(formData)
  // Honeypot: people never see this field, so anything in it is a bot. It gets a normal-looking reply.
  if (values.company) redirect('/clinic/book/thank-you')

  // Every check runs before answering, so the visitor sees all problems at once.
  const parsed = bookingSchema.safeParse(values)
  const errors = fieldErrors(parsed.error)

  const [branches, treatments, concerns] = await Promise.all([
    getClinicBranches(),
    getTreatments(),
    getConcerns(),
  ])
  const branch = branches.find((b) => b.id === values.branch)
  if (values.branch && !branch) errors.branch ??= 'Choose one of our branches.'

  // "t:<id>" is a treatment shown on the site, "c:<id>" a concern; empty means "not sure yet".
  const [kind, id] = (values.interest ?? '').split(':')
  const treatment = kind === 't' ? treatments.find((t) => t.id === id) : undefined
  const concern = kind === 'c' ? concerns.find((c) => c.id === id) : undefined
  if (values.interest && !treatment && !concern) {
    errors.interest ??= 'Choose an option from the list, or "Not sure yet".'
  }

  const date = parsed.success ? parsed.data.preferredDate : ''
  if (date) {
    const { min, max } = bookingWindow()
    if (date < min) errors.preferredDate ??= 'Choose today or a later date.'
    else if (date > max) errors.preferredDate ??= 'Choose a date within the next six months.'
  }

  if (!parsed.success || !branch || Object.keys(errors).length > 0) {
    return { status: 'error', errors: inFormOrder(errors, FIELD_ORDER), values }
  }
  const data = parsed.data

  // Only complete requests count towards the limit, so a person fixing mistakes is never blocked.
  if (tooManyAttempts(`book:${clientIp(await headers())}`)) {
    return {
      status: 'error',
      message:
        'Too many requests from this connection. Please wait a few minutes, or message us on WhatsApp.',
      values,
    }
  }

  const payload = await getPayload({ config })
  let reference = ''
  try {
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        status: 'new',
        branch: branch.id,
        treatment: treatment?.id,
        concern: concern?.name,
        // Noon UTC keeps the Pakistan date the same in every time zone.
        preferredDate: data.preferredDate ? `${data.preferredDate}T12:00:00.000Z` : undefined,
        timeSlot: data.timeSlot,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        gender: data.gender || undefined,
        age: data.age ? Number(data.age) : undefined,
        notes: data.notes || undefined,
        heardFrom: data.heardFrom || undefined,
        whatsappConsent: true,
        source: await readSource(values),
      },
    })
    reference = booking.reference ?? ''
  } catch (err) {
    payload.logger.error({ err, msg: 'A booking could not be saved.' })
    return {
      status: 'error',
      message: 'Your request could not be saved. Please try again, or message us on WhatsApp.',
      values,
    }
  }

  redirect(
    `/clinic/book/thank-you?ref=${encodeURIComponent(reference)}&branch=${encodeURIComponent(branch.slug)}`,
  )
}
