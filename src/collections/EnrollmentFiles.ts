import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { ownerOr } from '../access/roles'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * PMDC documents and payment proofs. Private: never a public URL. Every file is served through
 * Payload, which checks that the viewer is the owner or an academy coordinator first.
 * In production the files live in Cloudinary as authenticated assets (src/storage/cloudinary.ts).
 */
export const EnrollmentFiles: CollectionConfig = {
  slug: 'enrollment-files',
  labels: { singular: 'Enrollment document', plural: 'Enrollment documents' },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'kind', 'reference', 'createdAt'],
    group: 'Academy',
  },
  access: {
    read: ownerOr('academyCoordinator'),
    create: ownerOr('academyCoordinator'),
    update: ownerOr('academyCoordinator'),
    delete: ownerOr(),
  },
  upload: {
    staticDir: path.resolve(dirname, '../../private-uploads'),
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    crop: false,
    focalPoint: false,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'PMDC certificate or degree', value: 'pmdcDocument' },
        { label: 'Payment proof', value: 'paymentProof' },
      ],
    },
    { name: 'reference', label: 'Enrollment reference', type: 'text', index: true },
  ],
}
