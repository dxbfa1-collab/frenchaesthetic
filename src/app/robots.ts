import type { MetadataRoute } from 'next'

import { isStaging, siteUrl } from '@/lib/site'

// Staging (the temporary Hostinger domain) stays out of search engines until launch day.
export default function robots(): MetadataRoute.Robots {
  if (isStaging) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
