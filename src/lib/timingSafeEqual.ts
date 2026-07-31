/**
 * Constant-time string comparison to prevent timing attacks.
 *
 * Returns `true` when both strings are byte-equal. The comparison always
 * processes every character regardless of where the first difference occurs,
 * so an attacker cannot measure response time to discover the secret
 * character-by-character.
 */
export function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let diff = 0
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return diff === 0
}
