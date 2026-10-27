'use client'

import { useActionState, useState } from 'react'

import { type FormState, submitEnrollment } from '@/app/(frontend)/academy/enroll/actions'

import { ErrorSummary, Field, SubmitButton } from './FormParts'

export type CourseOption = {
  id: string
  shortName: string
  label: string
  requiresPMDC: boolean
  audience: string[]
}

export type BatchOption = { id: string; courseId: string; label: string }

const initialState: FormState = { status: 'idle' }

/**
 * Brief §6 steps 1–3: course and batch, then details, then (invasive only) PMDC number and
 * documents. Step 4, payment, follows on a private link once admissions verify the application.
 */
export function EnrollForm({
  courses,
  batches,
  initialCourseId,
  initialBatchId,
  from,
}: {
  courses: CourseOption[]
  batches: BatchOption[]
  initialCourseId?: string
  initialBatchId?: string
  from: string
}) {
  const [state, formAction] = useActionState(submitEnrollment, initialState)
  const values = state.values ?? {}
  const errors = state.errors ?? {}
  const [courseId, setCourseId] = useState(values.course || initialCourseId || courses[0]?.id)

  const course = courses.find((c) => c.id === courseId)
  const courseBatches = batches.filter((b) => b.courseId === courseId)
  const batchDefault =
    [values.batch, initialBatchId].find((id) => courseBatches.some((b) => b.id === id)) ??
    courseBatches[0]?.id

  return (
    <form key={state.nonce ?? 0} action={formAction} noValidate className="space-y-14">
      <ErrorSummary state={state} />
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="page" value="/academy/enroll" />
      {/* Honeypot for bots: hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="space-y-6">
        <legend className="label eyebrow">Step 1 · Course and batch</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer flex-col gap-1.5 rounded-[6px] border border-hairline bg-surface p-5 transition-colors has-checked:border-gold has-checked:ring-1 has-checked:ring-gold"
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="course"
                  value={c.id}
                  checked={courseId === c.id}
                  onChange={() => setCourseId(c.id)}
                  className="size-4 accent-gold"
                />
                <span className="font-extrabold text-heading">{c.shortName} Course</span>
              </span>
              <span className="pl-7 text-sm text-muted">{c.label}</span>
            </label>
          ))}
        </div>
        {courseBatches.length > 0 ? (
          <Field name="batch" label="Batch" error={errors.batch}>
            {(props) => (
              <select
                {...props}
                key={courseId}
                name="batch"
                defaultValue={batchDefault}
                className="field-input"
              >
                {courseBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : (
          <p className="border-l-2 border-gold pl-4">
            No open batch is listed for this course yet. Message admissions on WhatsApp for the next
            date.
          </p>
        )}
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
            hint="Admissions contact you here."
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
        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="city" label="City" error={errors.city}>
            {(props) => (
              <input
                {...props}
                name="city"
                autoComplete="address-level2"
                defaultValue={values.city}
                className="field-input"
              />
            )}
          </Field>
          <Field
            name="profession"
            label="Profession"
            hint="Choose from the list or type your own."
            error={errors.profession}
          >
            {(props) => (
              <>
                <input
                  {...props}
                  name="profession"
                  list="profession-options"
                  defaultValue={values.profession}
                  className="field-input"
                />
                <datalist id="profession-options">
                  {(course?.audience ?? []).map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
        </div>
      </fieldset>

      {course?.requiresPMDC && (
        <fieldset className="space-y-6">
          <legend className="label eyebrow">Step 3 · PMDC registration</legend>
          <p>
            The invasive course is only for MBBS and BDS doctors, so admissions check your PMDC
            registration first.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field name="pmdcNumber" label="PMDC registration number" error={errors.pmdcNumber}>
              {(props) => (
                <input
                  {...props}
                  name="pmdcNumber"
                  defaultValue={values.pmdcNumber}
                  className="field-input"
                />
              )}
            </Field>
            <Field name="houseJob" label="House job" error={errors.houseJob}>
              {(props) => (
                <select
                  {...props}
                  name="houseJob"
                  defaultValue={values.houseJob ?? ''}
                  className="field-input"
                >
                  <option value="">Choose</option>
                  <option value="completed">Completed</option>
                  <option value="inProgress">In progress</option>
                  <option value="notStarted">Not started</option>
                </select>
              )}
            </Field>
          </div>
          <Field
            name="documents"
            label="PMDC certificate or degree"
            hint={
              state.status === 'error'
                ? 'Choose your file again before sending. PDF, JPG, PNG or WebP, up to 5 MB each, 2 files at most.'
                : 'PDF, JPG, PNG or WebP, up to 5 MB each, 2 files at most. Kept private: only admissions can see it.'
            }
            error={errors.documents}
          >
            {(props) => (
              <input
                {...props}
                name="documents"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="field-input file:mr-4 file:rounded-[6px] file:border-0 file:bg-gold file:px-4 file:py-2 file:font-bold file:text-charcoal"
              />
            )}
          </Field>
        </fieldset>
      )}

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
              I agree that French Aesthetics Academy may contact me on WhatsApp about this
              application.
            </span>
          </label>
          {errors.consent && (
            <p id="field-consent-error" className="mt-2 text-sm font-bold text-heading">
              Error: {errors.consent}
            </p>
          )}
        </div>
        <SubmitButton label="Send application" disabled={courseBatches.length === 0} />
      </div>
    </form>
  )
}
