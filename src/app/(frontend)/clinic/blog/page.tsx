import type { Metadata } from 'next'

import { BlogIndex, blogMetadata } from '@/components/blog/BlogIndex'

type Props = { searchParams: Promise<{ page?: string | string[] }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return blogMetadata('clinic', (await searchParams).page)
}

export default async function ClinicBlogPage({ searchParams }: Props) {
  return <BlogIndex business="clinic" pageParam={(await searchParams).page} />
}
