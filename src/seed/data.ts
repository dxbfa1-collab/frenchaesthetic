import { DEFAULT_ACADEMY_FILTER_LINE, DEFAULT_MEDICAL_DISCLAIMER } from '../lib/site'
import type { Branch, Policies, SiteSettings } from '../payload-types'

/**
 * Starting content, taken only from the owner's briefs and answers (see CLAUDE.md).
 * Anything not signed off carries status "confirm", so it stays off the live site.
 */

type SettingsSeed = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt' | 'globalType'>

export const siteSettings: SettingsSeed = {
  // Owner, 28 Oct 2026. The FMA brand guide labels it "UAN / WhatsApp", so the UAN is the WhatsApp line too.
  clinicPhone: '0311-1171788',
  clinicEmail: 'info@frenchaesthetic.com',
  // Owner, 28 Oct 2026 (resolves the @frenchmedicalaesthetics vs @frenchaestheticsofficial conflict).
  clinicInstagram: 'https://www.instagram.com/frenchaestheticsofficial/',
  clinicFacebook: 'https://www.facebook.com/frenchaestheticsofficial',
  // Owner, 28 Oct 2026. Academy email and socials are still to confirm, so they stay empty.
  admissionsWhatsApp: '0311 2748804',
  medicalDisclaimer: DEFAULT_MEDICAL_DISCLAIMER,
  academyFilterLine: DEFAULT_ACADEMY_FILTER_LINE,
}

type BranchSeed = Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>

// All four clinic branches were confirmed active by the owner on 21 Oct 2026.
// Addresses, hours and branch numbers are not signed off yet.
export const branches: BranchSeed[] = [
  {
    name: 'DHA Phase 4',
    slug: 'dha-phase-4-lahore',
    business: 'both',
    city: 'Lahore',
    status: 'active',
    order: 1,
    address: 'Plaza No. 10, CCA, Block DD, Phase IV, DHA, Lahore 54800',
    addressStatus: 'confirm',
    consultation: 'free',
    skinAnalysis: true,
    hoursStatus: 'confirm',
    internalNote:
      'Address formatting to confirm. Academy DHA Phase 4 campus is open per the FAA brief; its own address was not given.',
  },
  {
    name: 'Allama Iqbal Town',
    shortName: 'Iqbal Town',
    slug: 'allama-iqbal-town-lahore',
    business: 'both',
    city: 'Lahore',
    status: 'active',
    order: 2,
    address: 'Plaza No. 10, Main Boulevard, Hunza Block, Allama Iqbal Town, Lahore',
    addressStatus: 'confirm',
    consultation: 'paid',
    hoursStatus: 'confirm',
    internalNote:
      'This is the academy campus address (FAA brief). The clinic brief has no address for this branch: confirm both are the same building, and the consultation fee.',
  },
  {
    name: 'MM Alam Road, Gulberg III',
    shortName: 'MM Alam Road',
    slug: 'mm-alam-road-gulberg-lahore',
    business: 'clinic',
    city: 'Lahore',
    status: 'active',
    order: 3,
    address: '92-A/B, 1 MM Alam Road, Block B1, Gulberg III, Lahore',
    addressStatus: 'confirm',
    consultation: 'free',
    skinAnalysis: true,
    hoursStatus: 'confirm',
    internalNote:
      'Newest branch, opened about 16 Oct 2026. An academy campus here is planned, date not set.',
  },
  {
    name: 'Bahadurabad',
    slug: 'bahadurabad-karachi',
    business: 'clinic',
    city: 'Karachi',
    status: 'active',
    order: 4,
    address: 'Main Bahadurabad, Char Minar Chowrangi, Karachi',
    addressStatus: 'confirm',
    consultation: 'free',
    skinAnalysis: true,
    landmarkNote: 'Char Minar Chowrangi',
    hoursStatus: 'confirm',
    internalNote:
      'Short address is confirmed; older full form: 30-C, 1st Floor, Qazi Court, above Soneri Bank, BMCHS Sharafabad, Bahadurabad. Confirm the full address.',
  },
]

type PoliciesSeed = Omit<Policies, 'id' | 'createdAt' | 'updatedAt' | 'globalType'>

// A draft for the owner to review (FMA brief §9 requires a privacy policy covering form, upload
// and WhatsApp data). It stays off the live site until its status is set to confirmed.
export const policies: PoliciesSeed = {
  // Approved by the owner, 29 Oct 2026.
  privacyStatus: 'confirmed',
  privacy: [
    'This policy explains what information French Medical Aesthetics (the clinic) and French Aesthetics Academy (the academy) collect through this website, how it is used and who can see it.',
    '## What we collect',
    [
      '- Booking requests: your name, WhatsApp number, optional email, branch, the treatment or concern you chose, your preferred date and time, and any notes, gender or age you choose to share.',
      '- Course applications: your name, WhatsApp number, optional email, city, profession and chosen batch. For the invasive course, also your PMDC number and the registration documents you upload.',
      '- Payment proofs: the receipt or screenshot you upload after paying a course fee.',
      '- Contact messages: your name, WhatsApp number, optional email and your message.',
      '- Where you came from: the page you sent a form from and, if you arrived from an advert, the campaign tags in the link.',
    ].join('\n'),
    '## How we use it',
    'We use your details only to answer your request: to confirm your consultation, to process your course application, or to reply to your message. We do not sell your information.',
    '## WhatsApp',
    "When you message us on WhatsApp, or ask us to contact you there, the conversation runs through WhatsApp, a service of Meta, under WhatsApp's own terms and privacy policy. Our team reads it on the clinic's or the academy's business account.",
    '## Who can see your information',
    'Only authorised staff: the clinic team sees bookings, and admissions see course applications. Uploaded documents and payment proofs are stored privately and are never published on the website.',
    '## Cookies and analytics',
    'The website remembers your light or dark theme on your own device. If you arrive from an advert, a small cookie keeps its campaign tags for 30 days, so we can see which adverts help people find us. Analytics and advertising tags (Google Analytics and the Meta Pixel) load only if you accept them in the cookie notice.',
    '## How long we keep it',
    'We keep your details only for as long as we need them to handle your request, and as required by law and medical record-keeping rules.',
    '## Your choices',
    'You can ask to see, correct or delete the information you have sent us. Message the clinic or academy admissions on WhatsApp, or email info@frenchaesthetic.com.',
    '## Changes',
    'If this policy changes, the new version is published on this page.',
  ].join('\n\n'),
  termsStatus: 'confirm',
  refundsStatus: 'confirm',
  cancellationsStatus: 'confirm',
}
