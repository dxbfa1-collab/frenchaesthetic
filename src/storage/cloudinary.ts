import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import type { Plugin } from 'payload'

type Credentials = { cloudName: string; apiKey: string; apiSecret: string; folder: string }

/**
 * Stores the Media collection in Cloudinary and serves files straight from its CDN.
 * Image public IDs carry no extension in Cloudinary; the format is part of the delivery URL.
 */
function cloudinaryAdapter({ cloudName, apiKey, apiSecret, folder }: Credentials): Adapter {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })

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
      handleUpload: async ({ data, file }) => {
        await new Promise<void>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              invalidate: true,
              overwrite: true,
              public_id: publicId(file.filename, data?.prefix),
              resource_type: 'image',
            },
            (error) => (error ? reject(error) : resolve()),
          )
          stream.end(file.buffer)
        })
      },
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
 * On when CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set.
 * Without them (local development) uploads go to ./media, which is fine on this machine only.
 */
export function cloudinaryStorage(): Plugin {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_FOLDER || 'french-aesthetic'
  const enabled = Boolean(cloudName && apiKey && apiSecret)

  return cloudStoragePlugin({
    enabled,
    collections: {
      media: {
        adapter: enabled
          ? cloudinaryAdapter({
              cloudName: cloudName!,
              apiKey: apiKey!,
              apiSecret: apiSecret!,
              folder,
            })
          : null,
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
      },
    },
  })
}
