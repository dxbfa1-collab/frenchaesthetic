import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary'
import path from 'path'
import type { Plugin } from 'payload'

const MIME_BY_EXTENSION: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  webp: 'image/webp',
}

function upload(buffer: Buffer, options: UploadApiOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error) => (error ? reject(error) : resolve()))
      .end(buffer)
  })
}

/**
 * Public images (Media), served straight from Cloudinary's CDN.
 * Image public IDs carry no extension in Cloudinary; the format is part of the delivery URL.
 */
function publicAdapter(folder: string): Adapter {
  return ({ prefix }) => {
    const publicId = (filename: string, docPrefix?: string) =>
      path.posix.join(folder, docPrefix || prefix || '', filename.replace(/\.[^.]+$/, ''))

    const urlFor = (filename: string, docPrefix?: string) =>
      cloudinary.url(publicId(filename, docPrefix), {
        format: path.extname(filename).slice(1).toLowerCase() || undefined,
        resource_type: 'image',
        secure: true,
      })

    return {
      name: 'cloudinary',
      handleUpload: async ({ data, file }) =>
        upload(file.buffer, {
          invalidate: true,
          overwrite: true,
          public_id: publicId(file.filename, data?.prefix),
          resource_type: 'image',
        }),
      handleDelete: async ({ doc, filename }) => {
        await cloudinary.uploader.destroy(publicId(filename, doc.prefix), {
          invalidate: true,
          resource_type: 'image',
        })
      },
      generateURL: ({ filename, prefix: docPrefix }) => urlFor(filename, docPrefix),
      staticHandler: (_req, { params }) =>
        Response.redirect(urlFor(params.filename, params.prefix), 302),
    }
  }
}

/**
 * Private files (PMDC documents, payment proofs), stored as authenticated raw assets so they have
 * no public URL. Payload checks read access first; this handler then fetches the file with a
 * one-minute signed link and streams it to the signed-in staff member.
 */
function privateAdapter(folder: string): Adapter {
  return ({ prefix }) => {
    const publicId = (filename: string, docPrefix?: string) =>
      path.posix.join(folder, 'private', docPrefix || prefix || '', filename)

    return {
      name: 'cloudinary-private',
      handleUpload: async ({ data, file }) =>
        upload(file.buffer, {
          overwrite: true,
          public_id: publicId(file.filename, data?.prefix),
          resource_type: 'raw',
          type: 'authenticated',
        }),
      handleDelete: async ({ doc, filename }) => {
        await cloudinary.uploader.destroy(publicId(filename, doc.prefix), {
          invalidate: true,
          resource_type: 'raw',
          type: 'authenticated',
        })
      },
      staticHandler: async (_req, { params }) => {
        const url = cloudinary.utils.private_download_url(
          publicId(params.filename, params.prefix),
          '',
          {
            expires_at: Math.floor(Date.now() / 1000) + 60,
            resource_type: 'raw',
            type: 'authenticated',
          },
        )
        const res = await fetch(url)
        if (!res.ok || !res.body) return new Response('Not found', { status: 404 })
        const ext = path.extname(params.filename).slice(1).toLowerCase()
        return new Response(res.body, {
          headers: {
            'Cache-Control': 'private, no-store',
            'Content-Type': MIME_BY_EXTENSION[ext] ?? 'application/octet-stream',
          },
        })
      },
    }
  }
}

/**
 * On when CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set.
 * Without them (local development) files go to ./media and ./private-uploads on this machine.
 */
export function cloudinaryStorage(): Plugin {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_FOLDER || 'french-aesthetic'
  const enabled = Boolean(cloudName && apiKey && apiSecret)
  if (enabled)
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })

  return cloudStoragePlugin({
    enabled,
    collections: {
      media: {
        adapter: enabled ? publicAdapter(folder) : null,
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
      },
      // No disablePayloadAccessControl here: every file request passes Payload's access check.
      'enrollment-files': {
        adapter: enabled ? privateAdapter(folder) : null,
        disableLocalStorage: true,
      },
    },
  })
}
