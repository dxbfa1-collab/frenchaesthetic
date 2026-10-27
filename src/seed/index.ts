/**
 * Loads the starting content. Safe to run more than once: it never overwrites what staff have
 * edited (settings fill only fields that were never set, branches only when their slug is new).
 *
 *   npm run seed
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { branches, siteSettings } from './data'

const context = { disableRevalidate: true }
const payload = await getPayload({ config })

// Only fields that were never set (undefined) are written, e.g. a field added in a later phase.
// A field staff cleared on purpose is stored as null and stays as it is. This reads the stored
// document directly, because payload.findGlobal fills in default values for missing fields.
const stored: Record<string, unknown> =
  (await payload.db.findGlobal({ slug: 'site-settings' })) ?? {}
const missing = Object.fromEntries(
  Object.entries(siteSettings).filter(([key]) => stored[key] === undefined),
)
if (Object.keys(missing).length === 0) {
  payload.logger.info('Site settings already complete: left as they are.')
} else {
  await payload.updateGlobal({ slug: 'site-settings', data: missing, context })
  payload.logger.info(`Site settings filled in: ${Object.keys(missing).join(', ')}.`)
}

for (const branch of branches) {
  const { totalDocs } = await payload.count({
    collection: 'branches',
    where: { slug: { equals: branch.slug } },
  })
  if (totalDocs > 0) {
    payload.logger.info(`Branch "${branch.name}" exists: left as it is.`)
    continue
  }
  await payload.create({ collection: 'branches', data: branch, context })
  payload.logger.info(`Branch "${branch.name}" created.`)
}

process.exit(0)
