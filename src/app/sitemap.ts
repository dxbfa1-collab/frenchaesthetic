import type { MetadataRoute } from 'next'

import { POLICIES } from '@/globals/Policies'
import {
  getClinicBranches,
  getClinicDoctors,
  getClinicSections,
  getConcerns,
  getCourses,
  getGallery,
  getPolicies,
  getPosts,
  getResults,
  getTreatmentMenu,
} from '@/lib/payload'
import { postHref } from '@/lib/posts'
import { siteUrl } from '@/lib/site'
import { treatmentHref } from '@/lib/treatments'

// Lists only pages that are shown: on the live site, unconfirmed or unsigned pages stay out.
export const revalidate = 3600

const STATIC_PAGES = [
  '/',
  '/about',
  '/contact',
  '/clinic',
  '/clinic/branches',
  '/clinic/faq',
  '/clinic/book',
  '/academy',
  '/academy/courses',
  '/academy/batches',
  '/academy/internship',
  '/academy/faculty',
  '/academy/about',
  '/academy/contact',
  '/academy/faq',
  '/academy/enroll',
  '/policies/medical-disclaimer',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [menu, sections, concerns, doctors, branches, results, courses, posts, gallery, policies] =
    await Promise.all([
      getTreatmentMenu(),
      getClinicSections(),
      getConcerns(),
      getClinicDoctors(),
      getClinicBranches(),
      getResults(),
      getCourses(),
      getPosts(),
      getGallery(),
      getPolicies(),
    ])

  const entry = (path: string, lastModified?: string | null) => ({
    url: `${siteUrl}${path}`,
    ...(lastModified ? { lastModified } : {}),
  })

  return [
    ...STATIC_PAGES.map((path) => entry(path)),
    ...(menu.length > 0 ? [entry('/clinic/treatments')] : []),
    ...menu.flatMap((category) => [
      entry(`/clinic/treatments/${category.slug}`, category.updatedAt),
      ...category.treatments.map((t) => entry(treatmentHref(t), t.updatedAt)),
    ]),
    ...(sections.technology ? [entry('/clinic/technology')] : []),
    ...(sections.concerns
      ? [
          entry('/clinic/concerns'),
          ...concerns.map((c) => entry(`/clinic/concerns/${c.slug}`, c.updatedAt)),
        ]
      : []),
    ...(doctors.length > 0
      ? [
          entry('/clinic/doctors'),
          ...doctors.map((d) => entry(`/clinic/doctors/${d.slug}`, d.updatedAt)),
        ]
      : []),
    ...branches.map((b) => entry(`/clinic/branches/${b.slug}`, b.updatedAt)),
    ...(results.length > 0 ? [entry('/clinic/results')] : []),
    ...courses.map((c) => entry(`/academy/${c.slug}`, c.updatedAt)),
    ...(['clinic', 'academy'] as const).flatMap((business) => {
      const own = posts.filter((p) => p.business === business)
      return own.length > 0
        ? [entry(`/${business}/blog`), ...own.map((p) => entry(postHref(p), p.updatedAt))]
        : []
    }),
    ...(gallery.length > 0 ? [entry('/gallery')] : []),
    ...POLICIES.filter((p) => policies[`${p.key}Status`] === 'confirmed').map((p) =>
      entry(`/policies/${p.key}`),
    ),
  ]
}
