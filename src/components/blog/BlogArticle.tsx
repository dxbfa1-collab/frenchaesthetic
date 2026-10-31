import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon, WhatsAppIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { JsonLd } from '@/components/ui/JsonLd'
import { credentials } from '@/components/ui/Portrait'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { formatLongDate } from '@/lib/dates'
import { publicImage } from '@/lib/media'
import { getLatestPosts, getPost, getSiteSettings, type PostBusiness } from '@/lib/payload'
import { postHref } from '@/lib/posts'
import { siteUrl } from '@/lib/site'
import { academyMessages, clinicMessages } from '@/lib/whatsapp'
import type { Doctor } from '@/payload-types'

import { PostCard } from './BlogIndex'

const NAMES = {
  clinic: 'French Medical Aesthetics',
  academy: 'French Aesthetics Academy',
} as const

const person = (value: unknown): Doctor | null =>
  value && typeof value === 'object' && 'name' in value ? (value as Doctor) : null

export async function articleMetadata(business: PostBusiness, slug: string): Promise<Metadata> {
  const post = await getPost(business, slug)
  if (!post) return {}
  const cover = publicImage(post.cover)
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    alternates: { canonical: postHref(post) },
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      ...(cover ? { images: [{ url: cover.url!, alt: cover.alt }] } : {}),
    },
  }
}

export async function BlogArticle({ business, slug }: { business: PostBusiness; slug: string }) {
  const post = await getPost(business, slug)
  if (!post) notFound()
  const [settings, latest] = await Promise.all([getSiteSettings(), getLatestPosts(business, 4)])
  const more = latest.filter((p) => p.id !== post.id).slice(0, 3)
  const cover = publicImage(post.cover)
  const date = formatLongDate(post.publishedAt)
  const author = person(post.author)
  const reviewer = person(post.reviewedBy)
  const academy = business === 'academy'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${siteUrl}${postHref(post)}`,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(cover?.url
      ? { image: cover.url.startsWith('/') ? `${siteUrl}${cover.url}` : cover.url }
      : {}),
    ...(author ? { author: { '@type': 'Person', name: author.name } } : {}),
    ...(reviewer ? { reviewedBy: { '@type': 'Person', name: reviewer.name } } : {}),
    publisher: { '@type': 'Organization', name: NAMES[business] },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <article>
        <Container className="pb-12 pt-14 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-3xl">
            <p className="label eyebrow rise">
              Blog
              {date && ` · ${date}`}
            </p>
            <h1 className="rise rise-2 mt-6 text-[2.25rem] sm:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="rise rise-3 mt-6 text-xl">{post.excerpt}</p>}
            {(author || reviewer) && (
              <p className="rise rise-3 mt-6 text-muted">
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
          <Container className="pb-12">
            <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl">
              <Image
                src={cover.url!}
                alt={cover.alt}
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        )}
        <Container className="pb-16 lg:pb-20">
          <div className="rich-text mx-auto max-w-3xl">
            <RichText data={post.body} />
            <p className="mt-10">
              <Link href={`/${business}/blog`} className="link-arrow">
                All articles <ArrowRightIcon size={18} />
              </Link>
            </p>
          </div>
        </Container>
      </article>

      {more.length > 0 && (
        <section className="border-t border-hairline">
          <Container className="py-16 lg:py-20">
            <h2 className="text-[2rem]">More articles</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CtaBand
        title={academy ? 'Want to learn' : 'Have a question'}
        accent={academy ? 'with us?' : 'about your skin?'}
        intro={
          academy
            ? 'Admissions answer on WhatsApp.'
            : 'Your doctor confirms what suits you at an in-person consultation.'
        }
      >
        <WhatsAppLink
          number={
            academy ? settings.admissionsWhatsApp : settings.clinicWhatsApp || settings.clinicPhone
          }
          message={academy ? academyMessages.page('BLOG') : clinicMessages.consultation()}
          side={business}
          label="blog-closing"
          className={buttonClass('primary', { size: 'lg' })}
        >
          <WhatsAppIcon size={20} />
          Chat on WhatsApp
        </WhatsAppLink>
      </CtaBand>
    </>
  )
}
