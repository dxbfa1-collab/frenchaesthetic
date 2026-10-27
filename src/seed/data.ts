import { DEFAULT_ACADEMY_FILTER_LINE, DEFAULT_MEDICAL_DISCLAIMER } from '../lib/site'
import type { Branch, SiteSettings } from '../payload-types'

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
