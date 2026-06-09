import { defaultPresets, type ThemeStyleProps, type ThemeStyles } from "./theme-presets"

// Theme runtime: the names the AI may pick from, a human/AI-facing description of
// each theme's vibe (so the SAME plan call that picks blocks can pick the best
// theme by mood), and the DOM apply logic that paints a theme onto the preview
// (iframe document or screenshot wrapper) by overriding CSS custom properties.
// Nothing here touches the app chrome — themes scope to the generated preview only.

// Every CSS custom property a preset can define. We clear the full set before
// applying a new theme so stale vars from a previous theme never linger.
export const THEME_VAR_KEYS: readonly string[] = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "font-sans",
  "font-serif",
  "font-mono",
  "radius",
  "shadow-color",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "letter-spacing",
  "spacing",
]

// One-line vibe per theme so the planner can match a build request to a palette.
// Keep these specific (mood + when it fits) — they are the relevance signal.
const THEME_DESCRIPTIONS: Record<string, string> = {
  "modern-minimal": "Clean white, blue accent, neutral grays — versatile SaaS/startup default.",
  "violet-bloom": "Soft white with a vivid purple primary, rounded and friendly — modern product/app.",
  "t3-chat": "Warm pink-magenta on cream — playful, chatty, consumer/creator brands.",
  twitter: "Crisp white with sky-blue primary — social, news, communication products.",
  "mocha-mousse": "Earthy taupe and warm browns — cozy, organic, artisan/coffee/wellness.",
  bubblegum: "Bright pink + cyan candy palette, shadows pop — fun, youthful, playful brands.",
  "amethyst-haze": "Muted lavender and dusty rose — calm, elegant, refined feminine feel.",
  notebook: "Hand-drawn paper look, sketchy grays, handwriting font — quirky, personal, indie.",
  "doom-64": "Gritty industrial grays with blood-red — bold gaming, retro tech, edgy.",
  catppuccin: "Soft pastel lavender on muted base — gentle, developer-loved, cozy modern.",
  graphite: "Monochrome grays, understated — neutral, professional, content-forward.",
  perpetuity: "Teal monospace, terminal vibe — technical, cyber, data/infra products.",
  "kodama-grove": "Sage green on warm parchment, serif — natural, botanical, calm earthy.",
  "cosmic-night": "Indigo/violet on near-white, starry — futuristic, premium, space/AI.",
  tangerine: "Warm orange primary on cool gray-blue — energetic, optimistic, productivity.",
  "quantum-rose": "Hot magenta-pink, glossy — bold beauty, fashion, vibrant consumer.",
  nature: "Forest green on warm cream — organic, eco, outdoors, sustainability.",
  "bold-tech": "Electric violet on white, confident — modern tech, SaaS, developer tools.",
  "elegant-luxury": "Deep maroon + gold on ivory, serif — premium, fashion, fine dining, luxury.",
  "amber-minimal": "Clean white with amber-gold accent — warm minimal, finance, professional.",
  supabase: "Near-white with signature green — developer platform, infra, clean tech.",
  "neo-brutalism": "Stark black borders, primary red/yellow/blue, hard shadows — loud, bold, editorial.",
  "solar-dusk": "Sandy warm neutrals with burnt orange — desert, rustic, warm craft brands.",
  claymorphism: "Soft clay neutrals, big rounded radius, indigo — friendly, tactile, soft modern.",
  cyberpunk: "Neon magenta + cyan on dark — futuristic, gaming, nightlife, edgy tech.",
  "pastel-dreams": "Dreamy lavender pastels, very rounded — soft, gentle, lifestyle, kids.",
  "clean-slate": "Cool slate + indigo on light — corporate, trustworthy, dashboard, SaaS.",
  caffeine: "Warm coffee browns and cream — café, roastery, cozy hospitality.",
  "ocean-breeze": "Fresh aqua-green on airy blue-white — coastal, health, fresh, wellness.",
  "retro-arcade": "Solarized teal/magenta retro — playful nostalgic, games, creative.",
  "midnight-bloom": "Royal purple on light, floral — elegant evening, events, boutique.",
  candyland: "Pink + sky-blue + yellow candy — joyful, kids, sweets, party.",
  "northern-lights": "Emerald + blue aurora tones — fresh, vibrant, nature-tech.",
  "vintage-paper": "Aged parchment, sepia browns, serif — heritage, editorial, classic, books.",
  "sunset-horizon": "Coral-to-peach warm gradient tones — warm lifestyle, travel, hospitality.",
  "starry-night": "Deep blue + gold, painterly serif — artistic, museum, premium evening.",
  claude: "Warm off-white with terracotta — humane, editorial, calm premium product.",
  vercel: "Pure black & white, Geist, ultra-minimal — sharp, modern, developer/agency.",
  darkmatter: "Charcoal with warm orange + teal, mono font — sleek dev/infra, dark-leaning.",
  mono: "All-monospace grayscale, zero radius — brutalist-minimal, technical, editorial.",
  "soft-pop": "Bright indigo/teal/amber on off-white, bold borders — energetic, modern, fun startup.",
  "sage-garden": "Muted sage green, refined serif, airy — calm, sophisticated, wellness, organic luxury.",
}

export interface ThemeCatalogEntry {
  name: string
  label: string
  description: string
}

export const THEME_NAMES: readonly string[] = Object.keys(defaultPresets)

// name + description shortlist handed to the planner (mirrors the block catalog).
export const THEME_CATALOG: ThemeCatalogEntry[] = THEME_NAMES.map((name) => ({
  name,
  label: defaultPresets[name].label ?? name,
  description: THEME_DESCRIPTIONS[name] ?? defaultPresets[name].label ?? name,
}))

export function isKnownTheme(name: unknown): name is string {
  return typeof name === "string" && name in defaultPresets
}

// Deterministic-ish random preset (variety) — the fallback when the AI gives no
// usable theme. Uses the same rng source the orchestrator threads everywhere.
export function pickRandomTheme(rng: () => number): string {
  const i = Math.min(THEME_NAMES.length - 1, Math.floor(rng() * THEME_NAMES.length))
  return THEME_NAMES[i]
}

export function resolveThemeStyles(name: string | null | undefined): ThemeStyles | null {
  if (!name || !(name in defaultPresets)) return null
  return defaultPresets[name].styles
}

export function themeLabel(name: string | null | undefined): string {
  if (!name || !(name in defaultPresets)) return "Default"
  return defaultPresets[name].label ?? name
}

function setVars(root: HTMLElement, props: Partial<ThemeStyleProps>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value != null) root.style.setProperty(`--${key}`, String(value))
  }
}

// Paint a theme onto `root` by overriding the design-token CSS vars inline (inline
// styles beat the synced :root/.dark stylesheet rules). In dark mode we overlay the
// preset's dark variant and add the `.dark` class so token-based dark variants fire.
export function clearThemeVars(root: HTMLElement): void {
  for (const key of THEME_VAR_KEYS) root.style.removeProperty(`--${key}`)
}

export function applyThemeVars(root: HTMLElement, styles: ThemeStyles, isDark: boolean): void {
  clearThemeVars(root)
  setVars(root, styles.light)
  if (isDark) setVars(root, styles.dark)
  if (isDark) {
    root.classList.add("dark")
    root.style.colorScheme = "dark"
  } else {
    root.classList.remove("dark")
    root.style.colorScheme = "light"
  }
}

// Best-effort web-font loading for a theme: pull family names out of the preset's
// Families that aren't on Google Fonts simply fall back — never blocks rendering.
const SYSTEM_FONT_RE =
  /^(ui-|system|-apple|blinkmac|segoe|roboto$|helvetica|arial|sans-serif|serif|monospace|menlo|consolas|courier|georgia|cambria|times)/i

function familiesFromStyles(styles: ThemeStyles): string[] {
  const out = new Set<string>()
  for (const variant of [styles.light, styles.dark]) {
    for (const key of ["font-sans", "font-serif", "font-mono"] as const) {
      const raw = (variant as Partial<ThemeStyleProps>)[key]
      if (typeof raw !== "string") continue
      const first = raw.split(",")[0]?.trim().replace(/^["']|["']$/g, "")
      if (first && !SYSTEM_FONT_RE.test(first)) out.add(first)
    }
  }
  return [...out]
}

export function injectThemeFonts(doc: Document, styles: ThemeStyles): void {
  const families = familiesFromStyles(styles)
  for (const n of doc.head.querySelectorAll("[data-theme-font]")) n.remove()
  if (!families.length) return
  const params = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&")
  const link = doc.createElement("link")
  link.setAttribute("data-theme-font", "")
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`
  doc.head.appendChild(link)
}
