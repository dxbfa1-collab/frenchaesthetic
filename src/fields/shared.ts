import type { Field, FieldHook, TextField } from 'payload'

import { staffField } from '../access/roles'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const slugFrom =
  (source: string): FieldHook =>
  ({ value, siblingData }) =>
    value || (typeof siblingData?.[source] === 'string' ? slugify(siblingData[source]) : value)

/** URL slug, filled in from another field (the name by default). */
export function slugField(source = 'name'): TextField {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    hooks: { beforeValidate: [slugFrom(source)] },
    admin: {
      position: 'sidebar',
      description: 'Used in the page address. Filled in from the name.',
    },
  }
}

export const FACT_STATUS_OPTIONS = [
  { label: 'Confirmed by the owner', value: 'confirmed' },
  { label: 'To confirm (staging only, hidden on the live site)', value: 'confirm' },
]

/** Brief rule: only owner-confirmed facts go live. Unconfirmed ones show on staging with a marker. */
export function factStatusField(name = 'status', label = 'Status'): Field {
  return {
    name,
    label,
    type: 'select',
    required: true,
    defaultValue: 'confirm',
    options: FACT_STATUS_OPTIONS,
    admin: { position: 'sidebar' },
  }
}

export const internalNoteField: Field = {
  name: 'internalNote',
  type: 'textarea',
  access: { read: staffField },
  admin: { description: 'Staff only. Never shown on the website.' },
}
