function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pickClass(className, pattern, fallback) {
  return String(className || '').split(/\s+/).find((token) => pattern.test(token)) || fallback
}

function cleanSubject(subject, index) {
  const cleaned = String(subject ?? '')
    .replace(/\b(placeholder|brand asset|image|photo|visual surface)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || `visual study ${index + 1}`
}

function palette(plan) {
  const a = plan?.visualWorld || {}
  return {
    bg: a.bg || '#111827',
    surface: a.surface || '#1f2937',
    text: a.text || '#f9fafb',
    muted: a.muted || '#9ca3af',
    accent: a.accent || '#8b5cf6',
    accent2: a.accent2 || '#22d3ee',
  }
}

export function inferVisualKind(subject, { plan, route } = {}) {
  const subjectText = String(subject || '').toLowerCase()
  const haystack = `${subjectText} ${plan?.brief || ''} ${plan?.archetype || ''}`.toLowerCase()
  if (/\b(trail|hike|harbor|coast|guide|route|map)\b/.test(subjectText) && /hotel|stay|room|coast|guest/.test(haystack)) return 'destination-map'
  if (route?.siteHint === 'ops-console' || /\b(fleet|robot|operator|incident|map|teleoperation)\b/.test(haystack)) return 'ops-map'
  if (route?.siteHint === 'software' && /\b(table|dashboard|heatmap|chart|cost|pod|namespace|team|api|workflow|deploy)\b/.test(haystack)) return 'product-console'
  if (route?.siteHint !== 'software' && route?.siteHint !== 'ops-console' && /\b(restaurant|kitchen|dining|menu|coffee|dish)\b/.test(subjectText)) return 'coffee-packaging'
  if (/\b(spa|wellness|treatment|fire|botanical)\b/.test(subjectText)) return 'product-still-life'
  if (/\b(room|suite|cabin|view|balcony|bed|guest)\b/.test(subjectText) || /hotel|room|suite|coast|guest/.test(haystack)) return 'hotel-room'
  if (/coffee|roaster|bean|menu|cafe|restaurant|dish|table/.test(haystack)) return 'coffee-packaging'
  if (/fitness|training|class|workout|trainer|hiit|membership/.test(haystack)) return 'fitness-schedule'
  if (/skincare|beauty|oil|ingredient|bottle|product|shop|store|commerce|apparel/.test(haystack)) return 'product-still-life'
  if (route?.siteHint === 'portfolio') return 'editorial-spread'
  if (route?.siteHint === 'agency') return 'brand-case-wall'
  if (/portfolio|agency|brand|case study|identity|creative|designer|campaign/.test(haystack)) return 'brand-case-wall'
  if (/editorial|magazine|newsletter|publication|music|artist|label/.test(haystack)) return 'editorial-spread'
  if (/dashboard|saas|api|kubernetes|cost|analytics|developer|platform|console|workflow|deploy|heatmap/.test(haystack)) return 'product-console'
  return route?.siteHint === 'commerce' ? 'product-still-life' : 'product-console'
}

function selectVisualKind(subject, context, index) {
  if (context?.route?.siteHint === 'portfolio') return 'editorial-spread'
  if (context?.route?.siteHint === 'agency') return 'brand-case-wall'
  if (context?.route?.siteHint === 'fitness') return 'fitness-schedule'
  const base = inferVisualKind(subject, context)
  const brief = String(context?.plan?.brief || '').toLowerCase()
  const subjectText = String(subject || '').toLowerCase()
  if (context?.route?.siteHint === 'local-experience' && /hotel|room|suite|coast|guest/.test(brief)) {
    if (/\b(trail|hike|harbor|coast|guide|route|map)\b/.test(subjectText)) return 'destination-map'
    if (/\b(restaurant|kitchen|dining|menu|coffee|dish)\b/.test(subjectText)) return 'coffee-packaging'
    if (/\b(spa|wellness|treatment|fire|botanical)\b/.test(subjectText)) return 'product-still-life'
    if (/\b(guest|story|portrait|review)\b/.test(subjectText)) return 'editorial-spread'
    return ['hotel-room', 'destination-map', 'editorial-spread', 'hotel-room'][index % 4]
  }
  if (context?.route?.siteHint === 'software' && base === 'product-console') {
    return ['product-console', 'brand-case-wall', 'product-console'][index % 3]
  }
  return base
}

function shell(label, className, plan, index, route, kind, inner) {
  const a = palette(plan)
  const aspect = pickClass(className, /^aspect-\[/, kind === 'ops-map' ? 'aspect-[16/10]' : 'aspect-[4/3]')
  const rounded = pickClass(className, /^rounded-/, 'rounded-lg')
  const polarity = index % 3
  const from = polarity === 0 ? a.surface : polarity === 1 ? a.bg : a.accent
  const via = polarity === 0 ? a.accent : polarity === 1 ? a.surface : a.muted
  const to = polarity === 0 ? a.accent2 : polarity === 1 ? a.accent2 : a.surface
  const safe = esc(label)
  const hint = route?.siteHint || 'homepage'
  return `<div data-img="${safe}" data-visual="art-surface" data-visual-kind="${kind}" data-site-hint="${hint}" aria-label="${safe}" class="relative w-full ${aspect} ${rounded} overflow-hidden border border-[${a.accent}]/25 bg-gradient-to-br from-[${from}] via-[${via}] to-[${to}] shadow-xl shadow-black/10">
  <div class="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:28px_28px]"></div>
  <div class="absolute left-0 top-0 h-full w-1 bg-[${a.accent}]/70"></div>
  <div class="absolute right-5 top-5 h-20 w-20 rounded-full border border-white/20 bg-white/10"></div>
  ${inner}
</div>`
}

function productConsole(label, a) {
  return `<div class="absolute inset-4 rounded-lg border border-white/15 bg-[${a.bg}]/80 p-4 backdrop-blur">
    <div class="flex items-center justify-between border-b border-white/10 pb-3">
      <div><p class="text-xs uppercase tracking-[0.18em] text-[${a.accent}]">${esc(label)}</p><p class="mt-1 text-sm font-semibold text-[${a.text}]">Live product surface</p></div>
      <div class="rounded-full bg-[${a.accent}]/20 px-3 py-1 text-xs text-[${a.text}]">92.4% clear</div>
    </div>
    <div class="mt-4 grid grid-cols-[0.8fr_1.2fr] gap-3">
      <div class="space-y-2">${[0, 1, 2, 3].map((row) => `<div class="rounded-md border border-white/10 bg-white/5 p-2"><div class="h-2 w-${row === 0 ? '20' : row === 1 ? '16' : '24'} rounded-full bg-[${row % 2 ? a.accent2 : a.accent}]/80"></div><div class="mt-2 h-2 w-full rounded-full bg-white/15"></div></div>`).join('')}</div>
      <div class="rounded-md border border-white/10 bg-white/5 p-3">
        <div class="flex h-32 items-end gap-2">${[34, 62, 48, 86, 58, 74, 91].map((height, row) => `<span class="h-[${height}%] w-full rounded-t bg-[${row % 2 ? a.accent2 : a.accent}]/80"></span>`).join('')}</div>
        <div class="mt-3 grid grid-cols-3 gap-2"><span class="h-2 rounded-full bg-white/20"></span><span class="h-2 rounded-full bg-white/30"></span><span class="h-2 rounded-full bg-white/20"></span></div>
      </div>
    </div>
  </div>`
}

function opsMap(label, a) {
  return `<div class="absolute inset-4 grid grid-cols-[1.5fr_0.8fr] gap-4">
    <div class="relative overflow-hidden rounded-lg border border-white/15 bg-[${a.bg}]/75 p-4">
      <div class="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      ${[[18, 22], [45, 35], [68, 27], [28, 64], [74, 70]].map(([left, top], index) => `<div class="absolute left-[${left}%] top-[${top}%] rounded-full border border-white/50 bg-[${index % 2 ? a.accent2 : a.accent}] px-2 py-1 text-[10px] font-semibold text-[${a.bg}]">R${index + 17}</div>`).join('')}
      <div class="absolute bottom-4 left-4 rounded-lg border border-white/15 bg-[${a.bg}]/85 p-3 text-xs text-[${a.text}]"><span class="text-[${a.accent}]">Fleet</span> 48 active · 3 handoffs</div>
    </div>
    <div class="space-y-3">
      <p class="text-xs uppercase tracking-[0.18em] text-[${a.text}]">${esc(label)}</p>
      ${['Battery watch', 'Route conflict', 'Teleop ready'].map((row, index) => `<div class="rounded-lg border border-white/15 bg-[${a.bg}]/75 p-3"><p class="text-sm font-semibold text-[${a.text}]">${row}</p><p class="mt-1 text-xs text-[${a.muted}]">${index + 2} live signals</p></div>`).join('')}
    </div>
  </div>`
}

function destinationMap(label, a) {
  return `<div class="absolute inset-4 grid grid-cols-[1.2fr_0.8fr] gap-4">
    <div class="relative overflow-hidden rounded-lg border border-white/15 bg-[${a.bg}]/65 p-4">
      <div class="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:34px_34px]"></div>
      ${[[20, 26, 'Beach'], [46, 38, 'Cedar'], [67, 28, 'Spa'], [31, 67, 'Fire'], [76, 72, 'Trail']].map(([left, top, name], index) => `<div class="absolute left-[${left}%] top-[${top}%] rounded-full border border-white/60 bg-[${index % 2 ? a.accent2 : a.accent}] px-2 py-1 text-[10px] font-semibold text-[${a.bg}]">${name}</div>`).join('')}
      <div class="absolute bottom-4 left-4 rounded-lg border border-white/15 bg-[${a.bg}]/80 p-3 text-xs text-[${a.text}]">9 minute walk · tide window 16:40</div>
    </div>
    <div class="rounded-lg border border-white/15 bg-[${a.bg}]/70 p-4">
      <p class="text-xs uppercase tracking-[0.18em] text-[${a.accent}]">${esc(label)}</p>
      ${['Forest path', 'Low-tide pool', 'Dinner return'].map((row, index) => `<div class="mt-3 rounded-md bg-white/10 p-3"><p class="text-sm font-semibold text-[${a.text}]">${row}</p><p class="text-xs text-[${a.muted}]">${index + 1}.${index + 4} mi from lobby</p></div>`).join('')}
    </div>
  </div>`
}

function productStillLife(label, a) {
  return `<div class="absolute inset-5 flex items-end justify-center gap-5">
    ${[0, 1, 2].map((item) => `<div class="relative h-${item === 1 ? '56' : '44'} w-24 rounded-t-[3rem] rounded-b-lg border border-white/30 bg-[${item === 0 ? a.surface : item === 1 ? a.accent : a.accent2}]/85 shadow-2xl">
      <div class="absolute left-1/2 top-5 h-10 w-10 -translate-x-1/2 rounded-full border border-white/40 bg-white/20"></div>
      <div class="absolute inset-x-3 bottom-5 rounded-md bg-[${a.bg}]/70 p-2 text-center text-[10px] uppercase tracking-[0.18em] text-[${a.text}]">${item === 0 ? 'Calm' : item === 1 ? esc(label).slice(0, 12) : 'Glow'}</div>
    </div>`).join('')}
    <div class="absolute left-5 top-5 rounded-lg border border-white/20 bg-[${a.bg}]/70 p-3 text-xs text-[${a.text}]">Small batch · batch 042</div>
    <div class="absolute right-6 top-10 h-16 w-28 rounded-full border border-white/20 bg-white/20"></div>
  </div>`
}

function hotelRoom(label, a) {
  return `<div class="absolute inset-4 overflow-hidden rounded-lg border border-white/15 bg-[${a.bg}]/75">
    <div class="absolute inset-x-8 top-6 h-40 rounded-b-[2.5rem] border border-white/25 bg-gradient-to-b from-[${a.accent2}]/80 to-[${a.bg}]/20"></div>
    <div class="absolute bottom-10 left-8 right-8 h-20 rounded-lg bg-[${a.surface}]/80 shadow-2xl"></div>
    <div class="absolute bottom-20 left-16 right-16 h-12 rounded-t-lg bg-white/25"></div>
    <div class="absolute bottom-6 left-8 h-10 w-32 rounded-full bg-[${a.accent}]/60"></div>
    <div class="absolute bottom-6 right-8 rounded-lg border border-white/20 bg-[${a.bg}]/80 p-3 text-xs text-[${a.text}]">${esc(label)} · ocean view</div>
  </div>`
}

function coffeePackaging(label, a) {
  return `<div class="absolute inset-5 grid grid-cols-[0.9fr_1.1fr] gap-5">
    <div class="flex items-end gap-3">
      ${['Ethiopia', 'Colombia', 'Tokyo'].map((row, index) => `<div class="h-${index === 1 ? '56' : '48'} flex-1 rounded-lg border border-white/25 bg-[${index === 0 ? a.accent : index === 1 ? a.surface : a.accent2}]/85 p-3 shadow-xl"><p class="text-xs uppercase tracking-[0.18em] text-[${a.text}]">${row}</p><div class="mt-20 h-2 rounded-full bg-white/40"></div><div class="mt-2 h-2 w-2/3 rounded-full bg-white/25"></div></div>`).join('')}
    </div>
    <div class="rounded-lg border border-white/20 bg-[${a.bg}]/75 p-4">
      <p class="text-xs uppercase tracking-[0.18em] text-[${a.accent}]">${esc(label)}</p>
      ${['Washed Yirgacheffe', 'Cacao finish', 'Roasted 07:40'].map((row) => `<div class="mt-3 flex items-center justify-between border-b border-white/10 pb-2 text-sm text-[${a.text}]"><span>${row}</span><span class="text-[${a.muted}]">250g</span></div>`).join('')}
    </div>
  </div>`
}

function fitnessSchedule(label, a) {
  return `<div class="absolute inset-4 grid grid-cols-[1fr_1.2fr] gap-4">
    <div class="rounded-lg border border-white/15 bg-[${a.bg}]/75 p-5">
      <p class="text-xs uppercase tracking-[0.18em] text-[${a.accent}]">${esc(label)}</p>
      <p class="mt-4 text-5xl font-black text-[${a.text}]">VTX45</p>
      <div class="mt-6 grid grid-cols-2 gap-2">${['06:30', '12:15', '17:45', '19:00'].map((time) => `<div class="rounded-md bg-white/10 p-3 text-sm font-semibold text-[${a.text}]">${time}</div>`).join('')}</div>
    </div>
    <div class="space-y-3">${['Strength floor', 'Rower interval', 'Coach check-in', 'Recovery block'].map((row, index) => `<div class="flex items-center gap-3 rounded-lg border border-white/15 bg-[${a.bg}]/70 p-3"><span class="h-10 w-10 rounded-full bg-[${index % 2 ? a.accent2 : a.accent}]/80"></span><div><p class="text-sm font-semibold text-[${a.text}]">${row}</p><p class="text-xs text-[${a.muted}]">${12 + index * 4} min block</p></div></div>`).join('')}</div>
  </div>`
}

function brandCaseWall(label, a, cells = 9) {
  const cols = cells <= 4 ? 2 : 3
  return `<div class="absolute inset-4 grid grid-cols-${cols} gap-3">
    ${Array.from({ length: cells }, (_, index) => `<div class="relative overflow-hidden rounded-lg border border-white/15 bg-[${index % 3 === 0 ? a.bg : index % 3 === 1 ? a.surface : a.accent}]/75 p-3">
      <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full border border-white/20 bg-[${index % 2 ? a.accent2 : a.accent}]/35"></div>
      <p class="relative text-xs uppercase tracking-[0.16em] text-[${a.text}]">${index === 0 ? esc(label).slice(0, 18) : `Study ${index + 1}`}</p>
      <div class="relative mt-8 h-2 rounded-full bg-white/35"></div>
      <div class="relative mt-2 h-2 w-2/3 rounded-full bg-white/20"></div>
    </div>`).join('')}
  </div>`
}

function editorialSpread(label, a, index = 0) {
  const sideNotes = [
    ['Policy signal', 'Data brief', 'Reporter file'],
    ['Archive lead', 'Carbon desk', 'Reader memo'],
    ['Field dispatch', 'Market note', 'Weekly column'],
  ][index % 3]
  const featureTitle = esc(label).slice(0, 34)
  const lineStack = Array.from({ length: 7 }, (_, row) => `<div class="h-1.5 rounded-full bg-[${a.text}]/${row % 3 === 0 ? '65' : row % 3 === 1 ? '35' : '20'}" style="width:${row % 4 === 0 ? 86 : row % 4 === 1 ? 64 : row % 4 === 2 ? 72 : 48}%"></div>`).join('')
  const miniIndex = ['Policy', 'Energy', 'Cities', 'AI'].map((tag, tagIndex) => `<div class="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[${a.text}]">${tag}<span class="ml-1 text-[${a.muted}]">${tagIndex + 3}</span></div>`).join('')
  if (index % 3 === 1) {
    return `<div class="absolute inset-5 grid grid-cols-[0.85fr_1.15fr] gap-5">
    <div class="space-y-3">${sideNotes.map((row, noteIndex) => `<div class="rounded-lg border border-white/15 bg-[${a.surface}]/75 p-4"><p class="text-sm font-semibold text-[${a.text}]">${row}</p><p class="mt-2 text-xs text-[${a.muted}]">${12 + noteIndex * 7} minute read</p><div class="mt-3 grid grid-cols-3 gap-1">${[0, 1, 2].map((cell) => `<span class="h-5 rounded bg-[${cell % 2 ? a.accent2 : a.accent}]/35"></span>`).join('')}</div></div>`).join('')}</div>
    <div class="rounded-lg border border-white/15 bg-[${a.bg}]/75 p-6">
      <p class="text-xs uppercase tracking-[0.2em] text-[${a.accent}]">${esc(label)}</p>
      <div class="mt-8 grid grid-cols-3 gap-2">${[0, 1, 2, 3, 4, 5].map((cell) => `<div class="h-16 rounded-md bg-[${cell % 2 ? a.accent2 : a.accent}]/45"></div>`).join('')}</div>
      <div class="mt-6 space-y-2">${lineStack}</div>
      <div class="mt-5 grid grid-cols-2 gap-2">${miniIndex}</div>
    </div>
  </div>`
  }
  if (index % 3 === 2) {
    return `<div class="absolute inset-5 grid grid-cols-3 gap-4">
    <div class="col-span-2 rounded-lg border border-white/15 bg-[${a.bg}]/75 p-6">
      <p class="text-xs uppercase tracking-[0.2em] text-[${a.accent}]">${featureTitle}</p>
      <div class="mt-8 grid grid-cols-[1.25fr_0.75fr] gap-3"><div class="h-28 rounded-md bg-[${a.accent}]/50"></div><div class="grid gap-2">${[0, 1, 2].map((cell) => `<span class="rounded-md border border-white/15 bg-[${cell % 2 ? a.accent2 : a.surface}]/45"></span>`).join('')}</div></div>
      <div class="mt-6 space-y-2">${lineStack}</div>
    </div>
    <div class="space-y-3">${sideNotes.map((row) => `<div class="rounded-lg border border-white/15 bg-[${a.surface}]/75 p-4"><p class="text-sm font-semibold text-[${a.text}]">${row}</p><div class="mt-3 space-y-1.5"><div class="h-1.5 rounded-full bg-white/35"></div><div class="h-1.5 w-2/3 rounded-full bg-white/20"></div></div></div>`).join('')}</div>
  </div>`
  }
  return `<div class="absolute inset-5 grid grid-cols-[1fr_0.75fr] gap-5">
    <div class="rounded-lg border border-white/15 bg-[${a.bg}]/75 p-6">
      <p class="text-xs uppercase tracking-[0.2em] text-[${a.accent}]">${featureTitle}</p>
      <div class="mt-10 grid grid-cols-[1fr_0.6fr] gap-3"><div class="h-28 rounded-md bg-[${a.accent}]/50"></div><div class="space-y-2">${miniIndex}</div></div>
      <div class="mt-7 space-y-2">${lineStack}</div>
    </div>
    <div class="space-y-3">${sideNotes.map((row, noteIndex) => `<div class="rounded-lg border border-white/15 bg-[${a.surface}]/75 p-4"><p class="text-sm font-semibold text-[${a.text}]">${row}</p><p class="mt-2 text-xs text-[${a.muted}]">Desk ${noteIndex + 1} · ${18 + noteIndex * 4} signals</p><div class="mt-3 h-2 rounded-full bg-white/25"></div></div>`).join('')}</div>
  </div>`
}

export function renderArtDirectedImageSurface(subject, className, plan, index, route, opts = {}) {
  const label = cleanSubject(subject, index)
  const kind = selectVisualKind(label, { plan, route }, index)
  const a = palette(plan)
  const heroCompact = Boolean(opts.heroCompact)
  const innerByKind = {
    'ops-map': opsMap,
    'destination-map': destinationMap,
    'hotel-room': hotelRoom,
    'coffee-packaging': coffeePackaging,
    'fitness-schedule': fitnessSchedule,
    'product-still-life': productStillLife,
    'brand-case-wall': brandCaseWall,
    'editorial-spread': editorialSpread,
    'product-console': productConsole,
  }
  const render = innerByKind[kind] || productConsole
  const inner = kind === 'brand-case-wall' && heroCompact
    ? brandCaseWall(label, a, 4)
    : render(label, a, index)
  return shell(label, className, plan, index, route, kind, inner)
}
