import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/brand/**' }],
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  experimental: {
    // Enrollment uploads: up to two documents of 5 MB each.
    serverActions: { bodySizeLimit: '11mb' },
  },
  async redirects() {
    return [
      // Academy addresses from the original prompt, mapped to the FAA brief's (CLAUDE.md, build decisions).
      { source: '/academy/calendar', destination: '/academy/batches', permanent: true },
      { source: '/academy/trainers', destination: '/academy/faculty', permanent: true },
      { source: '/academy/courses/:slug', destination: '/academy/:slug', permanent: true },
      // Not in v1: no accreditation exists, and the fee display is undecided.
      { source: '/academy/fees', destination: '/academy/courses', permanent: false },
      { source: '/academy/accreditation', destination: '/academy/about', permanent: false },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
