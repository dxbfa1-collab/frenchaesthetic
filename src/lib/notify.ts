import type { Payload, PayloadRequest } from 'payload'

/**
 * Emails the admissions team (Site settings → Academy → Enrollment alert emails). Sent inside the
 * request, because Hostinger stops background work on redeploy. A failed email never blocks the
 * enrollment: it is logged, and the record is still in the admin.
 */
export async function sendAdmissionsAlert(
  payload: Payload,
  subject: string,
  lines: string[],
  req?: PayloadRequest,
): Promise<void> {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    const to = (settings.enrollmentAlertEmails ?? '').split(/[\s,;]+/).filter(Boolean)
    if (to.length === 0) {
      payload.logger.warn(`No enrollment alert email is set in Site settings. ${subject}`)
      return
    }
    await payload.sendEmail({ to, subject, text: lines.join('\n') })
  } catch (err) {
    payload.logger.error({ err, msg: `Could not email admissions: ${subject}` })
  }
}
