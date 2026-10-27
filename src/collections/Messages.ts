import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { ownerOr } from '../access/roles'
import { sourceField } from '../fields/shared'
import { sendStaffAlert } from '../lib/notify'
import { siteUrl } from '../lib/site'

// A patient's message goes to the clinic inbox, a student's to admissions.
const alertOnCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  await sendStaffAlert(req.payload, {
    inbox: doc.iAm === 'student' ? 'enrollment' : 'booking',
    req,
    subject: `New website message from ${doc.name}`,
    lines: [
      `From: ${doc.name} (${doc.iAm === 'student' ? 'doctor or student' : 'patient'})`,
      `WhatsApp: ${doc.phone}`,
      `Email: ${doc.email || '-'}`,
      `About: ${doc.interest || '-'}`,
      '',
      doc.message,
      '',
      `Open in the admin: ${siteUrl}/admin/collections/messages/${doc.id}`,
    ],
  })
  return doc
}

/** The shared contact form (/contact). */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'iAm', 'interest', 'status', 'createdAt'],
    group: 'Admin',
  },
  access: {
    create: ownerOr('clinicCoordinator', 'academyCoordinator'),
    read: ownerOr('clinicCoordinator', 'academyCoordinator'),
    update: ownerOr('clinicCoordinator', 'academyCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: '-createdAt',
  hooks: { afterChange: [alertOnCreate] },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Answered', value: 'answered' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'phone',
          label: 'WhatsApp number',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        {
          name: 'iAm',
          label: 'I am',
          type: 'select',
          required: true,
          options: [
            { label: 'A patient', value: 'patient' },
            { label: 'A doctor or student', value: 'student' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'interest', label: 'Treatment or course of interest', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    sourceField,
    { name: 'staffNotes', type: 'textarea' },
  ],
}
