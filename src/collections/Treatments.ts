import type { CollectionConfig, Field } from 'payload'

import { liveTreatmentOrStaff, ownerOr } from '../access/roles'
import { CONTENT_STATUS_OPTIONS, internalNoteField, slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

const lines = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'array',
  admin: description ? { description } : undefined,
  fields: [{ name: 'text', type: 'text', required: true }],
})

/**
 * Clinic treatments. A page goes live only when it is "Ready" AND a doctor has given medical
 * sign-off (brief §5 and §9: every description is a draft until a doctor reviews it). Everything
 * else shows on staging only, with a marker, so the owner can review it in place.
 * Prices are not shown on the website (owner, 28 Oct 2026).
 */
export const Treatments: CollectionConfig = {
  slug: 'treatments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'contentStatus', 'medicalSignOff', 'featured'],
    group: 'Clinic',
    description: 'A treatment is on the live site only when it is Ready and has medical sign-off.',
  },
  access: {
    read: liveTreatmentOrStaff,
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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'name', type: 'text', required: true },
            slugField(),
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'treatment-categories',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contentStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'confirm',
                  options: CONTENT_STATUS_OPTIONS,
                  admin: { width: '50%' },
                },
                {
                  name: 'medicalSignOff',
                  label: 'Medical sign-off (a doctor has reviewed this page)',
                  type: 'checkbox',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'featured',
                  label: 'Signature treatment (clinic home)',
                  type: 'checkbox',
                  admin: { width: '50%' },
                },
                { name: 'order', type: 'number', defaultValue: 10, admin: { width: '50%' } },
              ],
            },
            {
              name: 'promise',
              label: 'One-line promise',
              type: 'text',
              admin: {
                description: 'Calm and honest. No guarantee, "best", "painless" or "permanent".',
              },
            },
            {
              name: 'summary',
              type: 'textarea',
              admin: { description: 'Plain-language description.' },
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Treatment details',
          fields: [
            {
              name: 'quickFacts',
              type: 'group',
              admin: {
                description: 'Fill in only what the doctor has confirmed. Empty facts are hidden.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'sessionTime', type: 'text', admin: { width: '33%' } },
                    { name: 'downtime', type: 'text', admin: { width: '33%' } },
                    { name: 'sessions', type: 'text', admin: { width: '33%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'resultsVisible', type: 'text', admin: { width: '50%' } },
                    { name: 'resultsLast', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            { name: 'concerns', type: 'relationship', relationTo: 'concerns', hasMany: true },
            { name: 'howItWorks', type: 'textarea' },
            { name: 'limits', label: 'What it will not do', type: 'textarea' },
            lines('suits', 'Who it may suit'),
            lines(
              'avoid',
              'Tell your doctor if',
              'Screening points the doctor asks about. Needs medical sign-off.',
            ),
            {
              name: 'steps',
              type: 'array',
              admin: {
                description:
                  'Leave empty to use the standard consultation, plan, treatment, aftercare steps.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'text', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
            {
              name: 'timeline',
              label: 'Results timeline',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'when',
                      type: 'text',
                      required: true,
                      admin: { width: '30%', placeholder: 'Week 2' },
                    },
                    { name: 'text', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
            lines('aftercare', 'Aftercare'),
            lines(
              'priceFactors',
              'What changes the price',
              'Shown next to "Your price is given at consultation".',
            ),
          ],
        },
        {
          label: 'Doctors and branches',
          fields: [
            {
              name: 'doctors',
              label: 'Performed by',
              type: 'relationship',
              relationTo: 'doctors',
              hasMany: true,
              admin: {
                description:
                  'Only doctors who perform it. A physical therapist is never listed for a medical procedure.',
              },
            },
            {
              name: 'branches',
              label: 'Available at',
              type: 'relationship',
              relationTo: 'branches',
              hasMany: true,
              filterOptions: { business: { in: ['clinic', 'both'] } },
              admin: {
                description: 'Only branches that really offer it. Leave empty if not confirmed.',
              },
            },
            { name: 'related', type: 'relationship', relationTo: 'treatments', hasMany: true },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
          ],
        },
      ],
    },
    internalNoteField,
  ],
}
