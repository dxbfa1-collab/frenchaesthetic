import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { formatLongDate } from '@/lib/dates'
import { publicImage } from '@/lib/media'
import { getPosts } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Articles on skin, treatments and aesthetics training from French Medical Aesthetics and French Aesthetics Academy.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  const posts = await getPosts()
  if (posts.length === 0) notFound()

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes on skin,"
        accent="care and training."
        intro={<p>Plain-language articles from our clinic and academy teams.</p>}
      />
      <section className="border-t border-hairline">
        <Container className="py-16 lg:py-24">
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const cover = publicImage(post.cover)
              const date = formatLongDate(post.publishedAt)
              return (
                <li key={post.id} className="group relative flex flex-col">
                  {cover && (
                    <div className="relative mb-6 aspect-[3/2] overflow-hidden">
                      <Image
                        src={cover.url!}
                        alt={cover.alt}
                        fill
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <p className="label text-muted">
                    {post.business === 'academy' ? 'Academy' : 'Clinic'}
                    {date && ` · ${date}`}
                  </p>
                  <h2 className="mt-3 text-[1.875rem] leading-tight">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && <p className="mt-3">{post.excerpt}</p>}
                </li>
              )
            })}
          </ul>
        </Container>
      </section>
    </>
  )
}
