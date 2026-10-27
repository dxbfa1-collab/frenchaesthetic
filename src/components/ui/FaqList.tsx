import { PlusIcon } from '@/components/icons'
import type { Faq } from '@/payload-types'

import { Pending } from './Pending'

type FaqItem = Pick<Faq, 'id' | 'question' | 'answer' | 'status'>

/** Accordion built on <details>, so it works without JavaScript. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {items.map((faq) => (
        <details key={faq.id} className="faq group">
          <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-lg font-bold text-heading">
            <span>
              <Pending confirmed={faq.status === 'confirmed'}>{faq.question}</Pending>
            </span>
            <PlusIcon
              size={22}
              className="mt-1 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <p className="max-w-3xl pb-6">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}

/** FAQPage structured data, confirmed answers only. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
      .filter((f) => f.status === 'confirmed')
      .map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
  }
}
