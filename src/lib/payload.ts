import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Branch } from '@/payload-types'

/** Site settings (numbers, emails, socials, legal text). Cached per request. */
export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings', depth: 0 })
})

/** Active and planned branches, in the order set in the CMS. */
export const getBranches = cache(async (): Promise<Branch[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'branches',
    depth: 0,
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
