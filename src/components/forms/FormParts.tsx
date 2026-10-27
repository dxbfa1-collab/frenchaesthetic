'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'

import type { FormState } from '@/lib/forms'
import { buttonClass } from '@/components/ui/Button'

type ControlProps = { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }

/** Label, hint and error wired to the control for screen readers. Errors say "Error:", not just a colour. */
export function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string
  label: string
  hint?: string
  error?: string
  children: (props: ControlProps) => ReactNode
}) {
  const id = `field-${name}`
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="block font-bold text-heading">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-bold text-heading">
          Error: {error}
        </p>
      )}
    </div>
  )
}

/** Shown at the top after a failed submit, with links to each field. Receives focus. */
export function ErrorSummary({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (state.status === 'error') ref.current?.focus()
  }, [state])

  if (state.status !== 'error') return null
  const errors = Object.entries(state.errors ?? {})
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="tone-dark rounded-[6px] border-[1.5px] border-gold bg-deep-charcoal p-6"
    >
      <p className="font-extrabold text-heading">{state.message ?? 'Please check these fields:'}</p>
      {errors.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {errors.map(([name, message]) => (
            <li key={name}>
              <a href={`#field-${name}`} className="underline underline-offset-4">
                {message}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={buttonClass('primary', {
        size: 'lg',
        className: 'w-full disabled:opacity-60 sm:w-auto',
      })}
    >
      {pending ? 'Sending…' : label}
    </button>
  )
}
