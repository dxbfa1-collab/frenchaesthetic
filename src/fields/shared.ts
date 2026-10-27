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

/** Where a form came from: page, WEB code and the ad campaign's UTM tags (brief §4). */
export const sourceField: Field = {
  name: 'source',
  type: 'group',
  admin: { description: 'Where the form came from (page, WEB code, ad campaign).' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'code', type: 'text', admin: { width: '33%', readOnly: true } },
        { name: 'page', type: 'text', admin: { width: '33%', readOnly: true } },
        { name: 'referrer', type: 'text', admin: { width: '33%', readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'utmSource', type: 'text', admin: { width: '20%', readOnly: true } },
        { name: 'utmMedium', type: 'text', admin: { width: '20%', readOnly: true } },
        { name: 'utmCampaign', type: 'text', admin: { width: '20%', readOnly: true } },
        { name: 'utmContent', type: 'text', admin: { width: '20%', readOnly: true } },
        { name: 'utmTerm', type: 'text', admin: { width: '20%', readOnly: true } },
      ],
    },
  ],
}

/** Ready → live only with a doctor's sign-off; the rest are kept for the owner to review on staging. */
export const CONTENT_STATUS_OPTIONS = [
  { label: 'Ready (offered now)', value: 'ready' },
  { label: 'To confirm (owner listed it, not confirmed as offered)', value: 'confirm' },
  { label: 'Historical (offered before, not reconfirmed)', value: 'historical' },
]
