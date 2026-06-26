/**
 * Disposable / throwaway email detection.
 *
 * Used to make sure a referral only counts toward the "refer 2 paying users →
 * 50% off for life" reward when the referred account uses a real mailbox, not a
 * burner like mailinator / yopmail. This is a secondary guard — paying with a
 * real card is the primary one — but it stops the most common way of gaming the
 * referral program with throwaway inboxes.
 *
 * This file is the single source of truth and is imported by both the Convex
 * backend and the frontend, so it must stay dependency-free and pure.
 */

/**
 * Curated list of the most common disposable / temporary email domains.
 * Kept intentionally focused on high-volume providers (and their many aliases)
 * rather than trying to be exhaustive — an exhaustive list belongs in a data
 * file, but this covers the burners people actually reach for.
 */
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Mailinator + known aliases
  'mailinator.com',
  'mailinator.net',
  'mailinator.org',
  'mailinator2.com',
  'reallymymail.com',
  'sogetthis.com',
  'spamherelots.com',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailin8r.com',
  'notmailinator.com',
  'thisisnotmyrealemail.com',
  'tradermail.info',
  'veryrealemail.com',
  // YOPmail + aliases
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  // Guerrilla Mail family
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.info',
  'grr.la',
  'sharklasers.com',
  'spam4.me',
  'pokemail.net',
  // 10 minute / temp mail style
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '20minutemail.com',
  '20minutemail.it',
  '30minutemail.com',
  'temp-mail.org',
  'temp-mail.io',
  'temp-mail.ru',
  'tempmail.com',
  'tempmail.net',
  'tempmailo.com',
  'tempmail.plus',
  'tempr.email',
  'tempail.com',
  'tempinbox.com',
  'tmpmail.org',
  'tmpmail.net',
  'tmpeml.com',
  'minuteinbox.com',
  'getnada.com',
  'nada.email',
  'dispostable.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'trashmail.com',
  'trashmail.de',
  'trashmail.net',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'mailnesia.com',
  'maildrop.cc',
  'mailcatch.com',
  'inboxbear.com',
  'throwawaymail.com',
  'throwam.com',
  'mohmal.com',
  'mailsac.com',
  'emailondeck.com',
  'mailnull.com',
  'spambog.com',
  'spambog.de',
  'spambog.ru',
  'mytemp.email',
  'discard.email',
  'discardmail.com',
  'discardmail.de',
  'mailexpire.com',
  'spamgourmet.com',
  'mintemail.com',
  'tempemail.co',
  'tempemails.io',
  'burnermail.io',
  '33mail.com',
  'anonbox.net',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'mailbox52.ga',
  'emltmp.com',
  'inboxkitten.com',
  'mailpoof.com',
  'luxusmail.org',
  'tijdelijkmailadres.nl',
  'spamdecoy.net',
  'getairmail.com',
  'mailhole.de',
  'emailfake.com',
  'fakemail.net',
  'mail-temp.com',
  'moakt.com',
  'mailtemp.info',
  'temporary-mail.net',
  'harakirimail.com',
  'incognitomail.com',
  'mailcuk.com',
  'vmani.com',
])

const EMAIL_RE = /^[^\s@]+@([^\s@]+)$/

/**
 * Extract and normalize the domain portion of an email (lowercased, trimmed).
 * Returns `null` for anything that is not shaped like an email.
 */
export const extractEmailDomain = (email: string): string | null => {
  const match = EMAIL_RE.exec(
    String(email ?? '')
      .trim()
      .toLowerCase(),
  )
  return match ? match[1] : null
}

/**
 * True when the email's domain is a known disposable / throwaway provider.
 * Also treats an unparseable / empty email as disposable=false here so callers
 * can decide separately whether a malformed email is acceptable — use
 * `isValidEmail` for shape validation.
 */
export const isDisposableEmail = (email: string): boolean => {
  const domain = extractEmailDomain(email)
  if (domain === null) return false
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true
  // Catch obvious sub-domained burners, e.g. "foo.mailinator.com".
  for (const blocked of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true
  }
  return false
}

/** Basic structural email validation (not deliverability). */
export const isValidEmail = (email: string): boolean =>
  extractEmailDomain(email) !== null

/**
 * Classify an email for referral-qualification purposes.
 * `acceptable` is true only when the email parses AND is not disposable.
 */
export const classifyReferralEmail = (
  email: string | null | undefined,
): {
  email: string
  valid: boolean
  disposable: boolean
  acceptable: boolean
} => {
  const normalized = String(email ?? '')
    .trim()
    .toLowerCase()
  const valid = isValidEmail(normalized)
  const disposable = isDisposableEmail(normalized)
  return {
    email: normalized,
    valid,
    disposable,
    acceptable: valid && !disposable,
  }
}
