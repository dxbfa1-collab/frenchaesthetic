import { cookies, headers } from 'next/headers'

type Source = {
  code?: string
  page?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

/** Page, WEB code and the UTM cookie set by <TrackClicks />, saved with every form (brief §4). */
export async function readSource(values: Record<string, string>): Promise<Source> {
  let utm: Record<string, unknown> = {}
  try {
    utm = JSON.parse(decodeURIComponent((await cookies()).get('fa_utm')?.value ?? '%7B%7D'))
  } catch {
    // A malformed cookie is ignored.
  }
  const clip = (value: unknown, max: number) =>
    typeof value === 'string' && value ? value.slice(0, max) : undefined
  return {
    code: /^WEB-[A-Z0-9-]{1,30}$/.test(values.from ?? '') ? values.from : undefined,
    page: clip(values.page, 200),
    referrer: clip((await headers()).get('referer'), 300),
    utmSource: clip(utm.source, 100),
    utmMedium: clip(utm.medium, 100),
    utmCampaign: clip(utm.campaign, 150),
    utmContent: clip(utm.content, 150),
    utmTerm: clip(utm.term, 100),
  }
}
