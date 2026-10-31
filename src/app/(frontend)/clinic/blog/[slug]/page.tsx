import type { Metadata } from 'next'

import { articleMetadata, BlogArticle } from '@/components/blog/BlogArticle'

// The CDN keeps pages by this time, so a published or edited article shows within five minutes.
export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return articleMetadata('clinic', (await params).slug)
}

export default async function ClinicArticlePage({ params }: Props) {
  return <BlogArticle business="clinic" slug={(await params).slug} />
}
