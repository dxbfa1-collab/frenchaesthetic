'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { z } from 'zod'

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
import { clientIp, tooManyAttempts } from '@/lib/rateLimit'

export async function submitMessage(prev: FormState, formData: FormData): Promise<FormState> {
  return withNonce(await send(prev, formData))
}

const messageSchema = z.object({
  iAm: z.enum(['patient', 'student'], {
    error: 'Tell us whether you are a patient, or a doctor or student.',
  }),
  name: nameField,
  phone: phoneField,
  email: optionalEmailField,
  interest: z.string().trim().max(120, 'Keep this under 120 characters.').default(''),
  message: z
    .string()
    .trim()
    .min(5, 'Write your message.')
    .max(2000, 'Keep the message under 2,000 characters.'),
  consent: consentField,
})

const FIELD_ORDER = ['iAm', 'name', 'phone', 'email', 'interest', 'message', 'consent']

async function send(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = stringValues(formData)
  // Honeypot: people never see this field, so anything in it is a bot. It gets a normal-looking reply.
  if (values.company) return { status: 'success' }

  const parsed = messageSchema.safeParse(values)
  if (!parsed.success) {
    return {
      status: 'error',
      errors: inFormOrder(fieldErrors(parsed.error), FIELD_ORDER),
      values,
    }
  }
  const data = parsed.data

  // Only complete messages count towards the limit, so a person fixing mistakes is never blocked.
  if (tooManyAttempts(`contact:${clientIp(await headers())}`)) {
    return {
      status: 'error',
      message:
        'Too many messages from this connection. Please wait a few minutes, or message us on WhatsApp.',
      values,
    }
  }

  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'messages',
      data: {
        status: 'new',
        iAm: data.iAm,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        interest: data.interest || undefined,
        message: data.message,
        source: await readSource(values),
      },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'A contact message could not be saved.' })
    return {
      status: 'error',
      message: 'Your message could not be sent. Please try again, or message us on WhatsApp.',
      values,
    }
  }
  return { status: 'success', values: { iAm: data.iAm } }
}
