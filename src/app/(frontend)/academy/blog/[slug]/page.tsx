import type { Metadata } from 'next'

import { articleMetadata, BlogArticle } from '@/components/blog/BlogArticle'

// The CDN keeps pages by this time, so a published or edited article shows within five minutes.
export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return articleMetadata('academy', (await params).slug)
}

export default async function AcademyArticlePage({ params }: Props) {
  return <BlogArticle business="academy" slug={(await params).slug} />
}
