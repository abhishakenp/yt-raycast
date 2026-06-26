import { generatePrompt } from '@openuidev/lang-core'
import componentSpec from './generated/component-spec.json' with { type: 'json' }

const SPEC = componentSpec

const PREAMBLE = `You generate user interfaces as openui-lang for a real product builder.
Compose the provided shadcn components into polished, production-quality screens.
Invent realistic, specific content (names, numbers, copy) — never lorem ipsum or "Item 1".
Favour clear visual hierarchy: Section/Stack/Grid for layout, Card to group, Heading/Text for copy.`

export const ALWAYS_INCLUDE = [
  'Stack',
  'Grid',
  'Box',
  'Section',
  'Spacer',
  'Heading',
  'Text',
  'Button',
  'Card',
  'Badge',
  'Tabs',
  'Separator',
]

const RULES = [
  'Break a multi-feature app into distinct PAGES/MODULES. Use Tabs at the top level to switch modules when there is more than one.',
  'Prefer references over deep inlining: define a child on its own line and reference it by name for better streaming.',
  'Every defined identifier (except root) MUST be referenced from root, directly or transitively.',
  'Use Grid for card collections (stats, products, features); use Stack for vertical flow.',
]

const EXAMPLES = [
  `root = Stack([hero, stats])
hero = Section([h, sub])
h = Heading("Acme Analytics", "1")
sub = Text("Real-time insight into your store.", "muted")
stats = Grid([s1, s2, s3], "3")
s1 = Card([], "Revenue", "$48,210 this month")
s2 = Card([], "Orders", "1,284 orders")
s3 = Card([], "Customers", "9,402 active")`,
]

function specWith(components) {
  return {
    ...SPEC,
    components,
    preamble: PREAMBLE,
    additionalRules: RULES,
    examples: EXAMPLES,
    toolCalls: false,
    bindings: false,
  }
}

export function fullSystemPrompt() {
  return generatePrompt(specWith(SPEC.components))
}

export function filteredSystemPrompt(names) {
  if (!names || names.length === 0) return fullSystemPrompt()
  const keep = new Set([...ALWAYS_INCLUDE, ...names])
  const components = {}
  for (const [name, spec] of Object.entries(SPEC.components)) {
    if (keep.has(name)) components[name] = spec
  }
  return generatePrompt(specWith(components))
}

export function pageSystemPrompt(chosenBlock) {
  return filteredSystemPrompt([chosenBlock, 'PageSwitch'])
}

export function pageUser(brand, navLabels, page, tagline) {
  const navJson = JSON.stringify(navLabels)
  return `Brand: ${brand}
Tagline: ${tagline}
Site navigation (reuse VERBATIM): ${navJson}
This page: "${page.label}" — ${page.brief}

Output ONLY ONE statement, nothing else:
${page.id} = ${page.block}({...props})

Rules:
- Fill EVERY content field of ${page.block}'s signature with rich, specific, on-prompt copy and data — no placeholders, no lorem ipsum, no "Item 1".
- The first two arguments MUST be exactly ${JSON.stringify(brand)} then ${navJson} (verbatim).
- Write numbers/currency PLAINLY ($48 or 1,245) — never LaTeX or markdown.
- NO styling, NO image src, NO urls, NO className. The block owns all design, images, and nav wiring.
- Output openui-lang only. No markdown, no code fences, no extra statements.`
}

export function componentCatalog() {
  return Object.entries(SPEC.components).map(([name, s]) => ({
    name,
    description: s.description,
  }))
}

export function normalizePromptText(prompt) {
  return typeof prompt === 'string' ? prompt.trim() : ''
}

export function requirePromptText(prompt) {
  const normalizedPrompt = normalizePromptText(prompt)
  if (!normalizedPrompt) throw new Error('Prompt is required.')
  return normalizedPrompt
}

export function promptSnippet(prompt, maxLength = 80, fallback = '') {
  const normalizedPrompt = normalizePromptText(prompt)
  if (!normalizedPrompt) return fallback
  return normalizedPrompt.slice(0, maxLength)
}
