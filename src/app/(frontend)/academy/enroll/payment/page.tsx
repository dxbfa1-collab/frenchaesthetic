import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PaymentForm } from '@/components/academy/PaymentForm'
import { WhatsAppIcon } from '@/components/icons'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { formatBatchDate } from '@/lib/batches'
import { findEnrollmentForPayment } from '@/lib/enrollments'
import { getPrivateSettings } from '@/lib/payload'
import { academyMessages } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Payment',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ ref?: string | string[]; key?: string | string[] }> }

/**
 * Private page reached only through the link admissions send after verifying an application.
 * It shows the first name and batch only, and the payment details from Site settings.
 */
export default async function PaymentPage({ searchParams }: Props) {
  const { ref, key } = await searchParams
  if (typeof ref !== 'string' || typeof key !== 'string') notFound()

  const payload = await getPayload({ config })
  const enrollment = await findEnrollmentForPayment(payload, ref, key)
  if (!enrollment) notFound()

  const settings = await getPrivateSettings()
  const firstName = enrollment.name.split(/\s+/)[0]
  const batch = typeof enrollment.batch === 'object' ? enrollment.batch : null
  const canUpload = enrollment.status === 'verified' || enrollment.status === 'paid'

  const statusNote: Record<string, string> = {
    applied:
      'Admissions are still checking your details. You will get the payment details on WhatsApp once verified.',
    confirmed: 'Your seat is confirmed. See you on the batch start date.',
    rejected: 'This application is closed. Please contact admissions on WhatsApp.',
  }

  return (
    <>
      <PageHero
        eyebrow={`Reference ${enrollment.reference}`}
        title={`Assalam o Alaikum, ${firstName}.`}
        accent="Payment for your seat."
        intro={
          batch?.startDate ? (
            <p>Batch: {batch.title ?? formatBatchDate(batch.startDate)}</p>
          ) : undefined
        }
      />
      <section className="border-t border-hairline">
        <Container className="grid gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <p className="label eyebrow">Payment details</p>
            {settings.paymentInstructions ? (
              <p className="mt-6 whitespace-pre-line text-lg text-heading">
                {settings.paymentInstructions}
              </p>
            ) : (
              <p className="mt-6 text-lg">
                Admissions share the payment details with you on WhatsApp.
              </p>
            )}
            {enrollment.paymentProofUploadedAt && (
              <p className="mt-8 border-l-2 border-gold pl-4">
                We received a payment proof on {formatBatchDate(enrollment.paymentProofUploadedAt)}.
                You can upload another file if admissions ask for one.
              </p>
            )}
          </div>
          <div>
            {canUpload ? (
              <PaymentForm reference={ref} paymentKey={key} />
            ) : (
              <div className="space-y-6">
                <p className="text-lg">{statusNote[enrollment.status] ?? statusNote.applied}</p>
                <WhatsAppLink
                  number={settings.admissionsWhatsApp}
                  message={academyMessages.page('PAYMENT')}
                  side="academy"
                  label="payment-status"
                  className="link-arrow"
                >
                  <WhatsAppIcon size={18} className="text-gold" />
                  WhatsApp {settings.admissionsWhatsApp}
                </WhatsAppLink>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
