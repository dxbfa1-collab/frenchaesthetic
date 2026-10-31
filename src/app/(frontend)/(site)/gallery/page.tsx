import type { Metadata } from 'next'
import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CLINIC_GALLERY } from '@/lib/images'
import { getGallery } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Real photos inside French Medical Aesthetics: the lounge, reception and treatment corridor.',
  alternates: { canonical: '/gallery' },
}

const SECTIONS = [
  { key: 'clinic', title: 'French Medical', accent: 'Aesthetics' },
  { key: 'academy', title: 'French Aesthetics', accent: 'Academy' },
] as const

/** Real photos only, each with consent from every identifiable person (brief §3). */
export default async function GalleryPage() {
  const uploaded = await getGallery()
  const photos = [
    ...CLINIC_GALLERY.map(({ src, alt, position }) => ({ src, alt, position, gallery: 'clinic' })),
    ...uploaded.map((m) => ({
      src: m.url!,
      alt: m.alt,
      position: m.focalX != null && m.focalY != null ? `${m.focalX}% ${m.focalY}%` : undefined,
      gallery: m.gallery,
    })),
  ]

  return (
    <>
      <PageHero eyebrow="Gallery" title="Inside" accent="our spaces." />
      {SECTIONS.map(({ key, title, accent }) => {
        const items = photos.filter((p) => p.gallery === key)
        if (items.length === 0) return null
        return (
          <section key={key} className="border-t border-hairline">
            <Container className="py-16 lg:py-24">
              <SectionHeading title={title} accent={accent} />
              <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((photo) => (
                  <li key={photo.src} className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: photo.position ?? 'center' }}
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )
      })}
    </>
  )
}
