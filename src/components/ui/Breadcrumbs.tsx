import Link from 'next/link'

import { siteUrl } from '@/lib/site'

import { JsonLd } from './JsonLd'

export type Crumb = { label: string; href: string }

/** The path back up the site, with BreadcrumbList data. The last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-fg">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="transition-colors hover:text-heading">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            item: `${siteUrl}${item.href}`,
          })),
        }}
      />
    </nav>
  )
}
