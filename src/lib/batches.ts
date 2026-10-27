/** Academy batch rules. The start days come from Site settings → Academy → Batch start days. */

const ordinalRules = new Intl.PluralRules('en-GB', { type: 'ordinal' })
const ORDINAL_SUFFIX: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' }
const listFormat = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' })

/** 15 → "15th", 22 → "22nd". */
export function ordinal(n: number): string {
  return `${n}${ORDINAL_SUFFIX[ordinalRules.select(n)] ?? 'th'}`
}

/** "New batches on the 15th and 20th of every month", or a general line when no days are set. */
export function batchStartLine(days: number[] | null | undefined): string {
  const sorted = [...new Set(days ?? [])].sort((a, b) => a - b)
  if (sorted.length === 0) return 'New batches every month'
  return `New batches on the ${listFormat.format(sorted.map(ordinal))} of every month`
}
