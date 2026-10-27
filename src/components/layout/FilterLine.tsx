import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'

/** Bottom of every academy page (FAA brief §3): this is training, not treatment booking. */
export function FilterLine({ text }: { text: string }) {
  return (
    <aside aria-label="Who this academy is for" className="tone-inverse border-t border-hairline">
      <Container className="flex flex-col items-start gap-4 py-7 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl font-semibold text-heading">{text}</p>
        <Link href="/clinic" className="link-arrow shrink-0">
          Clinic website <ArrowRightIcon size={18} />
        </Link>
      </Container>
    </aside>
  )
}
