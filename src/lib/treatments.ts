import type { Branch, Treatment } from '@/payload-types'

/*
  Clinic rules that pages and components share. No Payload import here, so any component can use it.
*/

/** Brief §5 and §9: a treatment page goes live only when it is Ready and a doctor has signed it off. */
export const treatmentIsLive = (t: Pick<Treatment, 'contentStatus' | 'medicalSignOff'>): boolean =>
  t.contentStatus === 'ready' && t.medicalSignOff === true

export const treatmentHref = (t: { slug: string; category: { slug: string } }): string =>
  `/clinic/treatments/${t.category.slug}/${t.slug}`

/** Required on every treatment page (FMA brief §9). */
export const TREATMENT_DISCLAIMER =
  'Results vary from person to person. Treatment is subject to medical assessment.'

/** Used when a treatment has no steps of its own. */
export const DEFAULT_STEPS = [
  {
    title: 'Consultation',
    text: 'Tell us what concerns you. Your skin is assessed and your options are explained.',
  },
  {
    title: 'Your plan',
    text: 'An honest plan: the treatment that suits you, the sessions your doctor recommends, and what it will not do.',
  },
  { title: 'Treatment', text: 'Carried out in a calm clinic setting, with medical oversight.' },
  {
    title: 'Aftercare',
    text: 'Clear aftercare advice, and a WhatsApp line for your questions afterwards.',
  },
]

/** "Free consultation" is named per branch, never implied for all (FMA brief §2). */
export function consultationNote(branch: Branch): string | null {
  if (branch.consultation === 'free') {
    return branch.skinAnalysis ? 'Free consultation + AI skin analysis' : 'Free consultation'
  }
  if (branch.consultation === 'paid') {
    return branch.consultationFee
      ? `Consultation fee: PKR ${branch.consultationFee.toLocaleString('en-PK')}`
      : 'Consultation fee applies'
  }
  return null
}

/**
 * Technology described by type, never by device model or brand (owner decision D-005, brief §5).
 * No FDA, CE or "latest in Pakistan" claims. Each type links to the treatments that use it.
 */
export const TECHNOLOGIES = [
  {
    name: 'Focused ultrasound',
    text: "Ultrasound energy is focused on the layers beneath the skin without breaking its surface, where it supports the body's own collagen production.",
    treatments: ['hifu-22d-skin-tightening'],
  },
  {
    name: 'Energy-based facial toning',
    text: 'Needle-free technologies that work on the skin and on the facial muscles beneath it in the same session.',
    treatments: ['non-surgical-face-lifting'],
  },
  {
    name: 'Radiofrequency microneedling',
    text: 'Fine needles deliver radiofrequency heat into deeper layers of the skin to stimulate collagen, for texture, scarring and firmness.',
    treatments: ['rf-microneedling'],
  },
  {
    name: 'Medical lasers',
    text: 'Different lasers suit different concerns and skin types, so the doctor chooses the laser and its settings for you after assessing your skin.',
    treatments: ['carbon-laser-facial', 'laser-skin-treatments'],
  },
  {
    name: 'AI skin analysis',
    text: "A digital scan maps concerns such as pigmentation, pores and texture, to support the doctor's consultation and to compare progress over time.",
    treatments: ['ai-skin-analysis'],
  },
]
