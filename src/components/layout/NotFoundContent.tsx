import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { isStaging } from '@/lib/site'

type Action = { href: string; label: string }

export function NotFoundContent({ primary, secondary }: { primary: Action; secondary?: Action }) {
  return (
    <section>
      <Container className="py-24 lg:py-32">
        <p className="label eyebrow">Page not found</p>
        <h1 className="mt-6 max-w-3xl text-[2.875rem] sm:text-6xl">
          This page
          <span className="block italic text-accent">is not here.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg">The link may be old or mistyped.</p>
        {isStaging && (
          <p className="mt-6 max-w-xl border-l-2 border-gold pl-4 text-[0.9375rem] text-muted">
            Staging note: treatment, doctor, branch, course and batch pages are built in the next
            phases.
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href={primary.href} size="lg">
            {primary.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="outline" size="lg">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  )
}
