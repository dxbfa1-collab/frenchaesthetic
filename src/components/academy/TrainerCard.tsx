import { Pending } from '@/components/ui/Pending'
import { credentials, Portrait } from '@/components/ui/Portrait'
import type { Doctor } from '@/payload-types'

export function TrainerCard({ trainer }: { trainer: Doctor }) {
  const role = credentials(trainer, trainer.trainerRole)

  return (
    <article className="flex items-center gap-6 border border-hairline bg-surface p-6 sm:p-7">
      <Portrait person={trainer} />
      <div>
        <h3 className="text-[1.75rem] leading-tight">
          <Pending confirmed={trainer.status === 'confirmed'}>{trainer.name}</Pending>
        </h3>
        {role && <p className="label mt-2 text-accent">{role}</p>}
        {trainer.teaches && <p className="mt-2 text-[0.9375rem]">{trainer.teaches}</p>}
      </div>
    </article>
  )
}
