import { z } from 'zod'

import { normalizePhone } from './phone'

/** What a form's server action returns. Shared by enrollment, payment, booking and contact forms. */
export type FormState = {
  status: 'idle' | 'error' | 'success'
  message?: string
  errors?: Record<string, string>
  /** What the visitor typed, so the form can be shown again after an error. */
  values?: Record<string, string>
  /**
   * New on every reply. The form uses it as its key, so it remounts with `values` as defaults:
   * React's own reset after an action would put selects back to their first value.
   */
  nonce?: number
}

export const withNonce = (state: FormState): FormState => ({ ...state, nonce: Date.now() })

export function stringValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) if (typeof value === 'string') values[key] = value
  return values
}

export function fieldErrors(error: z.ZodError | undefined): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error?.issues ?? []) errors[String(issue.path[0] ?? 'form')] ??= issue.message
  return errors
}

/** Lists errors in the order the fields appear on the form. */
export function inFormOrder(
  errors: Record<string, string>,
  order: string[],
): Record<string, string> {
  const rank = (key: string) => (order.includes(key) ? order.indexOf(key) : order.length)
  return Object.fromEntries(Object.entries(errors).sort(([a], [b]) => rank(a) - rank(b)))
}

export const nameField = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(80, 'Keep the name under 80 characters.')

export const phoneField = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const phone = normalizePhone(value)
    if (!phone) {
      ctx.addIssue({ code: 'custom', message: 'Enter your WhatsApp number, e.g. 0300 1234567.' })
      return z.NEVER
    }
    return phone
  })

export const optionalEmailField = z
  .union([z.literal(''), z.email('Enter a valid email, or leave it empty.')])
  .default('')

export const consentField = z.literal('on', { error: 'Please agree to be contacted on WhatsApp.' })
