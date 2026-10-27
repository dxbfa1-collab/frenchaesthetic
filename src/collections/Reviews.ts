import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { revalidateSite } from '../hooks/revalidate'

/** Real client and student reviews, shown only with consent (no template or invented testimonials). */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'source', 'consent'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: ownerOr('clinicCoordinator', 'academyCoordinator'),
    update: ownerOr('clinicCoordinator', 'academyCoordinator'),
    delete: ownerOr(),
  },
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'rating', type: 'number', min: 1, max: 5, admin: { width: '25%' } },
        {
          name: 'source',
          type: 'select',
          options: ['Google', 'Facebook', 'Instagram', 'In person'],
          admin: { width: '25%' },
        },
      ],
    },
    { name: 'text', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'treatment',
          type: 'relationship',
          relationTo: 'treatments',
          admin: { width: '50%' },
        },
        { name: 'course', type: 'relationship', relationTo: 'courses', admin: { width: '50%' } },
      ],
    },
    {
      name: 'consent',
      label: 'The person agreed to this review being shown',
      type: 'checkbox',
    },
  ],
}
