import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { revalidateSite } from '../hooks/revalidate'

/** Before and after cases. Only cases with written consent on file are ever shown (brief §9). */
export const Results: CollectionConfig = {
  slug: 'results',
  labels: { singular: 'Before and after', plural: 'Before and afters' },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'treatment', 'consentOnFile'],
    group: 'Clinic',
  },
  access: {
    read: anyone,
    create: ownerOr('clinicCoordinator'),
    update: ownerOr('clinicCoordinator'),
    delete: ownerOr(),
  },
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      required: true,
      admin: { placeholder: 'HIFU, jawline, 1 session' },
    },
    { name: 'treatment', type: 'relationship', relationTo: 'treatments', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'before',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'after',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'sessions', type: 'text', admin: { width: '50%' } },
        {
          name: 'timeBetween',
          label: 'Time between photos',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'consentOnFile',
      label: 'Written patient consent on file',
      type: 'checkbox',
      admin: {
        description: 'Required. Without it the case never shows. Never use AI-made images.',
      },
    },
  ],
}
