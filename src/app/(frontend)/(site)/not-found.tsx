import { NotFoundContent } from '@/components/layout/NotFoundContent'

export default function NotFound() {
  return (
    <NotFoundContent
      primary={{ href: '/clinic', label: 'Visit the Clinic' }}
      secondary={{ href: '/academy', label: 'Explore the Academy' }}
    />
  )
}
