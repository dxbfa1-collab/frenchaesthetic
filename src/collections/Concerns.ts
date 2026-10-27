import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { factStatusField, slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

/** Patient concerns (acne, pigmentation, sagging skin...). Treatments point at these. */
export const Concerns: CollectionConfig = {
  slug: 'concerns',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'status', 'order'], group: 'Clinic' },
  access: {
    read: anyone,
    create: ownerOr('clinicCoordinator'),
    update: ownerOr('clinicCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    factStatusField(),
  ],
}
