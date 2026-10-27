import type { CollectionConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { FACT_STATUS_OPTIONS, slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

/** Academy courses. The course page (/academy/<slug>) is built entirely from these fields. */
export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'track', 'batchStartDay', 'order'],
    group: 'Academy',
  },
  access: {
    read: anyone,
    create: ownerOr('academyCoordinator'),
    update: ownerOr('academyCoordinator'),
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
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                {
                  name: 'shortName',
                  type: 'text',
                  required: true,
                  admin: { width: '40%', placeholder: 'Non-Invasive' },
                },
              ],
            },
            slugField(),
            {
              type: 'row',
              fields: [
                {
                  name: 'track',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Non-Invasive', value: 'nonInvasive' },
                    { label: 'Invasive (doctors)', value: 'invasive' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'requiresPMDC',
                  label: 'Requires PMDC registration',
                  type: 'checkbox',
                  admin: {
                    width: '33%',
                    description: 'Asks for the PMDC number and documents when enrolling.',
                  },
                },
                {
                  name: 'batchStartDay',
                  label: 'Batch start day',
                  type: 'number',
                  required: true,
                  min: 1,
                  max: 28,
                  admin: {
                    width: '33%',
                    description: 'Day of the month a batch starts. A Sunday moves to Monday.',
                  },
                },
              ],
            },
            { name: 'duration', type: 'text', admin: { placeholder: '3 weeks (21 days)' } },
            {
              name: 'summary',
              type: 'textarea',
              admin: { description: 'One or two sentences for cards and search results.' },
            },
            {
              name: 'trainers',
              type: 'relationship',
              relationTo: 'doctors',
              hasMany: true,
              filterOptions: { isTrainer: { equals: true } },
            },
            { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
          ],
        },
        {
          label: 'Page copy',
          description:
            'Hooks in Roman Urdu, details in English. Never the same line in both languages.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  admin: { placeholder: 'For beauty professionals & beginners' },
                },
                { name: 'headline', type: 'text', required: true },
                {
                  name: 'headlineAccent',
                  label: 'Headline, second line (italic)',
                  type: 'text',
                },
                { name: 'subheadline', type: 'textarea' },
                {
                  name: 'ctaLabel',
                  label: 'WhatsApp button text',
                  type: 'text',
                  defaultValue: 'WhatsApp Karein',
                },
              ],
            },
            {
              name: 'whatsappMessage',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  "Pre-filled WhatsApp message. Keep the page's WEB code at the end, e.g. (WEB-NI).",
              },
            },
            {
              name: 'painPoints',
              type: 'array',
              labels: { singular: 'Pain point', plural: 'Pain points' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'audience',
              label: 'Who it is for',
              type: 'text',
              hasMany: true,
            },
            {
              name: 'featured',
              label: 'Featured treatments or topics',
              type: 'text',
              hasMany: true,
            },
            {
              name: 'journey',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '25%', placeholder: 'Week 1' },
                    },
                    { name: 'text', type: 'text', required: true, admin: { width: '75%' } },
                  ],
                },
              ],
            },
            {
              name: 'highlights',
              label: 'What makes it different',
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'filterLine',
              type: 'textarea',
              admin: {
                description:
                  'Optional line at the end of the page, e.g. who the course is not for.',
              },
            },
          ],
        },
        {
          label: 'Syllabus',
          fields: [
            {
              name: 'modules',
              type: 'array',
              labels: { singular: 'Module', plural: 'Modules' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                    {
                      name: 'theoryOnly',
                      label: 'Overview (theory) only',
                      type: 'checkbox',
                      admin: { width: '30%' },
                    },
                  ],
                },
                { name: 'topics', type: 'text', hasMany: true },
              ],
            },
            {
              name: 'timetable',
              label: 'Daily timetable',
              type: 'array',
              admin: { description: 'Leave empty until the current class hours are confirmed.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'day',
                      type: 'text',
                      required: true,
                      admin: { width: '30%', placeholder: 'Day 1' },
                    },
                    { name: 'focus', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'At a glance',
          fields: [
            {
              name: 'glance',
              label: 'Course at a glance',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'item', type: 'text', required: true, admin: { width: '25%' } },
                    { name: 'detail', type: 'text', required: true, admin: { width: '50%' } },
                    {
                      name: 'status',
                      type: 'select',
                      required: true,
                      defaultValue: 'confirm',
                      options: FACT_STATUS_OPTIONS,
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Fee',
          fields: [
            {
              name: 'feeDisplay',
              type: 'select',
              required: true,
              defaultValue: 'whatsapp',
              options: [
                { label: 'Fee on WhatsApp (no number on the site)', value: 'whatsapp' },
                { label: 'Show the fee', value: 'show' },
                { label: 'Show "From PKR …"', value: 'from' },
              ],
            },
            {
              name: 'fee',
              label: 'Fee (PKR)',
              type: 'number',
              min: 0,
              admin: { condition: (_, siblingData) => siblingData?.feeDisplay !== 'whatsapp' },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', admin: { description: 'About 60 characters.' } },
            {
              name: 'metaDescription',
              type: 'textarea',
              admin: { description: 'About 155 characters.' },
            },
          ],
        },
      ],
    },
  ],
}
