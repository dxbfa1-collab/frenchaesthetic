import Image from 'next/image'
import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CLINIC_GALLERY } from '@/lib/images'

/** Real photos of the clinic (owner, 31 Oct 2026), with a link to the full gallery. */
export function InsideClinic() {
  return (
    <section className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div data-reveal="" className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Our clinic" title="A look" accent="inside." />
          <Link href="/gallery" className="link-arrow">
            See the gallery <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ul data-reveal="" className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CLINIC_GALLERY.slice(0, 4).map((photo) => (
            <li key={photo.src} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
                style={{ objectPosition: photo.position ?? 'center' }}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
