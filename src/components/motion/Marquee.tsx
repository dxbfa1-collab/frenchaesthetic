import Link from 'next/link'

import { TopicIcon } from '@/components/ui/TopicIcon'

export type MarqueeItem = { label: string; href?: string; topic: string }

/**
 * A strip of treatments or courses that runs sideways (owner, 29 Oct 2026). It pauses on hover or
 * focus and stands still for visitors who prefer reduced motion. The list is drawn twice so the
 * loop has no gap; the copy is hidden from screen readers.
 */
export function Marquee({ items, label }: { items: MarqueeItem[]; label: string }) {
  if (items.length === 0) return null
  const row = (copy: boolean) => (
    <ul className="marquee-track" aria-hidden={copy || undefined}>
      {items.map((item) => {
        const content = (
          <>
            <TopicIcon topic={item.topic} size={18} className="text-accent" />
            {item.label}
          </>
        )
        return (
          <li key={item.label} className="shrink-0">
            {item.href ? (
              <Link href={item.href} tabIndex={copy ? -1 : undefined} className="marquee-chip">
                {content}
              </Link>
            ) : (
              <span className="marquee-chip">{content}</span>
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <nav aria-label={label} className="border-y border-hairline py-5">
      <div className="marquee">
        {row(false)}
        {row(true)}
      </div>
    </nav>
  )
}
