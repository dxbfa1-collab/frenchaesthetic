import type { Concern, Faq, Treatment, TreatmentCategory } from '../payload-types'

/**
 * Clinic starting content. Descriptions are the FMA brief's neutral drafts (§4.2) and still need a
 * doctor's review, so no treatment goes live until "Medical sign-off" is ticked in the admin.
 * Device and trademark names are left out (owner decision D-005; brief §5). No prices (owner, 28 Oct).
 * The wellness group is not modelled (owner, 28 Oct 2026: removed from the website).
 */

type CategorySeed = Omit<TreatmentCategory, 'id' | 'createdAt' | 'updatedAt'>
type ConcernSeed = Omit<Concern, 'id' | 'createdAt' | 'updatedAt'>
type TreatmentSeed = Omit<
  Treatment,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'category'
  | 'concerns'
  | 'branches'
  | 'avoid'
  | 'suits'
  | 'priceFactors'
> & {
  categorySlug: string
  concernSlugs?: string[]
  /** "skinAnalysis": the branches that offer free AI skin analysis. */
  branchesFrom?: 'skinAnalysis'
  avoid?: string[]
  suits?: string[]
  priceFactors?: string[]
}
type FaqSeed = Omit<Faq, 'id' | 'createdAt' | 'updatedAt' | 'treatment' | 'course'> & {
  treatmentSlug?: string
}

export const categories: CategorySeed[] = [
  {
    name: 'Face Lifting & Tightening',
    slug: 'face-lifting-and-tightening',
    order: 1,
    description: 'Non-surgical options for laxity and firmness on the face, jawline and neck.',
  },
  {
    name: 'Skin & Facials',
    slug: 'skin-and-facials',
    order: 2,
    description: 'Facials, peels and skin analysis for tone, texture and hydration.',
  },
  {
    name: 'Laser Treatments',
    slug: 'laser-treatments',
    order: 3,
    description:
      'Laser facials and skin lasers. The laser is chosen by the doctor for your concern and skin type.',
  },
  {
    name: 'Injectables',
    slug: 'injectables',
    order: 4,
    description:
      'Doctor-administered injectable treatments, after an in-person medical assessment.',
  },
  { name: 'Hair', slug: 'hair', order: 5, description: 'Scalp and hair treatments.' },
  { name: 'Body', slug: 'body', order: 6, description: 'Treatments for localised areas of fat.' },
  {
    name: 'Medical Dermatology',
    slug: 'medical-dermatology',
    order: 7,
    description: 'Skin conditions assessed and treated by a doctor.',
  },
]

// The concern list is the owner's prompt list, still marked "owner to confirm": staging only for now.
export const concerns: ConcernSeed[] = [
  [
    'Acne & Acne Scars',
    'acne-and-acne-scars',
    'Breakouts, and the marks or scars they can leave behind.',
  ],
  ['Pigmentation & Melasma', 'pigmentation-and-melasma', 'Dark patches, uneven tone and melasma.'],
  [
    'Wrinkles & Fine Lines',
    'wrinkles-and-fine-lines',
    'Lines from expression and age, such as forehead and frown lines.',
  ],
  ['Sagging Skin', 'sagging-skin', 'Loss of firmness on the face, jawline and neck.'],
  [
    'Dull & Dehydrated Skin',
    'dull-and-dehydrated-skin',
    'Skin that looks tired, dry or congested.',
  ],
  ['Dark Circles', 'dark-circles', 'Shadows and hollows under the eyes.'],
  ['Hair Loss', 'hair-loss', 'Thinning hair and scalp concerns.'],
  ['Unwanted Hair', 'unwanted-hair', 'Hair you would rather not shave, wax or thread.'],
  ['Stubborn Fat', 'stubborn-fat', 'Small areas of fat that do not shift with diet and exercise.'],
  ['Double Chin', 'double-chin', 'Fullness under the chin and along the jawline.'],
  ['Stretch Marks', 'stretch-marks', 'Lines on the skin after growth, pregnancy or weight change.'],
  ['Scars & Keloids', 'scars-and-keloids', 'Raised, depressed or thickened scars.'],
].map(([name, slug, description], i) => ({
  name,
  slug,
  description,
  order: i + 1,
  status: 'confirm' as const,
}))

// Common screening points by treatment type. Drafts: a doctor reviews them before sign-off.
const ENERGY = [
  'You are pregnant',
  'You have an active skin infection or an open wound in the area',
]
const INJECTABLE = [
  'You are pregnant or breastfeeding',
  'You have an infection or cold sores at the treatment area',
  'You have had a reaction to a similar product before',
]

const ready: TreatmentSeed[] = [
  {
    name: 'HIFU 22D skin tightening',
    slug: 'hifu-22d-skin-tightening',
    categorySlug: 'face-lifting-and-tightening',
    contentStatus: 'ready',
    featured: true,
    order: 1,
    promise: 'Non-surgical skin tightening for the face, jawline and neck.',
    summary:
      "High-Intensity Focused Ultrasound delivers focused energy beneath the skin surface to support the body's natural collagen production. It is a non-surgical option for people looking to address mild to moderate skin laxity on the face, jawline and neck.",
    quickFacts: {
      downtime: 'Most people return to daily activities the same day',
      sessions: 'Decided at consultation',
      resultsVisible: 'Develop gradually and vary by person',
    },
    howItWorks:
      "Focused ultrasound energy reaches the layers beneath the skin without breaking the surface, where it supports the body's own collagen production.",
    limits:
      'It is not a surgical facelift and does not remove excess skin. Results develop gradually and vary from person to person.',
    suits: [
      'Mild to moderate skin laxity on the face, jawline and neck',
      'People who prefer a non-surgical option',
    ],
    avoid: [...ENERGY, 'You have metal implants or a device in the treatment area'],
    concernSlugs: ['sagging-skin'],
    priceFactors: [
      'The areas treated (face, jawline, neck)',
      'The number of sessions your doctor recommends',
    ],
    metaTitle: 'HIFU 22D Skin Tightening in Lahore & Karachi',
    metaDescription:
      'Non-surgical HIFU skin tightening for the face, jawline and neck at French Medical Aesthetics. Doctor-led consultation; price given at consultation.',
  },
  {
    name: 'Non-surgical face lifting',
    slug: 'non-surgical-face-lifting',
    categorySlug: 'face-lifting-and-tightening',
    contentStatus: 'ready',
    featured: true,
    order: 2,
    promise: 'Needle-free toning for the skin and facial muscles.',
    summary:
      'A non-surgical, needle-free facial treatment that combines energy-based technologies to target skin and facial muscle tone. Suitability and the session plan are decided at consultation.',
    quickFacts: { sessions: 'Decided at consultation' },
    howItWorks:
      'Energy-based technologies work on the skin and on the facial muscles beneath it in the same session, without needles or incisions.',
    limits:
      'It is not surgery and does not replace a surgical facelift. Results vary from person to person.',
    suits: ['People looking for a needle-free option for facial tone'],
    avoid: [...ENERGY, 'You have a pacemaker, an electronic implant or metal implants in the face'],
    concernSlugs: ['sagging-skin'],
    internalNote:
      'Shown generically. Use the EMFACE name only once the genuine branded device is confirmed (FMA brief §4).',
  },
  {
    name: 'RF microneedling',
    slug: 'rf-microneedling',
    categorySlug: 'face-lifting-and-tightening',
    contentStatus: 'ready',
    featured: true,
    order: 3,
    promise: 'Microneedling with radiofrequency, for texture, scarring and firmness.',
    summary:
      'Radiofrequency microneedling combines fine needles with heat energy to stimulate collagen in deeper skin layers. It is used for texture, acne scarring and skin firmness.',
    quickFacts: {
      downtime: 'Some redness for a few days',
      sessions: 'A course may be recommended',
    },
    limits: 'Scars and texture improve gradually; complete removal is not promised. Results vary.',
    suits: ['Uneven texture', 'Acne scarring', 'Loss of firmness'],
    avoid: [
      ...ENERGY,
      'You have active acne or cold sores in the area',
      'You have used isotretinoin recently',
      'You have a pacemaker or metal implants in the area',
    ],
    concernSlugs: ['acne-and-acne-scars', 'sagging-skin', 'scars-and-keloids'],
    internalNote:
      'Shown generically. Use the Morpheus8 name only if the genuine branded system is used.',
  },
  {
    name: 'Thread lift',
    slug: 'thread-lift',
    categorySlug: 'face-lifting-and-tightening',
    contentStatus: 'ready',
    order: 4,
    promise: 'Dissolvable threads for lift and support.',
    summary:
      'Dissolvable medical threads are placed under the skin to provide lift and support collagen, as a minimally invasive option for mild sagging.',
    limits:
      'It is minimally invasive, not surgery, and suits mild sagging. Your doctor explains how long the lift may last.',
    suits: ['Mild sagging'],
    avoid: [
      'You are pregnant or breastfeeding',
      'You have an active infection in the area',
      'You take blood thinners or have a bleeding disorder',
    ],
    concernSlugs: ['sagging-skin'],
  },
  {
    name: 'Hydrating facial',
    slug: 'hydrating-facial',
    categorySlug: 'skin-and-facials',
    contentStatus: 'ready',
    featured: true,
    order: 5,
    promise: 'Cleanse, exfoliate, extract and hydrate in one session.',
    summary:
      'A multi-step facial that cleanses, exfoliates, extracts and hydrates the skin in one session. Suitable for most skin types and often chosen before events or as regular maintenance.',
    suits: ['Most skin types', 'Before an event, or as regular care'],
    avoid: ['You have an active skin infection, cold sores or open wounds'],
    concernSlugs: ['dull-and-dehydrated-skin'],
    internalNote:
      'Named generically. Use "HydraFacial" only if the genuine branded system is used.',
  },
  {
    name: 'Chemical peels',
    slug: 'chemical-peels',
    categorySlug: 'skin-and-facials',
    contentStatus: 'ready',
    order: 6,
    promise: 'Controlled peels for tone, texture and marks.',
    summary:
      'A controlled application of medical-grade acids to remove dull surface layers, helping with uneven tone, mild pigmentation, texture and acne marks. Peel strength is selected after skin assessment.',
    quickFacts: { downtime: 'Some peeling for a few days is normal' },
    suits: ['Uneven tone', 'Mild pigmentation', 'Texture', 'Acne marks'],
    avoid: [
      'You are pregnant or breastfeeding',
      'You have used isotretinoin recently',
      'You have an active skin infection, cold sores or sunburn',
    ],
    concernSlugs: ['pigmentation-and-melasma', 'acne-and-acne-scars', 'dull-and-dehydrated-skin'],
  },
  {
    name: 'AI skin analysis',
    slug: 'ai-skin-analysis',
    categorySlug: 'skin-and-facials',
    contentStatus: 'ready',
    order: 7,
    promise: 'A digital scan of your skin, to support your consultation.',
    summary:
      "A digital skin scan that maps concerns such as pigmentation, pores and texture to support the doctor's consultation. Offered free with consultation at participating branches.",
    branchesFrom: 'skinAnalysis',
  },
  {
    name: 'Carbon laser facial',
    slug: 'carbon-laser-facial',
    categorySlug: 'laser-treatments',
    contentStatus: 'ready',
    order: 8,
    promise: 'A laser facial for congested pores and a refreshed look.',
    summary:
      "A laser facial in which a thin carbon layer is applied and then treated with laser light to help clear congested pores and refresh the skin's appearance.",
    quickFacts: { downtime: 'Little to no downtime' },
    suits: ['Congested pores', 'Dull-looking skin'],
    avoid: [
      'You are pregnant',
      'You have used isotretinoin recently',
      'You have an active skin infection or a recent tan',
    ],
    concernSlugs: ['dull-and-dehydrated-skin', 'acne-and-acne-scars'],
  },
  {
    name: 'Laser skin treatments',
    slug: 'laser-skin-treatments',
    categorySlug: 'laser-treatments',
    contentStatus: 'ready',
    order: 9,
    promise: 'Medical lasers for pigmentation, tone and texture.',
    summary:
      'Medical lasers used for resurfacing, pigmentation, uneven tone and texture. The laser is chosen by the doctor based on your concern and skin type.',
    suits: ['Pigmentation', 'Uneven tone', 'Texture'],
    avoid: [
      'You are pregnant',
      'You have used isotretinoin recently',
      'You have an active skin infection, a recent tan or sunburn',
    ],
    concernSlugs: ['pigmentation-and-melasma'],
    internalNote:
      'Which lasers are installed, and at which branch, is not confirmed (FMA brief §4.2 and §5).',
  },
  {
    name: 'Botox (anti-wrinkle injections)',
    slug: 'botox',
    categorySlug: 'injectables',
    contentStatus: 'ready',
    order: 10,
    promise: 'Softens expression lines, such as forehead and frown lines.',
    summary:
      "A doctor-administered injectable that relaxes specific facial muscles to soften expression lines such as forehead lines, frown lines and crow's feet. Effects are temporary and typically need repeating.",
    // From the current site's Botox FAQ, which the brief marks as reusable facts.
    quickFacts: {
      resultsVisible: 'From 3 to 7 days; full effect at 10 to 14 days',
      resultsLast: 'Typically 3 to 4 months',
    },
    timeline: [
      { when: 'Day 3 to 7', text: 'The effect starts to show.' },
      { when: 'Day 10 to 14', text: 'The full effect.' },
      { when: 'Month 3 to 4', text: 'The effect wears off, and treatment can be repeated.' },
    ],
    limits:
      'It softens lines caused by movement. It does not add volume or lift sagging skin, and the effect is temporary.',
    suits: ['Forehead lines', 'Frown lines', "Crow's feet"],
    avoid: [...INJECTABLE, 'You have a neuromuscular condition'],
    concernSlugs: ['wrinkles-and-fine-lines'],
    metaTitle: 'Botox (Anti-Wrinkle Injections) in Lahore & Karachi',
    metaDescription:
      'Doctor-administered anti-wrinkle injections for forehead lines, frown lines and crow’s feet at French Medical Aesthetics. Price given at consultation.',
  },
  {
    name: 'Dermal fillers',
    slug: 'dermal-fillers',
    categorySlug: 'injectables',
    contentStatus: 'ready',
    order: 11,
    promise: 'Restores volume or refines lips, cheeks, chin and under-eyes.',
    summary:
      'Hyaluronic acid-based injectables used by a doctor to restore volume or refine areas such as lips, cheeks, chin and under-eyes. Results are temporary and vary by product and area.',
    quickFacts: { resultsLast: 'Temporary; varies by product and area' },
    suits: ['Lips', 'Cheeks', 'Chin', 'Under-eyes'],
    avoid: [...INJECTABLE, 'You take blood thinners or have a bleeding disorder'],
    concernSlugs: ['dark-circles'],
  },
  {
    name: 'Liquid rhinoplasty (non-surgical nose reshaping)',
    slug: 'liquid-rhinoplasty',
    categorySlug: 'injectables',
    contentStatus: 'ready',
    order: 12,
    promise: 'Refines the nose profile without surgery.',
    summary:
      'Non-surgical nose reshaping using dermal filler to improve the profile, such as smoothing a bump or lifting the tip.',
    limits:
      'It does not reduce the size of the nose, and it is performed only by a qualified doctor after assessment.',
    avoid: [...INJECTABLE, 'You have had nose surgery recently'],
  },
  {
    name: 'Fat dissolving injections',
    slug: 'fat-dissolving-injections',
    categorySlug: 'injectables',
    contentStatus: 'ready',
    order: 13,
    promise: 'For small, stubborn pockets of fat, such as a double chin.',
    summary:
      'Doctor-administered injections designed to break down small, stubborn fat pockets such as a double chin. Suitability is assessed at consultation.',
    limits: 'It is not a weight-loss treatment.',
    avoid: INJECTABLE,
    concernSlugs: ['double-chin', 'stubborn-fat'],
  },
]

// On the old site or in the owner's prompt, but not confirmed as offered now: staging only.
const toConfirm = (
  name: string,
  slug: string,
  categorySlug: string,
  contentStatus: 'confirm' | 'historical',
  extra: Partial<TreatmentSeed> = {},
): TreatmentSeed => ({ name, slug, categorySlug, contentStatus, order: 50, ...extra })

const later: TreatmentSeed[] = [
  toConfirm('Microneedling', 'microneedling', 'skin-and-facials', 'historical', {
    summary:
      'Fine needles create micro-channels in the skin to trigger natural repair, helping with texture, open pores and mild scarring.',
    concernSlugs: ['acne-and-acne-scars', 'scars-and-keloids'],
  }),
  toConfirm('Acne and acne scar treatment', 'acne-treatment', 'skin-and-facials', 'historical', {
    summary:
      'Personalised plans that may combine lasers, microneedling, peels or RF microneedling depending on scar type and skin type.',
    concernSlugs: ['acne-and-acne-scars'],
  }),
  toConfirm('Melasma treatment', 'melasma-treatment', 'skin-and-facials', 'confirm', {
    concernSlugs: ['pigmentation-and-melasma'],
  }),
  toConfirm('Dark circles treatment', 'dark-circles-treatment', 'skin-and-facials', 'confirm', {
    concernSlugs: ['dark-circles'],
  }),
  toConfirm('Stretch marks treatment', 'stretch-marks-treatment', 'skin-and-facials', 'confirm', {
    concernSlugs: ['stretch-marks'],
  }),
  toConfirm('Stem cell therapy', 'stem-cell-therapy', 'skin-and-facials', 'confirm', {
    internalNote: 'Evidence and regulatory status to check before it can be published.',
  }),
  toConfirm('CO2 fractional laser', 'co2-fractional-laser', 'laser-treatments', 'historical', {
    summary:
      'An ablative laser used for resurfacing. The laser is chosen by the doctor based on concern and skin type.',
    concernSlugs: ['acne-and-acne-scars', 'scars-and-keloids'],
  }),
  toConfirm('Laser hair removal', 'laser-hair-removal', 'laser-treatments', 'historical', {
    summary:
      'Laser energy targets hair follicles to reduce hair growth over a course of sessions. Results vary with hair colour, skin type and hormones; maintenance sessions may be needed.',
    concernSlugs: ['unwanted-hair'],
  }),
  toConfirm('Tattoo removal', 'tattoo-removal', 'laser-treatments', 'historical', {
    summary:
      'Laser energy breaks down tattoo ink so the body can clear it gradually over several sessions. The number of sessions depends on ink colour, depth and age of the tattoo.',
  }),
  toConfirm('Mole removal', 'mole-removal', 'laser-treatments', 'confirm'),
  toConfirm('Keloid treatment', 'keloid-treatment', 'laser-treatments', 'confirm', {
    concernSlugs: ['scars-and-keloids'],
  }),
  toConfirm('Profhilo', 'profhilo', 'injectables', 'confirm', {
    concernSlugs: ['dull-and-dehydrated-skin'],
    internalNote: 'A product brand: use the name only if the genuine product is used.',
  }),
  toConfirm('Skin boosters', 'skin-boosters', 'injectables', 'confirm', {
    concernSlugs: ['dull-and-dehydrated-skin', 'wrinkles-and-fine-lines'],
  }),
  toConfirm('Mesotherapy', 'mesotherapy', 'injectables', 'confirm'),
  toConfirm('PRP for face and hair', 'prp-face-and-hair', 'injectables', 'confirm', {
    concernSlugs: ['hair-loss'],
  }),
  toConfirm('Hair PRP', 'hair-prp', 'hair', 'historical', {
    summary:
      "Platelet-rich plasma prepared from the client's own blood is applied to the scalp to support hair health. Typically a course; results vary and not everyone is a suitable candidate.",
    concernSlugs: ['hair-loss'],
  }),
  toConfirm('Hair exosome treatment', 'hair-exosome', 'hair', 'historical', {
    concernSlugs: ['hair-loss'],
    internalNote:
      'FMA brief: evidence and regulatory status unverified. Do not publish without medical sign-off.',
  }),
  toConfirm('Beard growth treatment', 'beard-growth-treatment', 'hair', 'confirm'),
  toConfirm('Dandruff treatment', 'dandruff-treatment', 'hair', 'confirm', {
    concernSlugs: ['hair-loss'],
  }),
  toConfirm('Fat freezing (cryolipolysis)', 'fat-freezing', 'body', 'historical', {
    summary:
      'A non-surgical treatment that targets localised areas of fat. Not a substitute for weight loss.',
    concernSlugs: ['stubborn-fat'],
  }),
  toConfirm('Body contouring', 'body-contouring', 'body', 'historical', {
    summary:
      'Non-surgical treatments that target localised areas of fat. Not a substitute for weight loss.',
    concernSlugs: ['stubborn-fat'],
  }),
  toConfirm('Double chin reduction', 'double-chin-reduction', 'body', 'confirm', {
    concernSlugs: ['double-chin'],
  }),
  toConfirm('Vitiligo treatment', 'vitiligo-treatment', 'medical-dermatology', 'confirm'),
  toConfirm('Skin allergy treatment', 'skin-allergy-treatment', 'medical-dermatology', 'confirm'),
  toConfirm(
    'Fungal infection treatment',
    'fungal-infection-treatment',
    'medical-dermatology',
    'confirm',
  ),
  toConfirm(
    'Nail infection treatment',
    'nail-infection-treatment',
    'medical-dermatology',
    'confirm',
  ),
]

export const treatments: TreatmentSeed[] = [...ready, ...later]

// General answers use only confirmed facts (consultation policy, branches, the no-price decision).
export const clinicFaqs: FaqSeed[] = [
  {
    question: 'Is the consultation free?',
    answer:
      'Consultation with AI skin analysis is free at DHA Phase 4, MM Alam Road and Bahadurabad. At Allama Iqbal Town a consultation fee applies.',
  },
  {
    question: 'How much does a treatment cost?',
    answer:
      'Your price is given at your consultation, once your doctor has assessed your skin and agreed a plan with you. You can also ask for a quote on WhatsApp.',
  },
  {
    question: 'How do I book?',
    answer:
      'Message us on WhatsApp or use the booking form, and tell us your preferred branch and treatment.',
  },
  {
    question: 'Does every branch offer every treatment?',
    answer:
      'Not always. Availability differs by branch, so ask us on WhatsApp which branch offers your treatment.',
  },
  {
    question: 'Who decides which treatment is right for me?',
    answer:
      'Every treatment starts with an in-person medical assessment, and your doctor explains your options.',
  },
  {
    question: 'Will I see results after one session?',
    answer:
      'Results vary from person to person. Your doctor explains what to expect, and how many sessions they recommend, at your consultation.',
  },
  {
    question: 'Can I send a photo first?',
    answer:
      'Yes. Send us a photo on WhatsApp for a free assessment. Suitability is always confirmed at an in-person consultation.',
  },
  {
    question: 'Where are your branches?',
    answer:
      'Three in Lahore (DHA Phase 4, Allama Iqbal Town, and MM Alam Road, Gulberg III) and one in Karachi (Bahadurabad).',
  },
  {
    treatmentSlug: 'botox',
    question: 'When will I see the result?',
    answer:
      'The effect usually starts to show within 3 to 7 days, with the full effect at 10 to 14 days.',
  },
  {
    treatmentSlug: 'botox',
    question: 'How long does it last?',
    answer: 'Typically 3 to 4 months. The treatment can then be repeated.',
  },
].map((faq, i) => ({
  business: 'clinic' as const,
  status: 'confirmed' as const,
  order: i + 1,
  ...faq,
}))
