import type { Metadata } from 'next'

import { BlogIndex, blogMetadata } from '@/components/blog/BlogIndex'

type Props = { searchParams: Promise<{ page?: string | string[] }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return blogMetadata('academy', (await searchParams).page)
}

export default async function AcademyBlogPage({ searchParams }: Props) {
  return <BlogIndex business="academy" pageParam={(await searchParams).page} />
}
