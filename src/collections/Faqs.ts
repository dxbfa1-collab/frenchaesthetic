import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { factStatusField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

/** Questions for the clinic and the academy. An academy question tied to a course shows on that course page. */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'business', 'course', 'status'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: ownerOr('clinicCoordinator', 'academyCoordinator', 'editor'),
    update: ownerOr('clinicCoordinator', 'academyCoordinator', 'editor'),
    delete: ownerOr('clinicCoordinator', 'academyCoordinator'),
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'business',
          type: 'select',
          required: true,
          options: [
            { label: 'Clinic', value: 'clinic' },
            { label: 'Academy', value: 'academy' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.business === 'academy',
            description: 'Leave empty for a general academy question.',
          },
        },
        {
          name: 'treatment',
          type: 'relationship',
          relationTo: 'treatments',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.business === 'clinic',
            description: 'Leave empty for a general clinic question.',
          },
        },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    factStatusField(),
  ],
}
