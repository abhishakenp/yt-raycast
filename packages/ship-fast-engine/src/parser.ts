// Tiny openui-lang skeleton analysis. The skeleton defines `root` plus forward
// references to per-module subtree ids; we extract those undefined references so
// each becomes a parallel fan-out target.

const STRING_RE = /"(?:[^"\\]|\\.)*"/g
const DEFINE_RE = /^\s*([A-Za-z_]\w*)\s*=/
// Capture an identifier plus the next significant char so we can classify it.
const IDENT_RE = /([A-Za-z_]\w*)\s*([(:.]?)/g

const LITERALS = new Set(['true', 'false', 'null'])

export function stripFences(text: string): string {
  let t = text.trim()
  // strip reasoning traces some models emit (e.g. qwen3 <think>…</think>)
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, '')
  // strip ```lang … ``` code fences if the model added them
  t = t.replace(/```[\w-]*\s*/g, '').replace(/```\s*$/g, '')
  return t.trim()
}

export function humanize(id: string): string {
  return id
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(page|section|content|module|tab)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

export interface PlanItem {
  id: string
  label: string
}

/**
 * The fan-out plan: each forward-ref (page/section) to generate, paired with a
 * human label. If the root is AppShell(name, [navLabels], [pageIds]), pages are
 * zipped with their nav labels; otherwise labels are derived from the ids.
 */
export function extractPlan(skeleton: string): PlanItem[] {
  const groups = [...skeleton.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1])
  const navGroup = groups.find((g) => /"/.test(g))
  const pageGroup = groups.find((g) => !/"/.test(g) && /[A-Za-z_]\w*/.test(g))
  if (navGroup && pageGroup) {
    const labels = [...navGroup.matchAll(STRING_RE)].map((m) =>
      m[0].slice(1, -1),
    )
    const ids = pageGroup
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[A-Za-z_]\w*$/.test(s))
    if (ids.length > 0)
      return ids.map((id, i) => ({ id, label: labels[i] ?? humanize(id) }))
  }
  return extractChildIds(skeleton).map((id) => ({ id, label: humanize(id) }))
}

/** Identifiers referenced by the skeleton but never defined in it — the modules to fan out. */
export function extractChildIds(skeleton: string): string[] {
  const defined = new Set<string>()
  const referenced = new Set<string>()
  for (const rawLine of skeleton.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const def = line.match(DEFINE_RE)
    const lhs = def?.[1]
    if (lhs) defined.add(lhs)
    const rhs = (def ? line.slice(line.indexOf('=') + 1) : line).replace(
      STRING_RE,
      ' ',
    )
    for (const m of rhs.matchAll(IDENT_RE)) {
      const id = m[1]
      const next = m[2]
      // next === "(" -> Component call, next === ":" -> object key, next === "." -> member base (skip field)
      if (next === '(' || next === ':') continue
      if (LITERALS.has(id)) continue
      referenced.add(id)
    }
  }
  return [...referenced].filter((id) => !defined.has(id) && id !== 'root')
}
