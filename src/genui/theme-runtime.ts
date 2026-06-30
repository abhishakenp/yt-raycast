import type { ThemeStyleProps, ThemeStyles } from './theme-presets'

// Runtime-only helpers for painting an already-resolved theme onto a preview.
// Keep this module independent of theme-presets so dashboard shells can render
// without pulling the full preset catalog.
export const THEME_VAR_KEYS: readonly string[] = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'font-sans',
  'font-serif',
  'font-mono',
  'radius',
  'shadow-color',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
  'spacing',
]

function setVars(root: HTMLElement, props: Partial<ThemeStyleProps>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value != null) root.style.setProperty(`--${key}`, String(value))
  }
}

export function clearThemeVars(root: HTMLElement): void {
  for (const key of THEME_VAR_KEYS) root.style.removeProperty(`--${key}`)
}

export function applyThemeVars(
  root: HTMLElement,
  styles: ThemeStyles,
  isDark: boolean,
): void {
  clearThemeVars(root)
  setVars(root, styles.light)
  if (isDark) setVars(root, styles.dark)
  if (isDark) {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

const SYSTEM_FONT_RE =
  /^(ui-|system|-apple|blinkmac|segoe|roboto$|helvetica|arial|sans-serif|serif|monospace|menlo|consolas|courier|georgia|cambria|times)/i

function familiesFromStyles(styles: ThemeStyles): string[] {
  const out = new Set<string>()
  for (const variant of [styles.light, styles.dark]) {
    for (const key of ['font-sans', 'font-serif', 'font-mono'] as const) {
      const raw = (variant as Partial<ThemeStyleProps>)[key]
      if (typeof raw !== 'string') continue
      const first = raw
        .split(',')[0]
        ?.trim()
        .replace(/^["']|["']$/g, '')
      if (first && !SYSTEM_FONT_RE.test(first)) out.add(first)
    }
  }
  return [...out]
}

export function injectThemeFonts(doc: Document, styles: ThemeStyles): void {
  const families = familiesFromStyles(styles)
  for (const n of doc.head.querySelectorAll('[data-theme-font]')) n.remove()
  if (!families.length) return
  const params = families
    .map(
      (family) =>
        `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700`,
    )
    .join('&')
  const link = doc.createElement('link')
  link.setAttribute('data-theme-font', '')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`
  doc.head.appendChild(link)
}
