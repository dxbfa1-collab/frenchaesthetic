import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/*
  301s from the WordPress site (CLAUDE.md §7), mapped one by one from its sitemaps. A treatment
  that is not on the live site yet sends visitors on to its category, or to the treatment list.
*/
const T = '/clinic/treatments'
const OLD_SERVICES: Record<string, string> = {
  botox: `${T}/injectables/botox`,
  'dermal-fillers-under-eyes-lips-chin': `${T}/injectables/dermal-fillers`,
  'non-surgical-nose-job': `${T}/injectables/liquid-rhinoplasty`,
  profhilo: `${T}/injectables/profhilo`,
  'skin-boosters': `${T}/injectables/skin-boosters`,
  mesotherapy: `${T}/injectables/mesotherapy`,
  'prp-face-hair': `${T}/injectables/prp-face-and-hair`,
  'fat-dissolving-injection': `${T}/injectables/fat-dissolving-injections`,
  'thread-lift-skin-tightening': `${T}/face-lifting-and-tightening/thread-lift`,
  'rf-microneedling': `${T}/face-lifting-and-tightening/rf-microneedling`,
  'chemical-peels': `${T}/skin-and-facials/chemical-peels`,
  microneedling: `${T}/skin-and-facials/microneedling`,
  'acne-treatment': `${T}/skin-and-facials/acne-treatment`,
  'melasma-treatment': `${T}/skin-and-facials/melasma-treatment`,
  'dark-circles-treatment': `${T}/skin-and-facials/dark-circles-treatment`,
  'stretch-marks-treatment': `${T}/skin-and-facials/stretch-marks-treatment`,
  'stem-cell-therapy': `${T}/skin-and-facials/stem-cell-therapy`,
  'hair-prp': `${T}/hair/hair-prp`,
  'hair-exosome': `${T}/hair/hair-exosome`,
  'dandruff-treatment': `${T}/hair/dandruff-treatment`,
  'beard-growth-treatment': `${T}/hair/beard-growth-treatment`,
  'fat-freezing-cryolipolysis': `${T}/body/fat-freezing`,
  'body-sculpting-body-contouring': `${T}/body/body-contouring`,
  'double-chin-reduction': `${T}/body/double-chin-reduction`,
  'laser-hair-removal': `${T}/laser-treatments/laser-hair-removal`,
  'co2-fractional-laser': `${T}/laser-treatments/co2-fractional-laser`,
  'carbon-laser-peel': `${T}/laser-treatments/carbon-laser-facial`,
  'tattoo-removal': `${T}/laser-treatments/tattoo-removal`,
  'mole-removal': `${T}/laser-treatments/mole-removal`,
  'keloid-treatment': `${T}/laser-treatments/keloid-treatment`,
  'vitiligo-treatment': `${T}/medical-dermatology/vitiligo-treatment`,
  'skin-allergy-treatment': `${T}/medical-dermatology/skin-allergy-treatment`,
  'fungal-infection-treatment': `${T}/medical-dermatology/fungal-infection-treatment`,
  'nail-infection': `${T}/medical-dermatology/nail-infection-treatment`,
  // General surgery and the wellness group are not on the new site (owner, 28 Oct 2026).
}
const OLD_CATEGORIES: Record<string, string> = {
  'skin-rejuvenation-injectables': `${T}/injectables`,
  'laser-treatements': `${T}/laser-treatments`,
  'hydra-facial': `${T}/skin-and-facials`,
  'hair-treatments': `${T}/hair`,
  'fat-reduction': `${T}/body`,
  'medical-dermatology': `${T}/medical-dermatology`,
}
const OLD_PAGES: Record<string, string> = {
  '/our-services': T,
  '/our-doctors': '/clinic/doctors',
  '/doctor-details': '/clinic/doctors',
  '/make-appointment': '/clinic/book',
  '/schedule': '/clinic/book',
  '/about-us': '/about',
  '/contact-us': '/contact',
  '/faqs': '/clinic/faq',
  '/privacy-policy': '/policies/privacy',
  '/training-programs': '/academy',
  '/accreditations': '/academy/about',
  '/our-case': '/clinic',
  '/landing-page': '/clinic',
  '/blog-standard': '/blog',
  '/blog-grid': '/blog',
  '/blog-grid-without-sidebar': '/blog',
  '/wp-sitemap.xml': '/sitemap.xml',
}
// Shop, account and theme demo pages from the WordPress template.
const OLD_TEMPLATE_PAGES = [
  'shop',
  'cart',
  'checkout',
  'wishlist',
  'my-account',
  'my-account-2',
  'login',
  'registration',
  'lost-password',
  'reset-password',
  'sample-page',
  'coming-soon',
  'home-02',
  'home-03',
  'home-04',
  'home-02-one-page',
  'home-03-one-page',
  'home-04-one-page',
]

const legacyRedirects = [
  ...Object.entries(OLD_SERVICES).map(([slug, destination]) => ({
    source: `/service/${slug}`,
    destination,
    permanent: true,
  })),
  { source: '/service/:slug', destination: T, permanent: true },
  ...Object.entries(OLD_CATEGORIES).map(([slug, destination]) => ({
    source: `/service-category/${slug}`,
    destination,
    permanent: true,
  })),
  { source: '/service-category/:slug', destination: T, permanent: true },
  ...Object.entries(OLD_PAGES).map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })),
  ...OLD_TEMPLATE_PAGES.map((page) => ({ source: `/${page}`, destination: '/', permanent: true })),
]

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
    // Hostinger caps processes and threads per plan (120 in all), so the build uses one worker.
    // The build script also uses webpack, which does not start a thread per CPU core as Turbopack does.
    cpus: 1,
    webpackMemoryOptimizations: true,
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
      ...legacyRedirects,
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
