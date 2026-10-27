/**
 * Loads the starting content. Safe to run more than once: it never overwrites what staff have
 * edited (settings fill only fields that were never set, branches only when their slug is new).
 *
 *   npm run seed
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { batches, courses, faqs, trainers } from './academy'
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

// Academy: trainers, then courses (which point at trainers), then FAQs and batches (which point at courses).
const idBySlug = async (collection: 'branches' | 'courses' | 'doctors', slug: string) =>
  (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 }))
    .docs[0]?.id

for (const trainer of trainers) {
  if (await idBySlug('doctors', trainer.slug)) continue
  await payload.create({ collection: 'doctors', data: trainer, context })
  payload.logger.info(`Trainer "${trainer.name}" created.`)
}

for (const { trainerSlugs, ...course } of courses) {
  if (await idBySlug('courses', course.slug)) continue
  const trainerIds = (
    await Promise.all(trainerSlugs.map((slug) => idBySlug('doctors', slug)))
  ).filter((id): id is string => Boolean(id))
  await payload.create({
    collection: 'courses',
    data: { ...course, trainers: trainerIds },
    context,
  })
  payload.logger.info(`Course "${course.name}" created.`)
}

let newFaqs = 0
for (const { courseSlug, ...faq } of faqs) {
  const { totalDocs } = await payload.count({
    collection: 'faqs',
    where: { question: { equals: faq.question } },
  })
  if (totalDocs > 0) continue
  const course = courseSlug ? await idBySlug('courses', courseSlug) : undefined
  await payload.create({ collection: 'faqs', data: { ...faq, course }, context })
  newFaqs++
}
payload.logger.info(`FAQs created: ${newFaqs}.`)

let newBatches = 0
for (const { courseSlug, campusSlug, ...batch } of batches) {
  const course = await idBySlug('courses', courseSlug)
  if (!course) continue
  const { totalDocs } = await payload.count({
    collection: 'batches',
    where: { and: [{ course: { equals: course } }, { startDate: { equals: batch.startDate } }] },
  })
  if (totalDocs > 0) continue
  const campus = campusSlug ? await idBySlug('branches', campusSlug) : undefined
  await payload.create({ collection: 'batches', data: { ...batch, course, campus }, context })
  newBatches++
}
payload.logger.info(`Batches created: ${newBatches}.`)

process.exit(0)
