/**
 * Normalises a phone number typed by a visitor. Pakistani mobiles in any common form
 * (0311 2748804, 92 311 2748804, +92-311-2748804) become +923112748804; other countries
 * keep their own code. Returns null when it cannot be a phone number.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  let international: string
  if (trimmed.startsWith('+')) international = digits
  else if (digits.startsWith('00')) international = digits.slice(2)
  else if (digits.startsWith('03') && digits.length === 11) international = `92${digits.slice(1)}`
  else if (digits.startsWith('3') && digits.length === 10) international = `92${digits}`
  else international = digits

  if (international.startsWith('92'))
    return /^923\d{9}$/.test(international) ? `+${international}` : null
  return international.length >= 10 && international.length <= 15 ? `+${international}` : null
}
