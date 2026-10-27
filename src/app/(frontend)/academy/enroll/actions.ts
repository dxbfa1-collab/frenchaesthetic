'use server'

import config from '@payload-config'
import { randomUUID } from 'crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'
import { z } from 'zod'

import { findEnrollmentForPayment } from '@/lib/enrollments'
import { sendAdmissionsAlert } from '@/lib/notify'
import { normalizePhone } from '@/lib/phone'
import { clientIp, tooManyAttempts } from '@/lib/rateLimit'
import { relationId } from '@/lib/relation'
import { siteUrl } from '@/lib/site'
import type { Enrollment } from '@/payload-types'

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

const withNonce = (state: FormState): FormState => ({ ...state, nonce: Date.now() })

export async function submitEnrollment(prev: FormState, formData: FormData): Promise<FormState> {
  return withNonce(await enroll(prev, formData))
}

export async function submitPaymentProof(prev: FormState, formData: FormData): Promise<FormState> {
  return withNonce(await uploadPaymentProof(prev, formData))
}

const MAX_FILE_BYTES = 5_000_000
const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const enrollmentSchema = z.object({
  batch: z.string().min(1, 'Choose a batch.'),
  name: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Keep the name under 80 characters.'),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const phone = normalizePhone(value)
      if (!phone) {
        ctx.addIssue({ code: 'custom', message: 'Enter your WhatsApp number, e.g. 0300 1234567.' })
        return z.NEVER
      }
      return phone
    }),
  email: z.union([z.literal(''), z.email('Enter a valid email, or leave it empty.')]).default(''),
  city: z.string().trim().min(2, 'Enter your city.').max(60, 'Keep the city under 60 characters.'),
  profession: z
    .string()
    .trim()
    .min(2, 'Tell us your profession.')
    .max(80, 'Keep it under 80 characters.'),
  pmdcNumber: z.string().trim().max(40, 'That PMDC number looks too long.').default(''),
  houseJob: z.enum(['', 'completed', 'inProgress', 'notStarted']).default(''),
  consent: z.literal('on', { error: 'Please agree to be contacted on WhatsApp.' }),
})

const paymentSchema = z.object({
  ref: z.string().min(1),
  key: z.string().min(1),
  method: z.enum(['bankTransfer', 'jazzCash', 'easypaisa', 'other'], {
    error: 'Choose how you paid.',
  }),
})

function stringValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) if (typeof value === 'string') values[key] = value
  return values
}

function fieldErrors(error: z.ZodError | undefined): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error?.issues ?? []) errors[String(issue.path[0] ?? 'form')] ??= issue.message
  return errors
}

// Errors are listed in the order the fields appear on the form.
const FIELD_ORDER = [
  'batch',
  'name',
  'phone',
  'email',
  'city',
  'profession',
  'pmdcNumber',
  'houseJob',
  'documents',
  'consent',
]

function inFormOrder(errors: Record<string, string>): Record<string, string> {
  const rank = (key: string) =>
    FIELD_ORDER.includes(key) ? FIELD_ORDER.indexOf(key) : FIELD_ORDER.length
  return Object.fromEntries(Object.entries(errors).sort(([a], [b]) => rank(a) - rank(b)))
}

const UNREADABLE_FILE = 'This file could not be read. Please upload a clear PDF, JPG, PNG or WebP.'

/** Thrown when Payload rejects an upload (e.g. a damaged PDF); the visitor gets a form error, not a crash. */
class UnreadableFileError extends Error {}

const TOO_MANY: FormState = {
  status: 'error',
  message:
    'Too many applications from this connection. Please wait a few minutes, or message admissions on WhatsApp.',
}

function uploadedFiles(formData: FormData, field: string): File[] {
  return formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0)
}

function checkFiles(files: File[], max: number): string | null {
  if (files.length > max) return `Upload at most ${max} files.`
  for (const file of files) {
    if (!EXTENSIONS[file.type]) return 'Upload a PDF, JPG, PNG or WebP file.'
    if (file.size > MAX_FILE_BYTES) return 'Each file must be 5 MB or smaller.'
  }
  return null
}

/** Saves files to the private collection, renamed so a visitor's file name never shows. */
async function saveFiles(
  payload: Payload,
  files: File[],
  kind: 'pmdcDocument' | 'paymentProof',
  reference?: string,
): Promise<string[]> {
  const ids: string[] = []
  try {
    for (const file of files) {
      const doc = await payload.create({
        collection: 'enrollment-files',
        data: { kind, reference },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
          name: `${kind === 'paymentProof' ? 'payment' : 'pmdc'}-${randomUUID().slice(0, 8)}.${EXTENSIONS[file.type]}`,
          size: file.size,
        },
      })
      ids.push(doc.id)
    }
  } catch (err) {
    await removeFiles(payload, ids)
    payload.logger.warn({ err, msg: 'An uploaded enrollment file was rejected.' })
    throw new UnreadableFileError()
  }
  return ids
}

async function removeFiles(payload: Payload, ids: string[]) {
  await Promise.all(
    ids.map((id) => payload.delete({ collection: 'enrollment-files', id }).catch(() => null)),
  )
}

/** Page, WEB code and the UTM cookie set by <TrackClicks />, saved with each application. */
async function readSource(
  values: Record<string, string>,
): Promise<NonNullable<Enrollment['source']>> {
  let utm: Record<string, unknown> = {}
  try {
    utm = JSON.parse(decodeURIComponent((await cookies()).get('fa_utm')?.value ?? '%7B%7D'))
  } catch {
    // A malformed cookie is ignored.
  }
  const clip = (value: unknown, max: number) =>
    typeof value === 'string' && value ? value.slice(0, max) : undefined
  return {
    code: /^WEB-[A-Z0-9-]{1,30}$/.test(values.from ?? '') ? values.from : undefined,
    page: clip(values.page, 200),
    referrer: clip((await headers()).get('referer'), 300),
    utmSource: clip(utm.source, 100),
    utmMedium: clip(utm.medium, 100),
    utmCampaign: clip(utm.campaign, 150),
    utmContent: clip(utm.content, 150),
    utmTerm: clip(utm.term, 100),
  }
}

async function enroll(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = stringValues(formData)
  // Honeypot: people never see this field, so anything in it is a bot. It gets a normal-looking reply.
  if (values.company) redirect('/academy/enroll/thank-you')

  // Every check runs before answering, so the visitor sees all problems at once.
  const parsed = enrollmentSchema.safeParse(values)
  const errors = fieldErrors(parsed.error)

  const payload = await getPayload({ config })
  const batch = values.batch
    ? await payload
        .findByID({ collection: 'batches', id: values.batch, depth: 1 })
        .catch(() => null)
    : null
  const course = batch && typeof batch.course === 'object' ? batch.course : null
  if (values.batch && (!batch || !course || batch.status !== 'open')) {
    errors.batch ??= 'This batch is not open any more. Please choose another one.'
  }

  const files = uploadedFiles(formData, 'documents')
  if (course?.requiresPMDC) {
    if (!values.pmdcNumber?.trim()) errors.pmdcNumber ??= 'Enter your PMDC registration number.'
    const fileError =
      files.length === 0 ? 'Upload your PMDC certificate or degree.' : checkFiles(files, 2)
    if (fileError) errors.documents ??= fileError
  }
  if (!parsed.success || !batch || !course || Object.keys(errors).length > 0) {
    return { status: 'error', errors: inFormOrder(errors), values }
  }
  const data = parsed.data

  // Only complete applications count towards the limit, so a person fixing mistakes is never blocked.
  if (tooManyAttempts(`enroll:${clientIp(await headers())}`)) return { ...TOO_MANY, values }

  let documents: string[] = []
  try {
    documents = course.requiresPMDC ? await saveFiles(payload, files, 'pmdcDocument') : []
  } catch (err) {
    if (!(err instanceof UnreadableFileError)) throw err
    return { status: 'error', errors: { documents: UNREADABLE_FILE }, values }
  }

  let reference = ''
  try {
    const enrollment = await payload.create({
      collection: 'enrollments',
      data: {
        status: 'applied',
        batch: batch.id,
        track: course.track,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        city: data.city,
        profession: data.profession,
        ...(course.requiresPMDC
          ? { pmdcNumber: data.pmdcNumber, houseJob: data.houseJob || undefined, documents }
          : {}),
        whatsappConsent: true,
        source: await readSource(values),
      },
    })
    reference = enrollment.reference ?? ''
  } catch (err) {
    await removeFiles(payload, documents)
    payload.logger.error({ err, msg: 'An enrollment could not be saved.' })
    return {
      status: 'error',
      message:
        'Your application could not be saved. Please try again, or message admissions on WhatsApp.',
      values,
    }
  }

  await Promise.all(
    documents.map((id) =>
      payload.update({ collection: 'enrollment-files', id, data: { reference } }),
    ),
  )
  redirect(`/academy/enroll/thank-you?ref=${encodeURIComponent(reference)}`)
}

async function uploadPaymentProof(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = stringValues(formData)
  const parsed = paymentSchema.safeParse(values)
  const files = uploadedFiles(formData, 'proof')
  const errors = fieldErrors(parsed.error)
  const fileError =
    files.length === 0 ? 'Choose the payment screenshot or receipt.' : checkFiles(files, 2)
  if (fileError) errors.proof = fileError
  if (!parsed.success || Object.keys(errors).length > 0) return { status: 'error', errors, values }

  if (tooManyAttempts(`payment:${clientIp(await headers())}`)) {
    return {
      status: 'error',
      message: 'Too many uploads. Please wait a few minutes and try again.',
      values,
    }
  }

  const payload = await getPayload({ config })
  const enrollment = await findEnrollmentForPayment(payload, parsed.data.ref, parsed.data.key)
  if (!enrollment || !['verified', 'paid'].includes(enrollment.status)) {
    return {
      status: 'error',
      message: 'This payment link is not active. Please contact admissions on WhatsApp.',
      values,
    }
  }

  let ids: string[]
  try {
    ids = await saveFiles(payload, files, 'paymentProof', enrollment.reference ?? undefined)
  } catch (err) {
    if (!(err instanceof UnreadableFileError)) throw err
    return { status: 'error', errors: { proof: UNREADABLE_FILE }, values }
  }
  const existing = (enrollment.paymentProof ?? [])
    .map(relationId)
    .filter((id): id is string => Boolean(id))
  await payload.update({
    collection: 'enrollments',
    id: enrollment.id,
    data: {
      paymentProof: [...existing, ...ids],
      paymentMethod: parsed.data.method,
      paymentProofUploadedAt: new Date().toISOString(),
    },
  })
  await sendAdmissionsAlert(payload, `Payment proof received: ${enrollment.reference}`, [
    `Reference: ${enrollment.reference}`,
    `Name: ${enrollment.name}`,
    `Method: ${parsed.data.method}`,
    `Files: ${ids.length}`,
    '',
    `Open in the admin: ${siteUrl}/admin/collections/enrollments/${enrollment.id}`,
  ])
  return { status: 'success' }
}
