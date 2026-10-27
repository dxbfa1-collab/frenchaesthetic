import Link from 'next/link'

import { FacebookIcon, InstagramIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import type { NavItem } from '@/lib/nav'

export function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <p className="label text-accent">{title}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-muted transition-colors hover:text-heading">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SocialLinks({
  instagram,
  facebook,
  name,
}: {
  instagram?: string | null
  facebook?: string | null
  name: string
}) {
  if (!instagram && !facebook) return null
  const linkClass =
    'inline-flex size-11 items-center justify-center rounded-full border border-hairline text-fg transition-colors hover:border-gold hover:text-gold'

  return (
    <ul className="mt-8 flex gap-3">
      {instagram && (
        <li>
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on Instagram`}
            className={linkClass}
          >
            <InstagramIcon />
          </a>
        </li>
      )}
      {facebook && (
        <li>
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on Facebook`}
            className={linkClass}
          >
            <FacebookIcon />
          </a>
        </li>
      )}
    </ul>
  )
}

/** Medical disclaimer (required site-wide), copyright and policy links. */
export function FooterBase({
  disclaimer,
  copyright,
  links,
}: {
  disclaimer: string
  copyright: string
  links: NavItem[]
}) {
  return (
    <div className="border-t border-hairline">
      <Container className="py-8 text-[0.9375rem] text-muted">
        <p className="max-w-4xl leading-relaxed">{disclaimer}</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {copyright}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-heading">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  )
}
