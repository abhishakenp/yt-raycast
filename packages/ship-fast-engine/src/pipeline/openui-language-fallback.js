import { translateTexts } from '../llm/translator.js'

const DEFAULT_LABELS = {
  eyebrow: 'Localized website',
  heading: 'Your website',
  intro: 'A focused website generated from your brief.',
  primaryCta: 'Explore classes',
  secondaryCta: 'Contact us',
  sections: ['Overview', 'Classes', 'Membership', 'Team', 'Contact'],
}

const HINDI_LABELS = {
  eyebrow: 'हिंदी वेबसाइट',
  heading: 'आपकी वेबसाइट',
  intro: 'आपके विवरण के आधार पर तैयार की गई वेबसाइट।',
  primaryCta: 'कक्षाएँ देखें',
  secondaryCta: 'संपर्क करें',
  sections: ['परिचय', 'कक्षाएँ', 'सदस्यता', 'प्रशिक्षक', 'संपर्क'],
}

const stripLanguageBlock = (prompt = '') => String(prompt).split('\n---\n')[0]?.trim() || String(prompt).trim()

const esc = (value) => JSON.stringify(String(value ?? ''))

const labelsForCode = (code) => {
  if (String(code || '').toLowerCase().split('-')[0] === 'hi') return HINDI_LABELS
  return DEFAULT_LABELS
}

export const buildLocalizedPrimitiveOpenUISource = ({ brand, prompt, labels = DEFAULT_LABELS } = {}) => {
  const safeBrand = String(brand || labels.heading || 'Website').trim()
  const promptLine = stripLanguageBlock(prompt)
  const intro = String(labels.intro || promptLine || DEFAULT_LABELS.intro).trim()
  const sections = Array.isArray(labels.sections) && labels.sections.length
    ? labels.sections.slice(0, 5)
    : DEFAULT_LABELS.sections

  const sectionNodes = sections
    .map(
      (section) =>
        `Box([Heading(${esc(section)}, "3"), Text(${esc(intro)}, "muted")], "rounded-3xl border border-border bg-card p-6 shadow-sm")`,
    )
    .join(', ')

  return `root = Stack([
  Box([
    Text(${esc(labels.eyebrow)}, "muted", "text-sm font-semibold uppercase tracking-[0.24em]"),
    Heading(${esc(safeBrand)}, "1", "max-w-4xl text-5xl font-black tracking-tight md:text-7xl"),
    Text(${esc(promptLine || intro)}, "muted", "max-w-3xl text-lg"),
    Stack([
      Text(${esc(labels.primaryCta)}, "default", "rounded-full bg-primary px-5 py-3 text-primary-foreground"),
      Text(${esc(labels.secondaryCta)}, "default", "rounded-full border border-border px-5 py-3")
    ], "row", "sm", "start", "start", true, "pt-4")
  ], "mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-6 px-6 py-20"),
  Grid([${sectionNodes}], "2", "lg", "mx-auto max-w-6xl px-6 pb-20")
], "col", "xl", "stretch", "start", false, "min-h-screen bg-background text-foreground")`
}

export const resolveLocalizedPrimitiveLabels = async (languageMode) => {
  const code = String(languageMode?.code || 'en').toLowerCase()
  const base = labelsForCode(code)
  if (code === 'en' || code.startsWith('hi')) return base

  try {
    const originals = [
      DEFAULT_LABELS.eyebrow,
      DEFAULT_LABELS.intro,
      DEFAULT_LABELS.primaryCta,
      DEFAULT_LABELS.secondaryCta,
      ...DEFAULT_LABELS.sections,
    ]
    const translations = await translateTexts(originals, languageMode)
    return {
      eyebrow: translations[DEFAULT_LABELS.eyebrow] || base.eyebrow,
      heading: base.heading,
      intro: translations[DEFAULT_LABELS.intro] || base.intro,
      primaryCta: translations[DEFAULT_LABELS.primaryCta] || base.primaryCta,
      secondaryCta: translations[DEFAULT_LABELS.secondaryCta] || base.secondaryCta,
      sections: DEFAULT_LABELS.sections.map((section) => translations[section] || section),
    }
  } catch {
    return base
  }
}
