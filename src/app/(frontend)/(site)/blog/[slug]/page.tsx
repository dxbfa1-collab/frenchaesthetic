import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { JsonLd } from '@/components/ui/JsonLd'
import { credentials } from '@/components/ui/Portrait'
import { formatLongDate } from '@/lib/dates'
import { publicImage } from '@/lib/media'
import { getPosts } from '@/lib/payload'
import { siteUrl } from '@/lib/site'
import type { Doctor } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }))
}

async function findPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost((await params).slug)
  if (!post) return {}
  const cover = publicImage(post.cover)
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      images: cover ? [{ url: cover.url!, alt: cover.alt }] : ['/og/site.png'],
    },
  }
}

const person = (value: unknown): Doctor | null =>
  value && typeof value === 'object' && 'name' in value ? (value as Doctor) : null

export default async function PostPage({ params }: Props) {
  const post = await findPost((await params).slug)
  if (!post) notFound()
  const cover = publicImage(post.cover)
  const date = formatLongDate(post.publishedAt)
  const author = person(post.author)
  const reviewer = person(post.reviewedBy)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${siteUrl}/blog/${post.slug}`,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(author ? { author: { '@type': 'Person', name: author.name } } : {}),
    ...(reviewer ? { reviewedBy: { '@type': 'Person', name: reviewer.name } } : {}),
    publisher: {
      '@type': 'Organization',
      name: post.business === 'academy' ? 'French Aesthetics Academy' : 'French Medical Aesthetics',
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <article>
        <Container className="pb-16 pt-14 sm:pt-20 lg:pb-20 lg:pt-24">
          <div className="max-w-3xl">
            <p className="label eyebrow rise">
              {post.business === 'academy' ? 'Academy' : 'Clinic'}
              {date && ` · ${date}`}
            </p>
            <h1 className="rise rise-2 mt-6 text-[2.5rem] sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && <p className="rise rise-3 mt-7 text-xl">{post.excerpt}</p>}
            {(author || reviewer) && (
              <p className="rise rise-3 mt-8 text-sm text-muted">
                {author && (
                  <>
                    By {author.name}
                    {credentials(author) && `, ${credentials(author)}`}
                  </>
                )}
                {author && reviewer && ' · '}
                {reviewer && <>Medically reviewed by {reviewer.name}</>}
              </p>
            )}
          </div>
        </Container>
        {cover && (
          <Container className="pb-14">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={cover.url!}
                alt={cover.alt}
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        )}
        <Container className="pb-20 lg:pb-28">
          <div className="rich-text max-w-3xl">
            <RichText data={post.body} />
          </div>
          <Link href="/blog" className="link-arrow mt-14">
            All articles <ArrowRightIcon size={18} />
          </Link>
        </Container>
      </article>
    </>
  )
}
