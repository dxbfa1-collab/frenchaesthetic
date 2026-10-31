import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type {
  Batch,
  Branch,
  Concern,
  Course,
  Doctor,
  Faq,
  Media,
  Post,
  Result,
  Review,
  Treatment,
  TreatmentCategory,
} from '@/payload-types'

import { pktDateKey } from './batches'
import { relationId } from './relation'
import { isStaging } from './site'
import { TECHNOLOGIES, treatmentIsLive } from './treatments'

/*
  Public pages read with overrideAccess: false, so staff-only fields (alert emails, payment details,
  internal notes) never reach a page or its HTML. Server-only code uses getPrivateSettings(), and
  findTreatment() reads hidden treatments only to redirect, never to show them.
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

export const getPolicies = cache(async () =>
  (await client()).findGlobal({ slug: 'policies', depth: 0, overrideAccess: false }),
)

export const getBranches = cache(async (): Promise<Branch[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'branches',
    depth: 1,
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

/** Doctors and trainers whose details may be shown (a photo still needs its own consent). */
export const getPeople = cache(async (): Promise<Doctor[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'doctors',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
  })
  return docs.filter((d) => visible(d.status))
})

export async function getTrainers(): Promise<Doctor[]> {
  return (await getPeople()).filter((d) => d.isTrainer)
}

export async function getClinicDoctors(): Promise<Doctor[]> {
  return (await getPeople()).filter((d) => d.clinicTeam !== false)
}

const getFaqs = cache(async (business: 'clinic' | 'academy'): Promise<Faq[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'faqs',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
    where: { business: { equals: business } },
  })
  return docs.filter((f) => visible(f.status))
})

export const getAcademyFaqs = () => getFaqs('academy')

/** General clinic questions, plus questions about treatments that are shown. */
export async function getClinicFaqs(): Promise<Faq[]> {
  const [faqs, treatments] = await Promise.all([getFaqs('clinic'), getTreatments()])
  const shown = new Set(treatments.map((t) => t.id))
  return faqs.filter((f) => !f.treatment || shown.has(relationId(f.treatment) ?? ''))
}

// Clinic treatments

export type TreatmentView = Treatment & { category: TreatmentCategory }

const getAllTreatments = cache(async (): Promise<TreatmentView[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'treatments',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
  })
  return docs
    .filter((t): t is TreatmentView => typeof t.category === 'object' && t.category !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
})

/** Treatments that may be shown: live ones, plus (on staging only) the rest, with a marker. */
export const getTreatments = cache(async (): Promise<TreatmentView[]> =>
  (await getAllTreatments()).filter((t) => treatmentIsLive(t) || isStaging),
)

/** Any treatment with this slug, shown or not, so a hidden page can redirect to its category. */
export async function findTreatment(slug: string): Promise<TreatmentView | null> {
  const { docs } = await (
    await client()
  ).find({
    collection: 'treatments',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  const treatment = docs[0]
  return treatment && typeof treatment.category === 'object' && treatment.category
    ? (treatment as TreatmentView)
    : null
}

export const getTreatmentCategories = cache(async (): Promise<TreatmentCategory[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'treatment-categories',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
  })
  return docs
})

export type CategoryView = TreatmentCategory & { treatments: TreatmentView[] }

/** Categories with at least one treatment to show, each with its treatments. */
export async function getTreatmentMenu(): Promise<CategoryView[]> {
  const [categories, treatments] = await Promise.all([getTreatmentCategories(), getTreatments()])
  return categories
    .map((category) => ({
      ...category,
      treatments: treatments.filter((t) => t.category.id === category.id),
    }))
    .filter((category) => category.treatments.length > 0)
}

export const getConcerns = cache(async (): Promise<Concern[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'concerns',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: 'order',
  })
  return docs.filter((c) => visible(c.status))
})

/** Shown treatments that list this concern. */
export async function getTreatmentsFor(concern: Concern): Promise<TreatmentView[]> {
  return (await getTreatments()).filter((t) =>
    (t.concerns ?? []).some((c) => relationId(c) === concern.id),
  )
}

/** Before and afters with written consent and both photos, for treatments that are shown. */
export const getResults = cache(async (): Promise<Result[]> => {
  const [{ docs }, treatments] = await Promise.all([
    (await client()).find({
      collection: 'results',
      depth: 1,
      overrideAccess: false,
      pagination: false,
      where: { consentOnFile: { equals: true } },
    }),
    getTreatments(),
  ])
  const shown = new Set(treatments.map((t) => t.id))
  return docs.filter(
    (r) =>
      typeof r.before === 'object' &&
      typeof r.after === 'object' &&
      Boolean(r.before?.url && r.after?.url) &&
      shown.has(relationId(r.treatment) ?? ''),
  )
})

/** Reviews the person agreed to show. */
export const getReviews = cache(async (): Promise<Review[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'reviews',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    where: { consent: { equals: true } },
  })
  return docs
})

/** What the clinic menu may link to: a section with nothing to show stays out of the menu. */
export async function getClinicSections() {
  const [treatments, concerns, doctors] = await Promise.all([
    getTreatments(),
    getConcerns(),
    getClinicDoctors(),
  ])
  const shown = new Set(treatments.map((t) => t.slug))
  return {
    treatments: treatments.length > 0,
    concerns: concerns.length > 0 && treatments.length > 0,
    doctors: doctors.length > 0,
    technology: TECHNOLOGIES.some((tech) => tech.treatments.some((slug) => shown.has(slug))),
  }
}

export type ClinicSections = Awaited<ReturnType<typeof getClinicSections>>

/** Gallery photos with no identifiable person, or with written consent for everyone shown. */
export const getGallery = cache(async (): Promise<Media[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'media',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    where: {
      and: [
        { gallery: { in: ['clinic', 'academy'] } },
        { peopleConsent: { not_equals: 'missing' } },
      ],
    },
  })
  return docs.filter((m) => Boolean(m.url))
})

// Blog

export type PostBusiness = Post['business']

const POSTS_PER_PAGE = 12

const publishedPosts = (business: PostBusiness) => ({
  status: { equals: 'published' },
  business: { equals: business },
})

/** One page of a blog, newest first. */
export const getPostsPage = cache(async (business: PostBusiness, page: number) => {
  const { docs, totalPages } = await (
    await client()
  ).find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PER_PAGE,
    overrideAccess: false,
    page,
    sort: '-publishedAt',
    where: publishedPosts(business),
  })
  return { docs, totalPages }
})

export const getLatestPosts = cache(async (business: PostBusiness, limit: number) => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'posts',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: '-publishedAt',
    where: publishedPosts(business),
  })
  return docs
})

export const getPost = cache(async (business: PostBusiness, slug: string) => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: { ...publishedPosts(business), slug: { equals: slug } },
  })
  return docs[0] ?? null
})

export const getPosts = cache(async (): Promise<Post[]> => {
  const { docs } = await (
    await client()
  ).find({
    collection: 'posts',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    where: { status: { equals: 'published' } },
  })
  return docs
})
