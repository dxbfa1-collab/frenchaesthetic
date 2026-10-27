import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

/** Brief §5: Skin & Facials · Laser Treatments · Face Lifting & Tightening · Injectables · Hair · Body. */
export const TreatmentCategories: CollectionConfig = {
  slug: 'treatment-categories',
  labels: { singular: 'Treatment category', plural: 'Treatment categories' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order'], group: 'Clinic' },
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
  ],
}
