import { parseJsonObject } from '../planner.js'
import { sanitizeIslandFragment } from '../utils/postprocess.js'

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wordClamp(value, length) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (text.length <= length) return text
  const clipped = text.slice(0, length)
  return `${clipped.slice(0, clipped.lastIndexOf(' ') > 30 ? clipped.lastIndexOf(' ') : length).trim()}...`
}

function hexLuminance(hex) {
  const clean = String(hex || '').replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(clean)) return 0
  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(clean.slice(offset, offset + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function readableOn(hex) {
  return hexLuminance(hex) > 0.45 ? '#111827' : '#f8fafc'
}

function constrainIslandFragment(fragment, slot) {
  const narrow = slot === 'tertiary'
  const cols = narrow ? 'grid-cols-1' : 'md:grid-cols-2'
  const html = String(fragment || '')
    .replace(/\b(?:sm:|md:|lg:|xl:|2xl:)?grid-cols-(?:3|4|5|6|7|8|9|10|11|12)\b/g, cols)
    .replace(/\btext-(?:4xl|5xl|6xl|7xl|8xl|9xl)\b/g, narrow ? 'text-2xl' : 'text-3xl')
    .replace(/\bwhitespace-nowrap\b/g, 'whitespace-normal')
    .replace(/\b(?:min-)?w-\[[^\]]+\]/g, 'w-full')
  return `<div class="min-w-0 break-words [&_*]:min-w-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words">${html}</div>`
}

function defaultIsland(title, body, accent) {
  return `<div class="grid gap-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.22em] text-[${accent}]">${esc(title)}</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight">Live operating surface</h2>
      </div>
      <span class="rounded-full border border-[${accent}]/40 px-3 py-1 text-xs text-[${accent}]">online</span>
    </div>
    <p class="max-w-2xl text-sm leading-6 text-white/65">${esc(body)}</p>
    <div class="grid gap-3 md:grid-cols-3">
      <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p class="text-xs text-white/50">Queue</p><p class="mt-2 text-3xl font-semibold">128</p></div>
      <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p class="text-xs text-white/50">SLA</p><p class="mt-2 text-3xl font-semibold">99.3%</p></div>
      <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p class="text-xs text-white/50">Alerts</p><p class="mt-2 text-3xl font-semibold">7</p></div>
    </div>
  </div>`
}

export function parseIslandJson(content) {
  const parsed = parseJsonObject(content)
  if (!parsed || typeof parsed !== 'object') return null
  return {
    identity: sanitizeIslandFragment(parsed.identity || ''),
    primary: sanitizeIslandFragment(parsed.primary || ''),
    secondary: sanitizeIslandFragment(parsed.secondary || ''),
    tertiary: sanitizeIslandFragment(parsed.tertiary || ''),
  }
}

export function composeAppShellHtml({ brief, plan, route, islands = {} }) {
  const a = plan.visualWorld
  const onBg = readableOn(a.bg)
  const onSurface = readableOn(a.surface)
  const primary = constrainIslandFragment(islands.primary || defaultIsland('primary', plan.appIslands?.[0]?.contains || brief, a.accent), 'primary')
  const secondary = constrainIslandFragment(islands.secondary || defaultIsland('registry', plan.appIslands?.[1]?.contains || brief, a.accent2), 'secondary')
  const tertiary = constrainIslandFragment(islands.tertiary || defaultIsland('controls', plan.appIslands?.[2]?.contains || brief, a.accent), 'tertiary')
  const identity = islands.identity || `<div class="rounded-2xl border border-[${a.accent}]/30 bg-[${a.accent}]/10 p-4 text-sm text-[${a.text}]/75">The command view opens with live status, priority exceptions, and the next operator action in one readable frame.</div>`
  const fonts = encodeURIComponent(`${a.fontDisplay}:wght@400;500;600;700`) + '&family=' + encodeURIComponent(`${a.fontBody}:wght@400;500;600;700`)
  const reportCards = [
    ['Live Exceptions', plan.appIslands?.[0]?.contains || 'Highest-priority work stays visible.'],
    ['Operator Flow', plan.appIslands?.[1]?.contains || 'Tables and logs stay close to the decision surface.'],
    ['Recovery Path', plan.appIslands?.[2]?.contains || 'Controls and escalation paths stay one action away.'],
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(plan.archetype)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fonts}&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{fontFamily:{display:['${esc(a.fontDisplay)}','sans-serif'],body:['${esc(a.fontBody)}','sans-serif']},colors:{page:'${a.bg}',surface:'${a.surface}',ink:'${a.text}',muted:'${a.muted}',accent:'${a.accent}',accent2:'${a.accent2}'}}}}</script>
</head>
<body class="min-h-screen bg-[${a.bg}] font-body text-[${onBg}] antialiased">
  <div class="min-h-screen w-full lg:grid lg:grid-cols-[17rem_1fr]">
    <aside class="w-full border-b border-white/10 bg-[${a.surface}] px-5 py-5 text-[${onSurface}] lg:min-h-screen lg:border-b-0 lg:border-r">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-[${a.accent}] text-sm font-bold text-[${a.bg}]">${esc(plan.archetype).slice(0, 2).toUpperCase()}</div>
        <div>
          <p class="font-display text-lg font-semibold">${esc(plan.archetype)}</p>
          <p class="text-xs text-[${a.muted}]">${esc(route.primary?.app || 'offline DNA')} anchor</p>
        </div>
      </div>
      <nav class="mt-8 grid gap-2 text-sm">
        ${['Command', 'Map', 'Queue', 'Signals', 'Reports'].map((item, index) => `<a class="flex items-center gap-3 rounded-xl px-3 py-2 ${index === 0 ? `bg-[${a.accent}]/15 text-[${a.accent}]` : `text-[${a.muted}] hover:bg-white/5 hover:text-[${a.text}]`}" href="#${item.toLowerCase()}"><i data-lucide="${index === 0 ? 'gauge' : 'layers'}" class="h-4 w-4"></i>${item}</a>`).join('\n        ')}
      </nav>
    </aside>
    <main class="min-w-0">
      <header class="w-full border-b border-white/10 bg-[${a.bg}]/95">
        <div class="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-[${a.accent}]">live command</p>
            <h1 class="font-display text-2xl font-semibold tracking-tight md:text-4xl">${esc(wordClamp(brief, 92))}</h1>
          </div>
          <button class="rounded-full bg-[${a.accent}] px-4 py-2 text-sm font-semibold text-[${a.bg}]">Open run</button>
        </div>
      </header>
      <section id="command" class="w-full bg-[${a.bg}] py-6">
        <div class="mx-auto max-w-screen-2xl px-6">${identity}</div>
      </section>
      <section id="map" class="w-full bg-[${a.bg}] py-6">
        <div class="mx-auto max-w-screen-2xl px-6">
          <div class="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[${a.surface}] p-5 text-[${onSurface}] shadow-2xl shadow-black/20">${primary}</div>
        </div>
      </section>
      <section id="queue" class="w-full bg-[${a.bg}] py-6">
        <div class="mx-auto grid max-w-screen-2xl gap-6 px-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div class="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[${a.surface}] p-5 text-[${onSurface}]">${secondary}</div>
          <div class="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[${a.surface}] p-5 text-[${onSurface}]">${tertiary}</div>
        </div>
      </section>
      <section id="reports" class="w-full bg-[${a.bg}] py-6">
        <div class="mx-auto max-w-screen-2xl px-6">
          <div class="rounded-3xl border border-[${a.accent}]/25 bg-[${a.accent}]/10 p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-[${a.accent}]">Operational cadence</p>
            <h2 class="mt-2 font-display text-3xl font-semibold tracking-tight">Status, context, and action stay in the same field of view.</h2>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              ${reportCards.map(([title, body]) => `<div class="rounded-2xl border border-white/10 bg-[${a.surface}]/70 p-4"><p class="text-sm font-semibold">${esc(title)}</p><p class="mt-2 text-sm leading-6 text-[${a.muted}]">${esc(wordClamp(body, 120))}</p></div>`).join('\n              ')}
            </div>
          </div>
        </div>
      </section>
      <footer class="w-full border-t border-white/10 bg-[${a.surface}] py-8">
        <div class="mx-auto grid max-w-screen-2xl gap-6 px-6 text-sm text-[${a.muted}] md:grid-cols-4">
          <p>${esc(plan.archetype)}</p><p>Operations</p><p>Telemetry</p><p>Security</p>
        </div>
      </footer>
    </main>
  </div>
</body>
</html>`
}
