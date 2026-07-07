export const SHIP_FAST_SITE_URL = 'https://ship-fast.io'

export const shipFastFooterLogoMarkup = (idPrefix = 'sfb') => {
  const g1 = `${idPrefix}-fg1`
  const g2 = `${idPrefix}-fg2`
  return `<span class="footer-branding__logo" aria-hidden="true"><svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#${g1})" opacity="0.9"/><path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#${g2})" opacity="0.8"/><path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#${g2})" opacity="0.8"/><path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#${g1})"/><path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7"/><circle cx="26" cy="16" r="2" fill="#c4b5fd"/><defs><linearGradient id="${g1}" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#a78bfa"/></linearGradient><linearGradient id="${g2}" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#6d28d9"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs></svg></span>`
}
