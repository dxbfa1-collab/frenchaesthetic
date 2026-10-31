import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { formatLongDate } from '@/lib/dates'
import { publicImage } from '@/lib/media'
import { getPostsPage, type PostBusiness } from '@/lib/payload'
import { postHref } from '@/lib/posts'
import type { Post } from '@/payload-types'

const COPY = {
  clinic: {
    title: 'Skin & Treatment Blog',
    description:
      'Plain-language articles on skin, aesthetic treatments and what to expect, from French Medical Aesthetics in Lahore and Karachi.',
    heading: 'Skin and treatment',
    accent: 'advice.',
    intro: 'Plain-language articles on skin, treatments and what to expect.',
  },
  academy: {
    title: 'Aesthetics Training Blog',
    description:
      'Articles on aesthetics training and practice from French Aesthetics Academy in Lahore.',
    heading: 'Aesthetics training,',
    accent: 'explained.',
    intro: 'Articles on aesthetics training and practice.',
  },
} as const

/** The page number from the address; anything that is not a whole number above 1 means page 1. */
const pageNumber = (value?: string | string[]) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 1 ? page : 1
}

export async function blogMetadata(
  business: PostBusiness,
  pageParam?: string | string[],
): Promise<Metadata> {
  const page = pageNumber(pageParam)
  const { docs } = await getPostsPage(business, page)
  const { title, description } = COPY[business]
  const path = `/${business}/blog`
  return {
    title: page > 1 ? `${title}, page ${page}` : title,
    description,
    alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
    // An empty blog has nothing for search engines yet.
    ...(docs.length === 0 ? { robots: { index: false, follow: true } } : {}),
  }
}

export function PostCard({ post }: { post: Post }) {
  const cover = publicImage(post.cover)
  const date = formatLongDate(post.publishedAt)
  return (
    <li className="group lift relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface">
      {cover && (
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={cover.url!}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {date && <p className="label text-muted">{date}</p>}
        <h2 className="mt-3 text-[1.5rem] leading-tight">
          <Link href={postHref(post)} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-3">{post.excerpt}</p>}
        <span className="link-arrow mt-auto pt-5">
          Read article <ArrowRightIcon size={18} />
        </span>
      </div>
    </li>
  )
}

export async function BlogIndex({
  business,
  pageParam,
}: {
  business: PostBusiness
  pageParam?: string | string[]
}) {
  const page = pageNumber(pageParam)
  const { docs, totalPages } = await getPostsPage(business, page)
  if (docs.length === 0 && page > 1) notFound()
  const { heading, accent, intro } = COPY[business]
  const path = `/${business}/blog`

  return (
    <>
      <PageHero eyebrow="Blog" title={heading} accent={accent} intro={<p>{intro}</p>} />
      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          {docs.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ul>
          ) : (
            <p className="text-lg">Our first articles are on the way. Please check back soon.</p>
          )}

          {totalPages > 1 && (
            <nav aria-label="Blog pages" className="mt-14 flex items-center justify-between gap-6">
              {page > 1 ? (
                <Link href={page === 2 ? path : `${path}?page=${page - 1}`} className="link-arrow">
                  Newer articles
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={`${path}?page=${page + 1}`} className="link-arrow">
                  Older articles <ArrowRightIcon size={18} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </Container>
      </section>
    </>
  )
}
