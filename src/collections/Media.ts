import type { CollectionConfig } from 'payload'

import { anyone, isStaff, ownerOr } from '../access/roles'

/**
 * Public images (clinic, doctors, students, machines). Files live in Cloudinary once its keys are
 * set (see src/storage/cloudinary.ts); the app's own disk does not survive a Hostinger redeploy.
 * Private uploads (PMDC documents, payment proofs) get their own collection in Phase 3.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'peopleConsent', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: ownerOr('clinicCoordinator', 'academyCoordinator'),
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the photo for people who cannot see it, e.g. "Doctor examining skin at DHA Phase 4".',
      },
    },
    {
      name: 'peopleConsent',
      label: 'People in this photo',
      type: 'select',
      required: true,
      defaultValue: 'missing',
      options: [
        { label: 'No identifiable person', value: 'none' },
        { label: 'Written consent on file for everyone shown', value: 'onFile' },
        { label: 'Consent missing: do not publish', value: 'missing' },
      ],
      admin: {
        description:
          'Brand rule: real photos only, never AI-made faces, and written consent from every identifiable person.',
      },
    },
  ],
}
