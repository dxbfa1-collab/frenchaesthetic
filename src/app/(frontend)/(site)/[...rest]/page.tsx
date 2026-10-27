import { notFound } from 'next/navigation'

// Unknown shared addresses render the branded 404 inside the shared layout.
export default function UnknownPage() {
  notFound()
}
