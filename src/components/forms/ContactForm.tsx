'use client'

import { useActionState } from 'react'

import { submitMessage } from '@/app/(frontend)/(site)/contact/actions'
import { TrackLead } from '@/components/analytics/TrackLead'
import type { FormState } from '@/lib/forms'

import { ErrorSummary, Field, SubmitButton } from './FormParts'

const initialState: FormState = { status: 'idle' }

/** The shared contact form: a patient's message goes to the clinic, a student's to admissions. */
export function ContactForm({
  clinicWhatsApp,
  admissionsWhatsApp,
}: {
  clinicWhatsApp: string
  admissionsWhatsApp: string
}) {
  const [state, formAction] = useActionState(submitMessage, initialState)
  const values = state.values ?? {}
  const errors = state.errors ?? {}

  if (state.status === 'success') {
    const student = values.iAm === 'student'
    return (
      <div
        role="status"
        className="tone-dark rounded-[6px] border-[1.5px] border-gold bg-deep-charcoal p-7 sm:p-9"
      >
        <TrackLead side={student ? 'academy' : 'clinic'} label="contact" />
        <p className="font-display text-[2rem] leading-tight text-heading">Thank you.</p>
        <p className="mt-4 text-lg">
          Your message is with {student ? 'admissions' : 'our clinic team'}. We reply on WhatsApp
          {student ? ` from ${admissionsWhatsApp}` : ` from ${clinicWhatsApp}`}.
        </p>
      </div>
    )
  }

  return (
    <form key={state.nonce ?? 0} action={formAction} noValidate className="space-y-8">
      <ErrorSummary state={state} />
      <input type="hidden" name="page" value="/contact" />
      {/* Honeypot for bots: hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend id="field-iAm" className="font-bold text-heading">
          I am
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { value: 'patient', label: 'A patient', hint: 'Treatments at the clinic' },
            { value: 'student', label: 'A doctor or student', hint: 'Courses at the academy' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col gap-1 rounded-[6px] border border-hairline bg-surface p-5 transition-colors has-checked:border-gold has-checked:ring-1 has-checked:ring-gold"
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="iAm"
                  value={option.value}
                  defaultChecked={values.iAm === option.value}
                  aria-describedby={errors.iAm ? 'field-iAm-error' : undefined}
                  className="size-4 accent-gold"
                />
                <span className="font-extrabold text-heading">{option.label}</span>
              </span>
              <span className="pl-7 text-sm text-muted">{option.hint}</span>
            </label>
          ))}
        </div>
        {errors.iAm && (
          <p id="field-iAm-error" className="mt-2 text-sm font-bold text-heading">
            Error: {errors.iAm}
          </p>
        )}
      </fieldset>

      <Field name="name" label="Full name" error={errors.name}>
        {(props) => (
          <input
            {...props}
            name="name"
            autoComplete="name"
            defaultValue={values.name}
            className="field-input"
          />
        )}
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="phone" label="WhatsApp number" hint="We reply here." error={errors.phone}>
          {(props) => (
            <input
              {...props}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
              defaultValue={values.phone}
              className="field-input"
            />
          )}
        </Field>
        <Field name="email" label="Email (optional)" error={errors.email}>
          {(props) => (
            <input
              {...props}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={values.email}
              className="field-input"
            />
          )}
        </Field>
      </div>
      <Field name="interest" label="Treatment or course (optional)" error={errors.interest}>
        {(props) => (
          <input
            {...props}
            name="interest"
            maxLength={120}
            defaultValue={values.interest}
            className="field-input"
          />
        )}
      </Field>
      <Field name="message" label="Message" error={errors.message}>
        {(props) => (
          <textarea
            {...props}
            name="message"
            rows={5}
            maxLength={2000}
            defaultValue={values.message}
            className="field-input min-h-36"
          />
        )}
      </Field>

      <div className="space-y-6 border-t border-hairline pt-8">
        <div>
          <label htmlFor="field-consent" className="flex cursor-pointer items-start gap-3">
            <input
              id="field-consent"
              type="checkbox"
              name="consent"
              defaultChecked={values.consent === 'on'}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'field-consent-error' : undefined}
              className="mt-1 size-5 shrink-0 accent-gold"
            />
            <span>I agree to be contacted on WhatsApp about my message.</span>
          </label>
          {errors.consent && (
            <p id="field-consent-error" className="mt-2 text-sm font-bold text-heading">
              Error: {errors.consent}
            </p>
          )}
        </div>
        <SubmitButton label="Send message" />
      </div>
    </form>
  )
}
