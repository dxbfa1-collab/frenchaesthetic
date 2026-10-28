'use client'

import { useActionState } from 'react'

import { submitBooking } from '@/app/(frontend)/clinic/book/actions'
import { ErrorSummary, Field, SubmitButton } from '@/components/forms/FormParts'
import { GENDERS, HEARD_FROM, TIME_SLOTS } from '@/lib/bookingOptions'
import type { FormState } from '@/lib/forms'

export type BranchOption = { id: string; name: string; city: string; note: string | null }
export type InterestGroup = { label: string; options: { value: string; label: string }[] }

const initialState: FormState = { status: 'idle' }

/** Brief §5 booking fields: branch, treatment or concern, preferred date and slot, contact details. */
export function BookingForm({
  branches,
  interests,
  initialBranchId,
  initialInterest,
  minDate,
  maxDate,
}: {
  branches: BranchOption[]
  interests: InterestGroup[]
  initialBranchId?: string
  initialInterest?: string
  minDate: string
  maxDate: string
}) {
  const [state, formAction] = useActionState(submitBooking, initialState)
  const values = state.values ?? {}
  const errors = state.errors ?? {}
  const branchId = values.branch ?? initialBranchId

  return (
    <form key={state.nonce ?? 0} action={formAction} noValidate className="space-y-14">
      <ErrorSummary state={state} />
      <input type="hidden" name="page" value="/clinic/book" />
      {/* Honeypot for bots: hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="space-y-6">
        <legend className="label eyebrow">Step 1 · Branch and treatment</legend>
        <div>
          <p id="field-branch" className="font-bold text-heading">
            Branch
          </p>
          <div
            role="radiogroup"
            aria-labelledby="field-branch"
            aria-describedby={errors.branch ? 'field-branch-error' : undefined}
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            {branches.map((branch) => (
              <label
                key={branch.id}
                className="flex cursor-pointer flex-col gap-1 rounded-[6px] border border-hairline bg-surface p-5 transition-colors has-checked:border-gold has-checked:ring-1 has-checked:ring-gold"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="branch"
                    value={branch.id}
                    defaultChecked={branchId === branch.id}
                    className="size-4 accent-gold"
                  />
                  <span className="font-extrabold text-heading">{branch.name}</span>
                </span>
                <span className="pl-7 text-sm text-muted">
                  {branch.city}
                  {branch.note && ` · ${branch.note}`}
                </span>
              </label>
            ))}
          </div>
          {errors.branch && (
            <p id="field-branch-error" className="mt-2 text-sm font-bold text-heading">
              Error: {errors.branch}
            </p>
          )}
        </div>

        <Field
          name="interest"
          label="What would you like help with?"
          hint="Not sure? Choose “Not sure yet” and tell us in the notes."
          error={errors.interest}
        >
          {(props) => (
            <select
              {...props}
              name="interest"
              defaultValue={values.interest ?? initialInterest ?? ''}
              className="field-input"
            >
              <option value="">Not sure yet: I would like advice</option>
              {interests.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            name="preferredDate"
            label="Preferred date (optional)"
            hint="We confirm the exact time with you."
            error={errors.preferredDate}
          >
            {(props) => (
              <input
                {...props}
                name="preferredDate"
                type="date"
                min={minDate}
                max={maxDate}
                defaultValue={values.preferredDate}
                className="field-input"
              />
            )}
          </Field>
          <Field name="timeSlot" label="Time of day" error={errors.timeSlot}>
            {(props) => (
              <select
                {...props}
                name="timeSlot"
                defaultValue={values.timeSlot ?? 'any'}
                className="field-input"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="label eyebrow">Step 2 · Your details</legend>
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
          <Field
            name="phone"
            label="WhatsApp number"
            hint="The branch confirms your slot here."
            error={errors.phone}
          >
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
        <div className="grid gap-6 sm:grid-cols-3">
          <Field name="gender" label="Gender (optional)" error={errors.gender}>
            {(props) => (
              <select
                {...props}
                name="gender"
                defaultValue={values.gender ?? ''}
                className="field-input"
              >
                <option value="">Choose</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field name="age" label="Age (optional)" error={errors.age}>
            {(props) => (
              <input
                {...props}
                name="age"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                defaultValue={values.age}
                className="field-input"
              />
            )}
          </Field>
          <Field name="heardFrom" label="How did you hear about us?" error={errors.heardFrom}>
            {(props) => (
              <select
                {...props}
                name="heardFrom"
                defaultValue={values.heardFrom ?? ''}
                className="field-input"
              >
                <option value="">Choose</option>
                {HEARD_FROM.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <Field
          name="notes"
          label="Notes (optional)"
          hint="Anything your doctor should know, or questions you have."
          error={errors.notes}
        >
          {(props) => (
            <textarea
              {...props}
              name="notes"
              rows={4}
              maxLength={1000}
              defaultValue={values.notes}
              className="field-input min-h-32"
            />
          )}
        </Field>
      </fieldset>

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
            <span>
              I agree that French Medical Aesthetics may contact me on WhatsApp about this booking.
            </span>
          </label>
          {errors.consent && (
            <p id="field-consent-error" className="mt-2 text-sm font-bold text-heading">
              Error: {errors.consent}
            </p>
          )}
        </div>
        <SubmitButton label="Send booking request" />
      </div>
    </form>
  )
}
