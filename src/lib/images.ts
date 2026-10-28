/*
  Illustrative photos for treatments, categories and the slides (owner, 29 Oct 2026: free-licence
  stock photos, each chosen for what the treatment really involves). Sources: public/images/CREDITS.md.
  A photo uploaded in the CMS (hero image, category image) always wins over these.
*/
export type SitePhoto = { src: string; alt: string; position?: string }

const photo = (src: string, alt: string, position?: string): SitePhoto => ({
  src: `/images/${src}.webp`,
  alt,
  position,
})

const TREATMENTS: Record<string, SitePhoto> = {
  'hifu-22d-skin-tightening': photo(
    'treatments/hifu-22d-skin-tightening',
    'Focused ultrasound handpiece moved along the jawline during skin tightening',
  ),
  'non-surgical-face-lifting': photo(
    'treatments/non-surgical-face-lifting',
    'Needle-free toning treatment with two handheld probes on the face',
    'center 30%',
  ),
  'rf-microneedling': photo('treatments/rf-microneedling', 'Microneedling pen treating the cheek'),
  'thread-lift': photo(
    'treatments/thread-lift',
    'Doctor placing a fine cannula along the jawline',
    'center 35%',
  ),
  'hydrating-facial': photo(
    'treatments/hydrating-facial',
    'Hydrating facial with a suction handpiece on the forehead',
  ),
  'chemical-peels': photo(
    'treatments/chemical-peels',
    'Peel solution brushed onto the skin',
    'center 40%',
  ),
  'ai-skin-analysis': photo(
    'treatments/ai-skin-analysis',
    'Specialist assessing the skin of the cheek',
    'center 30%',
  ),
  'carbon-laser-facial': photo(
    'treatments/carbon-laser-facial',
    'Laser handpiece held near the jaw during a laser facial',
    'center 35%',
  ),
  'laser-skin-treatments': photo(
    'treatments/laser-skin-treatments',
    'Laser treatment on the face, with protective eyewear',
    'center 40%',
  ),
  botox: photo('treatments/botox', 'Anti-wrinkle injection between the eyebrows', 'center 35%'),
  'dermal-fillers': photo('treatments/dermal-fillers', 'Doctor giving a lip filler injection'),
  'liquid-rhinoplasty': photo('treatments/liquid-rhinoplasty', 'Syringe used for dermal filler'),
  'fat-dissolving-injections': photo(
    'treatments/fat-dissolving-injections',
    'Injection under the chin to treat fullness',
  ),
}

const CATEGORIES: Record<string, SitePhoto> = {
  'face-lifting-and-tightening': photo(
    'categories/face-lifting-and-tightening',
    'Skin tightening handpiece on the cheek',
  ),
  'skin-and-facials': photo(
    'categories/skin-and-facials',
    'Facial mask applied with a spatula',
    'center 40%',
  ),
  'laser-treatments': photo(
    'categories/laser-treatments',
    'Doctor using a laser handpiece on a patient’s face',
    'center 35%',
  ),
  injectables: photo('categories/injectables', 'Syringe for an injectable treatment'),
  hair: photo('categories/hair', 'Scalp treatment along the hairline', 'center 30%'),
  body: photo('categories/body', 'Body treatment handpiece on the abdomen'),
  'medical-dermatology': photo(
    'categories/medical-dermatology',
    'Doctor examining a mole with a magnifying glass',
  ),
}

export const treatmentPhoto = (slug: string): SitePhoto | null => TREATMENTS[slug] ?? null
export const categoryPhoto = (slug: string): SitePhoto | null => CATEGORIES[slug] ?? null

export const SITE_PHOTOS = {
  consultation: photo(
    'clinic/consultation',
    'Doctor assessing a patient’s skin at consultation',
    'center 30%',
  ),
  reception: photo('clinic/reception', 'Bright, modern clinic reception', 'center 60%'),
  waitingRoom: photo('clinic/waiting-room', 'Calm clinic waiting room'),
  facial: photo('clinic/facial', 'Facial treatment in a clinic'),
  supervisedPractice: photo(
    'academy/supervised-practice',
    'Trainees watching a supervised procedure on a patient',
  ),
  anatomyClass: photo('academy/anatomy-class', 'Medical students studying anatomy in class'),
  laserPractical: photo('academy/laser-practical', 'Laser practical in a training clinic'),
  laserTeam: photo('academy/laser-team', 'Team performing a laser procedure'),
  assessment: photo('academy/assessment', 'Doctor assessing a patient’s jaw before treatment'),
  syringePreparation: photo(
    'academy/syringe-preparation',
    'Preparing a syringe with sterile technique',
    'center 40%',
  ),
  vial: photo('academy/skin-booster-vial', 'Vial and syringe for a skin booster treatment'),
  facialPractice: photo('academy/facial-practice', 'Hydrating facial practised in a clinic'),
}
