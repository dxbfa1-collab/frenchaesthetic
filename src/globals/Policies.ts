import type { Field, GlobalConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { FACT_STATUS_OPTIONS } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

export const POLICIES = [
  { key: 'privacy', title: 'Privacy policy' },
  { key: 'terms', title: 'Terms of use' },
  { key: 'refunds', title: 'Refund policy' },
  { key: 'cancellations', title: 'Cancellation policy' },
] as const

const policyTab = (key: string, title: string) => ({
  label: title,
  fields: [
    {
      name: key,
      label: title,
      type: 'textarea',
      admin: {
        rows: 18,
        description:
          'Plain text. Leave a blank line between paragraphs. Lines starting with "## " become headings.',
      },
    },
    {
      name: `${key}Status`,
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'confirm',
      options: FACT_STATUS_OPTIONS,
    },
  ] as Field[],
})

/** Policy texts for /policies/*. Until a text is confirmed, the live site shows a short notice instead. */
export const Policies: GlobalConfig = {
  slug: 'policies',
  label: 'Policies',
  typescript: { interface: 'Policies' },
  admin: { group: 'Admin' },
  access: { read: anyone, update: ownerOr() },
  hooks: { afterChange: [({ req }) => revalidateSite(req)] },
  fields: [{ type: 'tabs', tabs: POLICIES.map((p) => policyTab(p.key, p.title)) }],
}
