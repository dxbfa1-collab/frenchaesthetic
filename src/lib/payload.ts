import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Batch, Branch, Course, Doctor, Faq } from '@/payload-types'

import { pktDateKey } from './batches'
import { isStaging } from './site'

/*
  Public pages read with overrideAccess: false, so staff-only fields (alert emails, payment details,
  internal notes) never reach a page or its HTML. Server-only code uses getPrivateSettings().
*/

const client = () => getPayload({ config })

/** On staging an unconfirmed fact shows with a marker; on the live site it is left out. */
export const visible = (status?: string | null): boolean => status === 'confirmed' || isStaging

export const getSiteSettings = cache(async () =>
  (await client()).findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false }),
)

/** Includes staff-only settings. Never pass the result to a client component. */
export const getPrivateSettings = cache(async () =>
  (await client()).findGlobal({ slug: 'site-settings', depth: 0 }),
)

export const getBranches = cache(async (): Promise<Branch[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'branches',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
  })
  return docs
})

export async function getClinicBranches(): Promise<Branch[]> {
  return (await getBranches()).filter((b) => b.business !== 'academy' && b.status === 'active')
}

export async function getAcademyCampuses(): Promise<Branch[]> {
  return (await getBranches()).filter((b) => b.business !== 'clinic' && b.status === 'active')
}

export const getCourses = cache(async (): Promise<Course[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'courses',
    depth: 2,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
  })
  return docs
})

export async function getCourse(slug: string): Promise<Course | null> {
  return (await getCourses()).find((c) => c.slug === slug) ?? null
}

export type BatchView = Batch & { course: Course; campus?: Branch | null }

/** Open or full batches from today on, in date order. */
export const getUpcomingBatches = cache(async (): Promise<BatchView[]> => {
  const today = pktDateKey(new Date())
  const { docs } = await (
    await client()
  ).find({
    collection: 'batches',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: 'startDate',
    where: { status: { in: ['open', 'full'] } },
  })
  return docs.filter(
    (b): b is BatchView =>
      typeof b.course === 'object' &&
      b.course !== null &&
      pktDateKey(b.startDate) >= today &&
      visible(b.factStatus),
  )
})

export const getTrainers = cache(async (): Promise<Doctor[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'doctors',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
    where: { isTrainer: { equals: true } },
  })
  return docs.filter((d) => visible(d.status))
})

export const getAcademyFaqs = cache(async (): Promise<Faq[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'faqs',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
    where: { business: { equals: 'academy' } },
  })
  return docs.filter((f) => visible(f.status))
})
