import type { Access, CollectionConfig } from 'payload'

import { ownerOr } from '../access/roles'
import { slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

// The public sees published posts only; staff see drafts too.
const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } }

/** Blog articles. Medical topics need the reviewing doctor named before publishing (brief §8). */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'business', 'status', 'publishedAt'],
    group: 'Content',
  },
  access: {
    read: publishedOrStaff,
    create: ownerOr('editor', 'clinicCoordinator', 'academyCoordinator'),
    update: ownerOr('editor', 'clinicCoordinator', 'academyCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: '-publishedAt',
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      type: 'row',
      fields: [
        {
          name: 'business',
          type: 'select',
          required: true,
          defaultValue: 'clinic',
          options: [
            { label: 'Clinic', value: 'clinic' },
            { label: 'Academy', value: 'academy' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    { name: 'excerpt', type: 'textarea' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', required: true },
    {
      type: 'row',
      fields: [
        { name: 'author', type: 'relationship', relationTo: 'doctors', admin: { width: '50%' } },
        {
          name: 'reviewedBy',
          label: 'Medically reviewed by',
          type: 'relationship',
          relationTo: 'doctors',
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
  ],
}
