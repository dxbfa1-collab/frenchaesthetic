import { randomBytes } from 'crypto'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  FieldHook,
  PayloadRequest,
  TextFieldSingleValidation,
} from 'payload'

import { ownerOr, staffField } from '../access/roles'
import { sourceField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'
import { sendStaffAlert } from '../lib/notify'
import { newReference } from '../lib/reference'
import { relationId } from '../lib/relation'
import { siteUrl } from '../lib/site'

const prepare: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
  if (operation === 'create') {
    data.reference = newReference('FAA')
    data.paymentKey = randomBytes(18).toString('base64url')
  }
  // Course and track always follow the chosen batch.
  const batchId = relationId(data.batch ?? originalDoc?.batch)
  if (batchId) {
    const batch = await req.payload.findByID({ collection: 'batches', id: batchId, depth: 0, req })
    const courseId = relationId(batch.course)
    if (courseId) {
      const course = await req.payload.findByID({
        collection: 'courses',
        id: courseId,
        depth: 0,
        req,
      })
      data.course = course.id
      data.track = course.track
    }
  }
  return data
}

/** Counter update without re-running batch validation or hooks; the site is refreshed after. */
async function shiftSeats(req: PayloadRequest, batchId: string, delta: number) {
  const batch = await req.payload.findByID({ collection: 'batches', id: batchId, depth: 0, req })
  await req.payload.db.updateOne({
    collection: 'batches',
    id: batchId,
    data: { seatsTaken: Math.max(0, (batch.seatsTaken ?? 0) + delta) },
    req,
  })
}

// Brief §6: when an enrollment is confirmed, the batch's seats taken goes up by one.
const updateSeats: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  const before =
    operation === 'update' && previousDoc?.status === 'confirmed'
      ? relationId(previousDoc.batch)
      : undefined
  const after = doc.status === 'confirmed' ? relationId(doc.batch) : undefined
  if (before === after) return doc
  if (before) await shiftSeats(req, before, -1)
  if (after) await shiftSeats(req, after, 1)
  revalidateSite(req)
  return doc
}

const alertOnCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const batchId = relationId(doc.batch)
  const batch = batchId
    ? await req.payload
        .findByID({ collection: 'batches', id: batchId, depth: 0, req })
        .catch(() => null)
    : null
  await sendStaffAlert(req.payload, {
    inbox: 'enrollment',
    req,
    subject: `New enrollment ${doc.reference}: ${batch?.title ?? 'batch not set'}`,
    lines: [
      `Reference: ${doc.reference}`,
      `Batch: ${batch?.title ?? '-'}`,
      `Name: ${doc.name}`,
      `WhatsApp: ${doc.phone}`,
      `Email: ${doc.email || '-'}`,
      `City: ${doc.city}`,
      `Profession: ${doc.profession}`,
      ...(doc.track === 'invasive'
        ? [`PMDC number: ${doc.pmdcNumber || '-'}`, `Documents: ${doc.documents?.length ?? 0}`]
        : []),
      `Came from: ${doc.source?.code || doc.source?.page || '-'}`,
      '',
      `Open in the admin: ${siteUrl}/admin/collections/enrollments/${doc.id}`,
    ],
  })
  return doc
}

const paymentLink: FieldHook = ({ siblingData }) => {
  const { reference, paymentKey } = (siblingData ?? {}) as {
    reference?: string
    paymentKey?: string
  }
  return reference && paymentKey
    ? `${siteUrl}/academy/enroll/payment?ref=${encodeURIComponent(reference)}&key=${encodeURIComponent(paymentKey)}`
    : undefined
}

const pmdcRequired: TextFieldSingleValidation = (value, { siblingData }) => {
  const track = (siblingData as { track?: string }).track
  return track === 'invasive' && !value
    ? 'The PMDC number is required for the invasive course.'
    : true
}

/**
 * Online applications (brief §6): applied → verified → paid → confirmed, or rejected.
 * Created only through the website form (server-side), never directly over the public API.
 */
export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'course', 'batch', 'status', 'createdAt'],
    listSearchableFields: ['reference', 'name', 'phone', 'email'],
    group: 'Academy',
  },
  access: {
    create: ownerOr('academyCoordinator'),
    read: ownerOr('academyCoordinator'),
    update: ownerOr('academyCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: '-createdAt',
  hooks: {
    beforeChange: [prepare],
    afterChange: [updateSeats, alertOnCreate],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'applied',
      options: [
        { label: 'Applied', value: 'applied' },
        { label: 'Verified (payment pending)', value: 'verified' },
        { label: 'Paid', value: 'paid' },
        { label: 'Confirmed (seat taken)', value: 'confirmed' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'batch',
          type: 'relationship',
          relationTo: 'batches',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          admin: { width: '30%', readOnly: true, description: 'Follows the batch.' },
        },
        {
          name: 'track',
          type: 'select',
          options: [
            { label: 'Non-Invasive', value: 'nonInvasive' },
            { label: 'Invasive', value: 'invasive' },
          ],
          admin: { width: '20%', readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'phone',
          label: 'WhatsApp number',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'profession', type: 'text', required: true },
    {
      type: 'collapsible',
      label: 'PMDC (invasive course)',
      admin: { condition: (data) => data?.track === 'invasive' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'pmdcNumber',
              label: 'PMDC number',
              type: 'text',
              validate: pmdcRequired,
              admin: { width: '50%' },
            },
            {
              name: 'houseJob',
              label: 'House job',
              type: 'select',
              options: [
                { label: 'Completed', value: 'completed' },
                { label: 'In progress', value: 'inProgress' },
                { label: 'Not started', value: 'notStarted' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'documents',
          label: 'PMDC certificate or degree',
          type: 'relationship',
          relationTo: 'enrollment-files',
          hasMany: true,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Payment',
      fields: [
        {
          // Virtual: built from the reference and the private key, never stored.
          name: 'paymentLink',
          type: 'text',
          virtual: true,
          access: { read: staffField },
          hooks: { afterRead: [paymentLink] },
          admin: {
            readOnly: true,
            description:
              'After verifying, send this link with the payment details on WhatsApp. The student uploads the payment proof there.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'paymentMethod',
              type: 'select',
              options: [
                { label: 'Bank transfer', value: 'bankTransfer' },
                { label: 'JazzCash', value: 'jazzCash' },
                { label: 'Easypaisa', value: 'easypaisa' },
                { label: 'Other', value: 'other' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'paymentProofUploadedAt',
              type: 'date',
              admin: { width: '50%', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
            },
          ],
        },
        {
          name: 'paymentProof',
          type: 'relationship',
          relationTo: 'enrollment-files',
          hasMany: true,
        },
      ],
    },
    {
      name: 'whatsappConsent',
      label: 'Agreed to be contacted on WhatsApp',
      type: 'checkbox',
      admin: { readOnly: true },
    },
    sourceField,
    { name: 'staffNotes', type: 'textarea' },
    { name: 'paymentKey', type: 'text', hidden: true, index: true },
  ],
}
