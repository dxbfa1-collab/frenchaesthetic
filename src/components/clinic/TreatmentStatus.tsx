import { isStaging } from '@/lib/site'
import { treatmentIsLive } from '@/lib/treatments'
import type { Treatment } from '@/payload-types'

const LABELS: Record<Treatment['contentStatus'], string> = {
  ready: 'Draft · needs doctor sign-off',
  confirm: 'To confirm · is it offered?',
  historical: 'Historical · not reconfirmed',
}

/** Staging only: why a treatment is not on the live site yet. */
export function TreatmentStatus({
  treatment,
}: {
  treatment: Pick<Treatment, 'contentStatus' | 'medicalSignOff'>
}) {
  if (!isStaging || treatmentIsLive(treatment)) return null
  return (
    <span
      className="inline-flex items-center self-start rounded-sm border border-dashed border-line px-1.5 py-px font-sans text-[0.6875rem] font-bold uppercase not-italic tracking-[0.16em] text-muted"
      title="Hidden on the live site until it is Ready and a doctor has signed it off."
    >
      {LABELS[treatment.contentStatus]}
    </span>
  )
}
