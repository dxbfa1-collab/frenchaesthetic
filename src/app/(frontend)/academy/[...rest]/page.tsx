import { notFound } from 'next/navigation'

// Unknown academy addresses render the 404 inside the academy layout.
export default function UnknownAcademyPage() {
  notFound()
}
