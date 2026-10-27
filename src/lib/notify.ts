import type { Payload, PayloadRequest } from 'payload'

type Inbox = 'enrollment' | 'booking'

const SETTINGS_FIELD = {
  booking: 'bookingAlertEmails',
  enrollment: 'enrollmentAlertEmails',
} as const

const split = (value?: string | null) => (value ?? '').split(/[\s,;]+/).filter(Boolean)

/**
 * Emails staff about a new booking, enrollment or message. Recipients come from Site settings
 * (and, for a booking, the branch's own alert emails). Sent inside the request, because Hostinger
 * stops background work on redeploy. A failed email never blocks the form: it is logged, and the
 * record is still in the admin.
 */
export async function sendStaffAlert(
  payload: Payload,
  {
    inbox,
    subject,
    lines,
    extraRecipients,
    req,
  }: {
    inbox: Inbox
    subject: string
    lines: string[]
    extraRecipients?: string | null
    req?: PayloadRequest
  },
): Promise<void> {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    const to = [...new Set([...split(extraRecipients), ...split(settings[SETTINGS_FIELD[inbox]])])]
    if (to.length === 0) {
      payload.logger.warn(`No ${inbox} alert email is set in Site settings. ${subject}`)
      return
    }
    await payload.sendEmail({ to, subject, text: lines.join('\n') })
  } catch (err) {
    payload.logger.error({ err, msg: `Could not send the staff alert: ${subject}` })
  }
}
