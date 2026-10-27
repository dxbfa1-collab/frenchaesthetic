/**
 * Loads the starting content. Safe to run more than once: it never overwrites what staff have
 * edited (settings are written only while the UAN is empty, branches only when their slug is new).
 *
 *   npm run seed
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { branches, siteSettings } from './data'

const context = { disableRevalidate: true }
const payload = await getPayload({ config })

const current = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
if (current.clinicPhone) {
  payload.logger.info('Site settings already filled in: left as they are.')
} else {
  await payload.updateGlobal({ slug: 'site-settings', data: siteSettings, context })
  payload.logger.info('Site settings written.')
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
