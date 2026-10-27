import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Batches } from './collections/Batches'
import { Branches } from './collections/Branches'
import { Courses } from './collections/Courses'
import { Doctors } from './collections/Doctors'
import { EnrollmentFiles } from './collections/EnrollmentFiles'
import { Enrollments } from './collections/Enrollments'
import { Faqs } from './collections/Faqs'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { cloudinaryStorage } from './storage/cloudinary'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Email goes out over SMTP (e.g. the Hostinger mailbox) once SMTP_HOST is set.
// Without it, Payload writes each email to the server log instead.
const smtpPort = Number(process.env.SMTP_PORT || 465)
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || process.env.SMTP_USER || '',
      defaultFromName: 'French Aesthetics website',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Website admin',
    },
  },
  collections: [
    Courses,
    Batches,
    Enrollments,
    EnrollmentFiles,
    Doctors,
    Branches,
    Faqs,
    Media,
    Users,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  upload: {
    limits: { fileSize: 5_000_000 },
  },
  plugins: [cloudinaryStorage()],
})
