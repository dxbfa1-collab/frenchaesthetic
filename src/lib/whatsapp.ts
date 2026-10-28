/**
 * Phone and WhatsApp links. Numbers always come from Site settings or Branches, never from code.
 * Link format: https://wa.me/92XXXXXXXXXX?text=<url-encoded message>
 */

/** "0311-1171788", "+92 311 1171788" and "923111171788" all become "923111171788". */
export function toInternational(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('92')) return digits
  if (digits.startsWith('0')) return `92${digits.slice(1)}`
  return digits
}

export function whatsappHref(number: string, message?: string): string {
  const base = `https://wa.me/${toInternational(number)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function telHref(number: string): string {
  return `tel:+${toInternational(number)}`
}

/** Clinic messages (FMA brief §3). "(Website)" tells the CSR where the lead came from. */
export const clinicMessages = {
  consultation: (branch?: string) =>
    `Hi, I want to book a consultation${branch ? ` at ${branch}` : ''}. (Website)`,
  photo: 'Hi, I would like to send a photo for a free assessment. (Website)',
  treatment: (treatment: string) => `Hi, I want to know more about ${treatment}. (Website)`,
  concern: (concern: string) => `Hi, I would like advice about ${concern}. (Website)`,
  doctor: (doctor: string) => `Hi, I would like a consultation with ${doctor}. (Website)`,
  booked: (reference: string, branch: string) =>
    `Hi, I just sent a booking request for ${branch} (reference ${reference}). (Website)`,
}

/**
 * Academy messages (FAA brief §15, in English since the owner's decision of 29 Oct 2026). The WEB
 * code at the end tells admissions which page produced the lead, the same way the ad codes do.
 */
export const academyMessages = {
  homeNonInvasive:
    'Hello! I found you through your website. I would like details of the Non-Invasive course. (WEB-HOME-NI)',
  homeInvasive:
    'Hello! I am an MBBS/BDS doctor. I would like details of the Invasive course. (WEB-HOME-IN)',
  nonInvasive:
    'Hello! I would like the fee and batch details of the Non-Invasive Aesthetics course. (WEB-NI)',
  invasive:
    'Hello! I am an MBBS/BDS doctor. I would like the syllabus and details of the Invasive course. (WEB-IN)',
  internship: 'Hello! I would like details of the course with the internship. (WEB-INT)',
  batches: 'Hello! I would like to ask about a seat in the next batch. (WEB-BATCH)',
  page: (code: string) => `Hello! I would like details of your courses. (WEB-${code})`,
}

/** Page codes from the FAA sitemap (§2), so header and sticky-bar clicks still say where they came from. */
const ACADEMY_PAGE_MESSAGES: Record<string, string> = {
  '/academy': academyMessages.page('HOME'),
  '/academy/non-invasive-aesthetics-course': academyMessages.nonInvasive,
  '/academy/invasive-aesthetics-course-for-doctors': academyMessages.invasive,
  '/academy/internship': academyMessages.internship,
  '/academy/batches': academyMessages.batches,
  '/academy/faculty': academyMessages.page('FAC'),
  '/academy/about': academyMessages.page('ABOUT'),
  '/academy/contact': academyMessages.page('CONTACT'),
  '/academy/faq': academyMessages.page('FAQ'),
}

/** The WEB code at the end of a pre-filled message, e.g. "WEB-NI". */
export function webCode(message: string): string | undefined {
  return message.match(/\((WEB-[A-Z0-9-]+)\)\s*$/)?.[1]
}

export function academyMessageFor(pathname: string): string {
  const path = pathname.replace(/\/$/, '') || '/'
  if (ACADEMY_PAGE_MESSAGES[path]) return ACADEMY_PAGE_MESSAGES[path]
  const last = path.split('/').filter(Boolean).pop() ?? 'HOME'
  return academyMessages.page(last.toUpperCase())
}
