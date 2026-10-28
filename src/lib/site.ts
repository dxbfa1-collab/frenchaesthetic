/**
 * Staging (the default) keeps the site out of search engines and shows unconfirmed facts with a
 * [CONFIRM] marker. Set SITE_STAGE=production on launch day; unconfirmed facts are then hidden.
 */
export const isProduction = process.env.SITE_STAGE === 'production'
export const isStaging = !isProduction

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
)

/** Required on every page (FMA brief §9). The CMS copy in Site settings wins when it is filled in. */
export const DEFAULT_MEDICAL_DISCLAIMER =
  'Information on this website is general and not medical advice. All treatments are subject to an in-person medical assessment. Results vary from person to person.'

/** Shown at the bottom of every academy page (FAA brief §3). */
export const DEFAULT_ACADEMY_FILTER_LINE =
  'This is a training course, not a treatment booking. For treatments, please contact French Medical Aesthetics clinic.'
