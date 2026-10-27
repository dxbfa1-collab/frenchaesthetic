import { notFound } from 'next/navigation'

// Unknown clinic addresses render the 404 inside the clinic layout.
export default function UnknownClinicPage() {
  notFound()
}
