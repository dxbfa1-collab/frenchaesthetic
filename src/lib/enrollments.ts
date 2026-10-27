import type { Payload } from 'payload'

import type { Enrollment } from '@/payload-types'

export const REFERENCE_PATTERN = /^FAA-\d{4}-[A-Z0-9]{4}$/

/** The enrollment behind a private payment link, or null. Both the reference and the key must match. */
export async function findEnrollmentForPayment(
  payload: Payload,
  ref: string,
  key: string,
): Promise<Enrollment | null> {
  if (!REFERENCE_PATTERN.test(ref) || key.length < 16) return null
  const { docs } = await payload.find({
    collection: 'enrollments',
    depth: 1,
    limit: 1,
    showHiddenFields: true,
    where: { and: [{ reference: { equals: ref } }, { paymentKey: { equals: key } }] },
  })
  return docs[0] ?? null
}
