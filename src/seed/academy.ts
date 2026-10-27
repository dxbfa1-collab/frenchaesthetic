import { academyMessages } from '../lib/whatsapp'
import type { Batch, Course, Doctor, Faq } from '../payload-types'

/**
 * Academy starting content, verbatim from the FAA brief (§3–§11) and the owner's answers.
 * Owner claims, conflicts and anything marked [CONFIRM] carry status "confirm": staging only.
 */

type DoctorSeed = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>
type CourseSeed = Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'trainers'> & {
  trainerSlugs: string[]
}
type FaqSeed = Omit<Faq, 'id' | 'createdAt' | 'updatedAt' | 'course'> & { courseSlug?: string }
type BatchSeed = Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'course' | 'campus' | 'title'> & {
  courseSlug: string
  campusSlug?: string
}

// The current team is Dr. Iqra, Dr. Sadaf and Dr. Maria (owner, 28 Oct 2026).
// Dr. Sarah and Dr. Kashmala have left the clinic: never add them back.
export const trainers: DoctorSeed[] = [
  {
    name: 'Dr. Iqra Fatima',
    slug: 'dr-iqra-fatima',
    title: 'Dermatologist',
    isTrainer: true,
    trainerRole: 'Lead Trainer',
    order: 1,
    status: 'confirmed',
    internalNote:
      'Current staff (owner, 28 Oct 2026). Add FCPS / MCPS if she holds it, and the PMDC number. A photo needs written consent.',
  },
  {
    name: 'Dr. Maria',
    slug: 'dr-maria',
    // Owner, 28 Oct 2026 (as in the FMA brand guide). Her degree (MBBS or BDS) is not confirmed.
    title: 'Aesthetic Physician',
    isTrainer: true,
    order: 2,
    status: 'confirmed',
    internalNote:
      'Current staff. Title confirmed by the owner on 28 Oct 2026. Degree still to confirm (older record MBBS, academy brief BDS), and the PMDC number.',
  },
  {
    name: 'Dr. Sadaf',
    slug: 'dr-sadaf',
    // Owner, 28 Oct 2026: DPT (Doctor of Physical Therapy); "Physical Therapist" in the FMA brand guide.
    title: 'Physical Therapist',
    degrees: 'DPT',
    isTrainer: true,
    order: 3,
    status: 'confirmed',
    internalNote:
      'Current staff. DPT confirmed by the owner on 28 Oct 2026. A physical therapist: never list her as an injectables trainer or performing doctor.',
  },
]

const journey = [
  { label: 'Week 1', text: 'Hands-on training with trainers.' },
  { label: 'Week 2', text: 'Internship, you perform treatments yourself, supervised.' },
  { label: 'Week 3', text: 'Supervised practice until you work with confidence.' },
]

export const courses: CourseSeed[] = [
  {
    name: 'Non-Invasive Aesthetics Course',
    shortName: 'Non-Invasive',
    slug: 'non-invasive-aesthetics-course',
    track: 'nonInvasive',
    requiresPMDC: false,
    // Owner, 28 Oct 2026.
    batchStartDay: 15,
    order: 1,
    duration: '3 weeks (21 days)',
    summary:
      'Three weeks in total: 1 week hands-on training, then 2 weeks internship on live clients, open to non-medical learners.',
    trainerSlugs: ['dr-iqra-fatima'],
    hero: {
      label: 'For beauty professionals & beginners',
      headline: 'Beauty field mein hain?',
      headlineAccent: 'Ab Aesthetic Treatments bhi seekhein.',
      subheadline:
        "1 week hands-on training + 2 weeks internship on live clients, under doctors' supervision. No separate internship fee.",
      ctaLabel: 'WhatsApp Karein',
    },
    whatsappMessage: academyMessages.nonInvasive,
    painPoints: [
      { text: 'Clients HydraFacial maangte hain, aur aap mana kar dete hain?' },
      { text: 'Saalon se wohi kaam, wohi income?' },
      { text: 'Beauty mein career banana hai, lekin tajurba zero hai?' },
      { text: 'Real client par galti ka dar?' },
    ],
    audience: [
      'Salon owners',
      'Beauticians',
      'Makeup artists',
      'Hair stylists',
      'Nail technicians',
      'Skin care specialists',
      'Spa / salon managers',
      'Cosmetology students',
      'Students',
      'Beginners',
      'Career changers',
    ],
    featured: [
      'HydraFacial',
      'BB Glow',
      'Chemical Peels',
      'HIFU',
      'Laser Hair Removal',
      'AI Skin Analysis & client consultation',
    ],
    journey: [
      { label: 'Week 1', text: 'Basics + hands-on training with trainers.' },
      { label: 'Week 2', text: 'Internship, you perform treatments on live clients yourself.' },
      { label: 'Week 3', text: 'Supervised practice, so you leave ready to work with confidence.' },
    ],
    // Regulatory risk (Punjab Healthcare Commission): Pico, Q-Switch and Microneedling are listed
    // as overview / theory until the owner confirms practical work is done only under a doctor.
    modules: [
      { title: 'Anatomy & Physiology of Skin' },
      { title: 'Skin Types & Analysis' },
      { title: 'Ageing of the Face' },
      { title: 'Patient Assessment & Selection' },
      { title: 'Ethical Considerations in Aesthetics' },
      { title: 'Chemical Peels' },
      { title: 'Laser Therapies' },
      { title: 'Microneedling', theoryOnly: true },
      { title: 'HydraFacial' },
      { title: 'BB Glow' },
      { title: 'HIFU (Face & Body)' },
      { title: 'Business Development & Marketing' },
      { title: 'Infection Control, Hygiene & Safety' },
      { title: 'AI Skin Analyzer' },
      { title: 'Fat Freezing (Cryolipolysis)' },
      { title: 'Pico Laser', theoryOnly: true },
      { title: 'Q-Switch Laser', theoryOnly: true },
      { title: 'EMS Body Contouring' },
      { title: 'Client Consultation & Treatment Planning' },
      { title: 'Practical Hands-On Training' },
    ],
    glance: [
      { item: 'Training', detail: '1 week, hands-on', status: 'confirmed' },
      {
        item: 'Internship',
        detail: '2 weeks, live clients, supervised, no extra fee',
        status: 'confirmed',
      },
      { item: 'Total', detail: '3 weeks (21 days)', status: 'confirmed' },
      {
        item: 'Batch start',
        detail: '15th of every month (no training on Sundays, so a Sunday start moves to Monday)',
        status: 'confirmed',
      },
      { item: 'Campus', detail: 'Iqbal Town, Lahore', status: 'confirmed' },
      // The September 2026 schedule says 2:00 to 5:00 PM; current hours are not confirmed.
      {
        item: 'Class timing',
        detail: '2:00 PM to 5:00 PM (September 2026 batch)',
        status: 'confirm',
      },
      { item: 'Seats', detail: 'Max 20', status: 'confirmed' },
      { item: 'Experience needed', detail: 'None', status: 'confirmed' },
      { item: 'Certificate', detail: 'Certificate included', status: 'confirm' },
    ],
    feeDisplay: 'whatsapp',
    metaTitle: 'Non-Invasive Aesthetics Course Lahore · With Internship',
    metaDescription:
      '1 week hands-on training + 2 weeks internship on live clients. HydraFacial, BB Glow, HIFU, peels. No experience needed. Max 20 seats.',
  },
  {
    name: 'Invasive Aesthetics Course for Doctors',
    shortName: 'Invasive',
    slug: 'invasive-aesthetics-course-for-doctors',
    track: 'invasive',
    requiresPMDC: true,
    // Owner, 28 Oct 2026.
    batchStartDay: 20,
    order: 2,
    duration: '3 weeks',
    summary:
      'One week of intensive training, then 2 weeks of clinical internship where doctors perform procedures themselves on real patients under supervision, with flexible timing.',
    trainerSlugs: ['dr-iqra-fatima'],
    hero: {
      label: 'For MBBS & BDS doctors',
      headline: 'Course kar liya,',
      headlineAccent: 'lekin pehla patient inject karne ki himmat nahi?',
      subheadline:
        '1 week intensive training + 2 weeks clinical internship. You perform procedures yourself on real patients, under supervision. No separate internship fee.',
      ctaLabel: 'Syllabus WhatsApp par mangwayein',
    },
    whatsappMessage: academyMessages.invasive,
    painPoints: [
      { text: 'Course kar liya, lekin pehle real patient ka confidence nahi.' },
      { text: 'Lambi duties, wohi tankhwa. Job ke saath ek nayi skill.' },
      { text: 'Degree hai, lekin practice ruk gayi?' },
    ],
    audience: [
      'MBBS doctors',
      'Dentists (BDS)',
      'House officers',
      'Medical officers',
      'GPs',
      'Clinic owners',
      'Doctors returning after a career break',
    ],
    featured: [
      'Facial anatomy',
      'Injectables',
      'Dermal fillers',
      'PDO threads',
      'PRP',
      'Skin boosters',
      'Complication management',
    ],
    journey,
    highlights: [
      { text: 'You inject, not just watch: hands-on on real patients during the internship.' },
      {
        text: 'Complication management is part of the syllabus, and every internship procedure is supervised.',
      },
      { text: 'Dermatologist-led team. Lead Trainer: Dr. Iqra, Dermatologist.' },
      { text: 'Flexible timing for doctors on duty.' },
    ],
    // Website-safe wording: no drug names on pages that ads may point to (Meta reviews them).
    modules: [
      { title: 'Facial Anatomy & Physiology' },
      { title: 'Patient Assessment & Selection' },
      { title: 'Neuromodulator (anti-wrinkle) injections' },
      { title: 'Dermal Fillers' },
      { title: 'Threads (PDO)' },
      { title: 'Platelet Rich Plasma (PRP)' },
      { title: 'Skin Boosters & Mesotherapy' },
      { title: 'Fat Dissolving Injections' },
      { title: 'Advanced Injection Techniques' },
      { title: 'Complication Management & Emergency Protocols' },
      { title: 'Combination Treatments' },
      { title: 'Case Studies & Live Demonstrations' },
      { title: 'Aseptic Technique & Safety Standards' },
      { title: 'Post-Treatment Care' },
      { title: 'Business Development & Marketing' },
    ],
    glance: [
      {
        item: 'Eligibility',
        detail: 'MBBS & BDS doctors only (PMDC registered)',
        status: 'confirmed',
      },
      { item: 'Training', detail: '1 week intensive', status: 'confirmed' },
      {
        item: 'Clinical internship',
        detail: '2 weeks, doctors perform procedures on real patients, supervised, no extra fee',
        status: 'confirmed',
      },
      { item: 'Timing', detail: 'Flexible for doctors', status: 'confirmed' },
      {
        item: 'Batch start',
        detail: '20th of every month (no training on Sundays, so a Sunday start moves to Monday)',
        status: 'confirmed',
      },
      { item: 'Campus', detail: 'Iqbal Town, Lahore', status: 'confirm' },
      { item: 'Seats', detail: 'Max 20 doctors', status: 'confirmed' },
    ],
    filterLine:
      'Invasive training sirf MBBS & BDS doctors ke liye hai. Non-medical candidates ke liye hamara Non-Invasive course available hai.',
    feeDisplay: 'whatsapp',
    metaTitle: 'Aesthetic Medicine Course for Doctors in Lahore',
    metaDescription:
      'For MBBS & BDS doctors: 1 week training + 2 weeks clinical internship on real patients. Fillers, threads, PRP. Flexible timing.',
  },
]

const ni = 'non-invasive-aesthetics-course'
const inv = 'invasive-aesthetics-course-for-doctors'

export const faqs: FaqSeed[] = [
  {
    question: 'Kya ye treatment ke liye hai?',
    answer:
      'Nahi. Ye training academy hai. Treatments ke liye French Medical Aesthetics clinic se rabta karein.',
  },
  {
    question: 'Internship ki fee alag hai?',
    answer: 'Nahi. 2 weeks internship course mein shamil hai.',
  },
  { question: 'Ek batch mein kitne students?', answer: 'Maximum 20.' },
  {
    question: 'Academy kahan hai?',
    answer: 'Iqbal Town, Lahore. DHA Phase 4 campus bhi open hai.',
  },
  {
    question: 'Doosre shehar se aa sakte hain?',
    answer: 'Ji haan. Students Gujranwala, Sialkot, Kasur aur Daska se aate hain.',
  },
  {
    question: 'Fee kitni hai?',
    answer: 'Fee aur details WhatsApp par batayi jayengi.',
    status: 'confirm' as const,
  },
  {
    courseSlug: ni,
    question: 'Pehle se experience nahi, kya seekh sakte hain?',
    answer: 'Ji haan. Training basics se shuru hoti hai, step by step.',
  },
  {
    courseSlug: ni,
    question: 'Sirf class hogi ya khud bhi karenge?',
    answer:
      '1 week hands-on training, phir 2 weeks internship live clients par, doctors ki supervision mein.',
  },
  {
    courseSlug: ni,
    question: 'Kya seekhenge?',
    answer:
      'HydraFacial, BB Glow, Chemical Peels, HIFU, Laser Hair Removal, skin analysis aur client consultation.',
  },
  {
    courseSlug: ni,
    question: 'Galti ho gayi to?',
    answer: 'Har qadam pe supervision hoti hai, aap akele nahi hote.',
  },
  { courseSlug: inv, question: 'Kaun join kar sakta hai?', answer: 'Sirf MBBS aur BDS doctors.' },
  {
    courseSlug: inv,
    question: 'Kya main khud procedures karunga / karungi?',
    answer: 'Ji haan. 2 weeks clinical internship mein real patients par, supervision ke saath.',
  },
  {
    courseSlug: inv,
    question: 'Job ke saath ho sakta hai?',
    answer: 'Ji haan, doctors ke liye timing flexible hai.',
  },
  {
    courseSlug: inv,
    question: 'Complications ki training hogi?',
    answer: 'Ji haan. Complication management aur emergency protocols syllabus ka hissa hain.',
  },
  {
    courseSlug: inv,
    question: 'Kai saal se practice nahi ki?',
    answer: 'Training facial anatomy aur patient assessment ke refresh se shuru hoti hai.',
  },
  {
    courseSlug: inv,
    question: 'Sikhata kaun hai?',
    answer: 'Dermatologist-led team. Lead Trainer: Dr. Iqra, Dermatologist.',
  },
].map((faq, i) => ({
  business: 'academy' as const,
  status: 'confirmed' as const,
  order: i + 1,
  ...faq,
}))

const day = (key: string) => `${key}T12:00:00.000Z`
const iqbalTown = 'allama-iqbal-town-lahore'

// Non-Invasive on the 15th, Invasive on the 20th; a Sunday start moves to Monday (owner, 28 Oct 2026).
export const batches: BatchSeed[] = [
  {
    courseSlug: ni,
    startDate: day('2026-11-16'),
    campusSlug: iqbalTown,
    factStatus: 'confirmed' as const,
  },
  {
    courseSlug: inv,
    startDate: day('2026-11-20'),
    campusSlug: iqbalTown,
    internalNote:
      'The owner rule of 28 Oct puts the Invasive batch on the 20th; the date confirmed before that was Mon 23 Nov. Confirm which applies. Campus assumed Iqbal Town.',
  },
  { courseSlug: ni, startDate: day('2026-12-15') },
  {
    courseSlug: inv,
    startDate: day('2026-12-21'),
    internalNote:
      '20 Dec is a Sunday, so the start moved to Monday. 25 Dec (public holiday) falls in the training week.',
  },
  { courseSlug: ni, startDate: day('2027-01-15') },
  { courseSlug: inv, startDate: day('2027-01-20') },
  { courseSlug: ni, startDate: day('2027-02-15') },
  { courseSlug: inv, startDate: day('2027-02-20') },
].map((batch) => ({
  totalSeats: 20,
  seatsTaken: 0,
  status: 'open' as const,
  factStatus: 'confirm' as const,
  ...batch,
}))
