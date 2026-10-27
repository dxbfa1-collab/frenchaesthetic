/** The id of a relationship value, whether it is stored as an id or populated as a document. */
export function relationId(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value)
    return String((value as { id: unknown }).id)
  return undefined
}
