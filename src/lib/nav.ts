export type NavItem = { label: string; href: string }

/*
  Menus for each side. Several targets are built in later phases (treatments, doctors and branches
  in Phase 2; courses, batches and faculty in Phase 3; shared pages and policies in Phase 4).
*/

export const clinicNav: NavItem[] = [
  { label: 'Treatments', href: '/clinic/treatments' },
  { label: 'Concerns', href: '/clinic/concerns' },
  { label: 'Doctors', href: '/clinic/doctors' },
  { label: 'Branches', href: '/clinic/branches' },
  { label: 'Book a Consultation', href: '/clinic/book' },
]

export const clinicMoreNav: NavItem[] = [
  { label: 'Technology', href: '/clinic/technology' },
  { label: 'FAQ', href: '/clinic/faq' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/** Clinic sections that link only when they have something to show (see getClinicSections). */
const CLINIC_SECTION_PAGES: Record<string, 'treatments' | 'concerns' | 'doctors' | 'technology'> = {
  '/clinic/treatments': 'treatments',
  '/clinic/concerns': 'concerns',
  '/clinic/doctors': 'doctors',
  '/clinic/technology': 'technology',
}

export function withContent(
  items: NavItem[],
  sections: Record<'treatments' | 'concerns' | 'doctors' | 'technology', boolean>,
): NavItem[] {
  return items.filter((item) => {
    const section = CLINIC_SECTION_PAGES[item.href]
    return !section || sections[section]
  })
}

export const academyNav: NavItem[] = [
  { label: 'Courses', href: '/academy/courses' },
  { label: 'Internship', href: '/academy/internship' },
  { label: 'Batches', href: '/academy/batches' },
  { label: 'Faculty', href: '/academy/faculty' },
  { label: 'Contact', href: '/academy/contact' },
]

export const academyCourseNav: NavItem[] = [
  { label: 'Non-Invasive Aesthetics Course', href: '/academy/non-invasive-aesthetics-course' },
  {
    label: 'Invasive Aesthetics Course for Doctors',
    href: '/academy/invasive-aesthetics-course-for-doctors',
  },
]

export const academyMoreNav: NavItem[] = [
  ...academyCourseNav,
  { label: 'About the Academy', href: '/academy/about' },
  { label: 'FAQ', href: '/academy/faq' },
  { label: 'Enroll', href: '/academy/enroll' },
]

export const policyNav: NavItem[] = [
  { label: 'Privacy', href: '/policies/privacy' },
  { label: 'Terms', href: '/policies/terms' },
  { label: 'Refunds', href: '/policies/refunds' },
  { label: 'Cancellations', href: '/policies/cancellations' },
]
