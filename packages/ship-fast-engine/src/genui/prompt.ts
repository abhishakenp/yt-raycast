import { generatePrompt, type PromptSpec } from "@openuidev/lang-core"
import componentSpec from "./generated/component-spec.json"

// Component spec emitted by `@openuidev/cli generate --json-schema` (regenerate via
// `pnpm genui:spec`). No React deps — safe to import in the server route.
const SPEC = componentSpec as PromptSpec

// Server-side system-prompt assembly. Built from the generated SPEC (signatures +
// descriptions) so we never import React renderers on the server.

const PREAMBLE = `You generate user interfaces as openui-lang for a real product builder.
Compose the provided shadcn components into polished, production-quality screens.
Invent realistic, specific content (names, numbers, copy) — never lorem ipsum or "Item 1".
Favour clear visual hierarchy: Section/Stack/Grid for layout, Card to group, Heading/Text for copy.`

// Always available regardless of router filtering — layout spine + ubiquitous atoms.
export const ALWAYS_INCLUDE = [
  "Stack",
  "Grid",
  "Box",
  "Section",
  "Spacer",
  "Heading",
  "Text",
  "Button",
  "Card",
  "Badge",
  "Tabs",
  "Separator",
]

const RULES = [
  "Break a multi-feature app into distinct PAGES/MODULES. Use Tabs at the top level to switch modules when there is more than one.",
  "Prefer references over deep inlining: define a child on its own line and reference it by name for better streaming.",
  "Every defined identifier (except root) MUST be referenced from root, directly or transitively.",
  "Use Grid for card collections (stats, products, features); use Stack for vertical flow.",
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

function specWith(components: PromptSpec["components"]): PromptSpec {
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

/** Full prompt with every registered component. */
export function fullSystemPrompt(): string {
  return generatePrompt(specWith(SPEC.components))
}

/** Prompt filtered to a relevant subset (+ always-included spine) for token efficiency. */
export function filteredSystemPrompt(names: string[] | null): string {
  if (!names || names.length === 0) return fullSystemPrompt()
  const keep = new Set([...ALWAYS_INCLUDE, ...names])
  const components: PromptSpec["components"] = {}
  for (const [name, spec] of Object.entries(SPEC.components)) {
    if (keep.has(name)) components[name] = spec
  }
  return generatePrompt(specWith(components))
}

/**
 * Per-page system prompt for the orchestrator's parallel content calls: the
 * chosen page block + the always-included spine + PageSwitch, so a page call
 * stays focused on filling one block's content (and the prompt stays small).
 */
export function pageSystemPrompt(chosenBlock: string): string {
  return filteredSystemPrompt([chosenBlock, "PageSwitch"])
}

/** Compact catalog (name + description) for the router call. */
export function componentCatalog(): Array<{ name: string; description?: string }> {
  return Object.entries(SPEC.components).map(([name, s]) => ({
    name,
    description: s.description,
  }))
}
