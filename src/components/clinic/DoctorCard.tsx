import Link from 'next/link'

import { Pending } from '@/components/ui/Pending'
import { credentials, Portrait } from '@/components/ui/Portrait'
import type { Branch, Doctor } from '@/payload-types'

export const doctorBranches = (doctor: Doctor): Branch[] =>
  (doctor.worksAt ?? []).filter((b): b is Branch => typeof b === 'object' && b !== null)

export function DoctorCard({ doctor, as: Heading = 'h3' }: { doctor: Doctor; as?: 'h2' | 'h3' }) {
  const role = credentials(doctor)
  const branches = doctorBranches(doctor)

  return (
    <article className="relative flex items-center gap-6 border border-hairline bg-surface p-6 transition-colors hover:border-line sm:p-7">
      <Portrait person={doctor} />
      <div>
        <Heading className="text-[1.75rem] leading-tight">
          <Link
            href={`/clinic/doctors/${doctor.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            <Pending confirmed={doctor.status === 'confirmed'}>{doctor.name}</Pending>
          </Link>
        </Heading>
        {role && <p className="label mt-2 text-accent">{role}</p>}
        {branches.length > 0 && (
          <p className="mt-2 text-[0.9375rem]">
            {branches.map((b) => b.shortName || b.name).join(' · ')}
          </p>
        )}
      </div>
    </article>
  )
}
