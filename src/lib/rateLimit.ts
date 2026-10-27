/**
 * A small in-memory limit per visitor IP for the public forms. Hostinger runs one Node process,
 * so memory is shared by every request; a restart simply clears it.
 */
const hits = new Map<string, number[]>()

export function tooManyAttempts(key: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return recent.length > limit
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
  )
}
