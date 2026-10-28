import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { factStatusField, internalNoteField, slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

/**
 * Doctors (clinic) and trainers (academy) in one list, since several people are both.
 * Brief rule: publish credentials exactly as documented, and a photo only with written consent.
 */
export const Doctors: CollectionConfig = {
  slug: 'doctors',
  labels: { singular: 'Doctor or trainer', plural: 'Doctors and trainers' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'isTrainer', 'status'],
    group: 'People',
  },
  access: {
    read: anyone,
    create: ownerOr('clinicCoordinator', 'academyCoordinator'),
    update: ownerOr('clinicCoordinator', 'academyCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { placeholder: 'Dr. Iqra Fatima' } },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            width: '50%',
            description:
              'Exactly as documented, e.g. "Dermatologist". Never a title that is not on record.',
          },
        },
        { name: 'degrees', type: 'text', admin: { width: '25%', placeholder: 'FCPS' } },
        { name: 'pmdcNumber', label: 'PMDC number', type: 'text', admin: { width: '25%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'photo', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
        {
          name: 'photoConsent',
          label: 'Written photo consent on file',
          type: 'checkbox',
          admin: {
            width: '50%',
            description: 'The photo shows on the website only when this is ticked.',
          },
        },
      ],
    },
    { name: 'bio', type: 'textarea' },
    {
      type: 'collapsible',
      label: 'Academy trainer',
      fields: [
        { name: 'isTrainer', label: 'Teaches at the academy', type: 'checkbox' },
        {
          type: 'row',
          fields: [
            {
              name: 'trainerRole',
              type: 'text',
              admin: { width: '50%', placeholder: 'Lead Trainer' },
            },
            {
              name: 'teaches',
              type: 'text',
              admin: { width: '50%', description: 'One line on what they teach.' },
            },
          ],
        },
      ],
    },
    {
      name: 'clinicTeam',
      label: 'Clinic team (shown on the clinic Doctors page)',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Untick for someone who only teaches at the academy.' },
    },
    {
      name: 'worksAt',
      label: 'Clinic branches',
      type: 'relationship',
      relationTo: 'branches',
      hasMany: true,
      filterOptions: { business: { in: ['clinic', 'both'] } },
      admin: { description: 'Only branches where this doctor is confirmed to work.' },
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    factStatusField(),
    internalNoteField,
  ],
}
