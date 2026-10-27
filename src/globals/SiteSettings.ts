import type { GlobalConfig } from 'payload'

import { anyone, ownerOr } from '../access/roles'
import { revalidateSite } from '../hooks/revalidate'
import { DEFAULT_ACADEMY_FILTER_LINE, DEFAULT_MEDICAL_DISCLAIMER } from '../lib/site'

/**
 * Every public number, email and social link lives here, so staff can change them without a
 * developer. Clinic and academy are kept apart: the academy never shows clinic numbers.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  typescript: { interface: 'SiteSettings' },
  admin: { group: 'Admin' },
  access: {
    read: anyone,
    update: ownerOr(),
  },
  hooks: {
    afterChange: [({ req }) => revalidateSite(req)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Clinic',
          fields: [
            {
              name: 'clinicPhone',
              label: 'UAN',
              type: 'text',
              required: true,
              admin: {
                description:
                  'The only number in the clinic header and footer, written as it should appear.',
              },
            },
            {
              name: 'clinicWhatsApp',
              label: 'Clinic WhatsApp',
              type: 'text',
              admin: { description: 'Leave empty when the UAN itself is on WhatsApp.' },
            },
            { name: 'clinicEmail', label: 'Email', type: 'email' },
            { name: 'clinicInstagram', label: 'Instagram link', type: 'text' },
            { name: 'clinicFacebook', label: 'Facebook link', type: 'text' },
          ],
        },
        {
          label: 'Academy',
          fields: [
            {
              name: 'admissionsWhatsApp',
              label: 'Admissions WhatsApp',
              type: 'text',
              required: true,
              admin: { description: 'The one admissions number on every academy page.' },
            },
            { name: 'academyEmail', label: 'Email', type: 'email' },
            { name: 'academyInstagram', label: 'Instagram link', type: 'text' },
            { name: 'academyFacebook', label: 'Facebook link', type: 'text' },
            {
              name: 'batchStartDays',
              label: 'Batch start days',
              type: 'number',
              hasMany: true,
              min: 1,
              max: 28,
              defaultValue: [15, 20],
              admin: {
                description:
                  'Days of the month on which a new batch can start (owner rule, 28 Oct 2026: the 15th and the 20th). Shown on academy pages. Leave empty to say "New batches every month".',
              },
            },
          ],
        },
        {
          label: 'Reviews and tracking',
          fields: [
            { name: 'googleReviewsUrl', label: 'Google reviews link', type: 'text' },
            {
              name: 'ga4Id',
              label: 'Google Analytics 4 ID',
              type: 'text',
              admin: { placeholder: 'G-XXXXXXXXXX' },
            },
            { name: 'metaPixelId', label: 'Meta Pixel ID', type: 'text' },
          ],
        },
        {
          label: 'Legal text',
          fields: [
            {
              name: 'medicalDisclaimer',
              type: 'textarea',
              required: true,
              defaultValue: DEFAULT_MEDICAL_DISCLAIMER,
            },
            {
              name: 'academyFilterLine',
              label: 'Academy filter line',
              type: 'textarea',
              required: true,
              defaultValue: DEFAULT_ACADEMY_FILTER_LINE,
            },
          ],
        },
      ],
    },
  ],
}
