import type { CollectionConfig } from 'payload'

import { anyone, ownerOr, staffField } from '../access/roles'
import { FACT_STATUS_OPTIONS as FACT_STATUS, internalNoteField, slugField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'

/**
 * Clinic branches and academy campuses (one record when they share a building).
 * Unconfirmed addresses and hours show only on staging, with a [CONFIRM] marker.
 */
export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'business', 'status', 'addressStatus'],
    group: 'Locations',
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
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'shortName',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Optional shorter name, e.g. "Iqbal Town" for academy pages.',
          },
        },
      ],
    },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'business',
          type: 'select',
          required: true,
          defaultValue: 'clinic',
          options: [
            { label: 'Clinic branch', value: 'clinic' },
            { label: 'Academy campus', value: 'academy' },
            { label: 'Both (shared building)', value: 'both' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'city',
          type: 'select',
          required: true,
          options: [
            { label: 'Lahore', value: 'Lahore' },
            { label: 'Karachi', value: 'Karachi' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Planned (not open yet)', value: 'planned' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
    {
      type: 'collapsible',
      label: 'Address and map',
      fields: [
        { name: 'address', type: 'textarea' },
        {
          name: 'addressStatus',
          type: 'select',
          required: true,
          defaultValue: 'confirm',
          options: FACT_STATUS,
        },
        { name: 'mapUrl', label: 'Google Maps link', type: 'text' },
        { name: 'googleBusinessUrl', label: 'Google Business Profile link', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'parkingNote', type: 'text', admin: { width: '50%' } },
            { name: 'landmarkNote', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'whatsapp',
              label: 'Branch WhatsApp',
              type: 'text',
              admin: {
                width: '50%',
                description:
                  'Only an owner-approved branch number. Leave empty to use the main UAN.',
              },
            },
            { name: 'phone', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          name: 'alertEmails',
          label: 'Booking alert emails',
          type: 'text',
          access: { read: staffField },
          admin: {
            description:
              "This branch's CSR, emailed about each booking for it. Separate several with commas. Staff only.",
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Consultation (clinic)',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'consultation',
              type: 'select',
              defaultValue: 'unknown',
              options: [
                { label: 'Free consultation', value: 'free' },
                { label: 'Consultation fee applies', value: 'paid' },
                { label: 'Not decided', value: 'unknown' },
              ],
              admin: { width: '33%' },
            },
            {
              name: 'consultationFee',
              label: 'Fee (PKR)',
              type: 'number',
              admin: {
                width: '33%',
                condition: (_, siblingData) => siblingData?.consultation === 'paid',
                description: 'Shown only when filled in.',
              },
            },
            {
              name: 'skinAnalysis',
              label: 'AI skin analysis included',
              type: 'checkbox',
              admin: { width: '33%' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Opening hours',
      fields: [
        {
          name: 'hours',
          type: 'array',
          labels: { singular: 'Line', plural: 'Lines' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'days',
                  type: 'text',
                  required: true,
                  admin: { width: '40%', placeholder: 'Mon to Sat' },
                },
                { name: 'opens', type: 'text', admin: { width: '30%', placeholder: '12:00 PM' } },
                { name: 'closes', type: 'text', admin: { width: '30%', placeholder: '8:00 PM' } },
              ],
            },
          ],
        },
        {
          name: 'hoursStatus',
          type: 'select',
          required: true,
          defaultValue: 'confirm',
          options: FACT_STATUS,
        },
      ],
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    internalNoteField,
  ],
}
