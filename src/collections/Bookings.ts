import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'

import { ownerOr } from '../access/roles'
import { sourceField } from '../fields/shared'
import { sendStaffAlert } from '../lib/notify'
import { newReference } from '../lib/reference'
import { relationId } from '../lib/relation'
import { siteUrl } from '../lib/site'

export const TIME_SLOTS = [
  { label: 'Any time', value: 'any' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Late afternoon', value: 'lateAfternoon' },
  { label: 'Evening', value: 'evening' },
]

export const HEARD_FROM = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google', value: 'google' },
  { label: 'A friend', value: 'friend' },
  { label: 'Walked past a branch', value: 'walkIn' },
  { label: 'Other', value: 'other' },
]

const setReference: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create') data.reference = newReference('FMA')
  return data
}

// Brief §5: the branch CSR is told at once (the branch's own alert emails, then the clinic's).
const alertOnCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const branchId = relationId(doc.branch)
  const treatmentId = relationId(doc.treatment)
  const [branch, treatment] = await Promise.all([
    branchId
      ? req.payload
          .findByID({ collection: 'branches', id: branchId, depth: 0, req })
          .catch(() => null)
      : null,
    treatmentId
      ? req.payload
          .findByID({ collection: 'treatments', id: treatmentId, depth: 0, req })
          .catch(() => null)
      : null,
  ])
  await sendStaffAlert(req.payload, {
    inbox: 'booking',
    req,
    extraRecipients: branch?.alertEmails,
    subject: `New booking ${doc.reference}: ${branch?.name ?? 'branch not set'}`,
    lines: [
      `Reference: ${doc.reference}`,
      `Branch: ${branch?.name ?? '-'}`,
      `Treatment: ${treatment?.name ?? (doc.concern || '-')}`,
      `Preferred date: ${doc.preferredDate ? String(doc.preferredDate).slice(0, 10) : '-'} (${doc.timeSlot ?? 'any'})`,
      `Name: ${doc.name}`,
      `WhatsApp: ${doc.phone}`,
      `Email: ${doc.email || '-'}`,
      `Notes: ${doc.notes || '-'}`,
      `Heard from: ${doc.heardFrom || '-'}`,
      `Came from: ${doc.source?.code || doc.source?.page || '-'}`,
      '',
      `Open in the admin: ${siteUrl}/admin/collections/bookings/${doc.id}`,
    ],
  })
  return doc
}

/** Brief §5 booking: saved as "new", the branch is alerted, staff confirm the slot on WhatsApp. */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: [
      'reference',
      'name',
      'branch',
      'treatment',
      'preferredDate',
      'status',
      'createdAt',
    ],
    listSearchableFields: ['reference', 'name', 'phone', 'email'],
    group: 'Clinic',
  },
  access: {
    create: ownerOr('clinicCoordinator'),
    read: ownerOr('clinicCoordinator'),
    update: ownerOr('clinicCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: '-createdAt',
  hooks: {
    beforeChange: [setReference],
    afterChange: [alertOnCreate],
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
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Done', value: 'done' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No-show', value: 'noShow' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'branch',
          type: 'relationship',
          relationTo: 'branches',
          required: true,
          filterOptions: { business: { in: ['clinic', 'both'] } },
          admin: { width: '50%' },
        },
        {
          name: 'treatment',
          type: 'relationship',
          relationTo: 'treatments',
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'concern', label: 'Concern (if no treatment chosen)', type: 'text' },
    {
      type: 'row',
      fields: [
        {
          name: 'preferredDate',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'EEE d MMM yyyy' },
          },
        },
        {
          name: 'timeSlot',
          type: 'select',
          defaultValue: 'any',
          options: TIME_SLOTS,
          admin: { width: '50%' },
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
        {
          name: 'gender',
          type: 'select',
          options: [
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Prefer not to say', value: 'preferNot' },
          ],
          admin: { width: '25%' },
        },
        { name: 'age', type: 'number', min: 12, max: 100, admin: { width: '25%' } },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'heardFrom', label: 'How they heard about us', type: 'select', options: HEARD_FROM },
    {
      name: 'whatsappConsent',
      label: 'Agreed to be contacted on WhatsApp',
      type: 'checkbox',
      admin: { readOnly: true },
    },
    sourceField,
    { name: 'staffNotes', type: 'textarea' },
  ],
}
