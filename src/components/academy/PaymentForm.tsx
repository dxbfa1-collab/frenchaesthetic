'use client'

import { useActionState } from 'react'

import { type FormState, submitPaymentProof } from '@/app/(frontend)/academy/enroll/actions'

import { ErrorSummary, Field, SubmitButton } from './FormParts'

const initialState: FormState = { status: 'idle' }

/** Brief §6 step 6: the verified student uploads the payment proof; admissions then mark it paid. */
export function PaymentForm({ reference, paymentKey }: { reference: string; paymentKey: string }) {
  const [state, formAction] = useActionState(submitPaymentProof, initialState)
  const values = state.values ?? {}
  const errors = state.errors ?? {}

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="tone-dark rounded-[6px] border-[1.5px] border-gold bg-deep-charcoal p-7"
      >
        <p className="text-xl font-extrabold text-heading">Payment proof received.</p>
        <p className="mt-2">Admissions will check it and confirm your seat on WhatsApp.</p>
      </div>
    )
  }

  return (
    <form key={state.nonce ?? 0} action={formAction} noValidate className="space-y-8">
      <ErrorSummary state={state} />
      <input type="hidden" name="ref" value={reference} />
      <input type="hidden" name="key" value={paymentKey} />
      <Field name="method" label="How did you pay?" error={errors.method}>
        {(props) => (
          <select
            {...props}
            name="method"
            defaultValue={values.method ?? ''}
            className="field-input"
          >
            <option value="">Choose</option>
            <option value="bankTransfer">Bank transfer</option>
            <option value="jazzCash">JazzCash</option>
            <option value="easypaisa">Easypaisa</option>
            <option value="other">Other</option>
          </select>
        )}
      </Field>
      <Field
        name="proof"
        label="Payment screenshot or receipt"
        hint="PDF, JPG, PNG or WebP, up to 5 MB each, 2 files at most. Kept private: only admissions can see it."
        error={errors.proof}
      >
        {(props) => (
          <input
            {...props}
            name="proof"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="field-input file:mr-4 file:rounded-[6px] file:border-0 file:bg-gold file:px-4 file:py-2 file:font-bold file:text-charcoal"
          />
        )}
      </Field>
      <SubmitButton label="Upload payment proof" />
    </form>
  )
}
