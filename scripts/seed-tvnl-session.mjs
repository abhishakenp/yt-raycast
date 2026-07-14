#!/usr/bin/env node
/**
 * seed-tvnl-session.mjs — deterministically seed a ready `/generate/$sessionId`
 * TVNL government portal WITHOUT the LLM, using a hand-authored OpenUI-Lang
 * program over the GovPortal capsule family + real scraped TVNL content pushed
 * into the shared `GovPortal` Lakebed capsule.
 *
 *   node scripts/seed-tvnl-session.mjs
 *
 * Prints the sessionId + owner secret. Open `<baseUrl>/generate/<sessionId>`
 * and set localStorage["ship-fast:v2:owner-secret:<sessionId>"] = <secret>.
 */
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { convexRun } from './verify-browser-helpers.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Real content scraped end-to-end from the live tvnl.in (40 tenders, 137
// notices, 59-person directory, board, messages, 9 links, offices, about…).
const scraped = JSON.parse(
  readFileSync(join(__dirname, 'seed-tvnl-scraped.json'), 'utf8'),
)

const TIMEOUT = 120000
const brand = 'Tenughat Vidyut Nigam Limited'
const brandHi = 'तेनुघाट विद्युत निगम लिमिटेड'
const tagline = 'A Govt. of Jharkhand Undertaking'
const taglineHi = 'झारखंड सरकार का एक उपक्रम'
const cin = 'U40101JH1987SGC013153'
const location = 'Smart City, Dhurwa · Ranchi, Jharkhand'
const locationHi = 'स्मार्ट सिटी, धुरवा · रांची, झारखंड'

// Real offices from the scrape (address key normalised to `addr`).
const head = scraped.offices?.head ?? {}
const plant = scraped.offices?.plant ?? {}

const officeArg = (o, hi = {}) => ({
  name: o.name ?? '',
  nameHi: hi.nameHi ?? '',
  addr: o.address ?? o.addr ?? '',
  addrHi: hi.addrHi ?? '',
  email: o.email ?? '',
  phone: o.phone ?? '',
  hours: o.hours ?? '',
  hoursHi: hi.hoursHi ?? '',
})

const headHi = {
  nameHi: 'तेनुघाट विद्युत निगम लिमिटेड (प्रधान कार्यालय)',
  addrHi:
    'जुपमी भवन परिसर, ABD क्षेत्र, रांची स्मार्ट सिटी, पो. एवं था. — धुरवा, जिला रांची, झारखंड, 834004',
  hoursHi: 'सोम – शुक्र, प्रातः 10:00 – सायं 6:00',
}
const plantHi = {
  nameHi: 'तेनुघाट तापीय विद्युत केंद्र (संयंत्र कार्यालय)',
  addrHi: 'पो. — टी.टी.पी.एस., लालपनिया, जिला बोकारो, झारखंड, 829149',
}

const NAV = [brand, tagline, cin, location]
const FOOTER = [
  brand,
  brandHi,
  'The Tenughat Thermal Power Station is situated near Tenughat Dam in Bokaro, delivering reliable thermal power to the Jharkhand grid.',
  'तेनुघाट तापीय विद्युत केंद्र बोकारो में तेनुघाट बांध के निकट स्थित है, जो झारखंड ग्रिड को विश्वसनीय तापीय विद्युत प्रदान करता है।',
  [
    { label: 'Tender Notices', labelHi: 'निविदा सूचनाएँ', target: 'Tenders' },
    {
      label: 'Extension Notices',
      labelHi: 'विस्तार सूचनाएँ',
      target: 'Tenders',
    },
    { label: 'Contact Us', labelHi: 'संपर्क करें', target: 'Contact Us' },
  ],
  officeArg(head, headHi),
  officeArg(plant, plantHi),
]
const CONTACT = [
  'Contact Us',
  officeArg(head, headHi),
  officeArg(plant, plantHi),
]

// Real company narrative scraped from tvnl.in (fallback kept short if missing).
const aboutText =
  scraped.about ??
  'Tenughat Vidyut Nigam Limited is a thermal power generating company wholly owned by the Government of Jharkhand.'
const aboutTextHi =
  'तेनुघाट विद्युत निगम लिमिटेड (टीवीएनएल) झारखंड सरकार के पूर्ण स्वामित्व वाली एक तापीय विद्युत उत्पादक कंपनी है, जिसकी स्थापना 26 नवंबर 1987 को हुई। यह लालपनिया, बोकारो स्थित तेनुघाट तापीय विद्युत केंद्र (2×210 मेगावाट) का संचालन करती है और झारखंड की एकमात्र सरकारी तापीय विद्युत उपयोगिता है, जो राज्य ग्रिड को विश्वसनीय बिजली प्रदान करती है।'

// ---- OpenUI-Lang program builder ------------------------------------------

const lines = []
const q = (v) => JSON.stringify(v)

/** Emit a section + its anchor; return the anchor var name. */
const section = (varName, capsule, args, anchorId) => {
  lines.push(`${varName} = ${capsule}(${args.map(q).join(', ')})`)
  lines.push(
    `${varName}_a = SectionAnchor(${q(anchorId)}, ${varName}, "scroll-mt-28")`,
  )
  return `${varName}_a`
}

/**
 * Each page is a list of [capsule, args, anchorId]. Navbar + Footer are chrome
 * repeated on every page.
 */
const nav = (slug) => [`${slug}_nav`, 'GovPortalNavbar', NAV, 'nav']
const foot = (slug) => [`${slug}_foot`, 'GovPortalFooter', FOOTER, 'footer']

const PAGES = [
  {
    label: 'Home',
    slug: 'home',
    sections: (s) => [
      nav(s),
      [
        `${s}_hero`,
        'GovPortalHero',
        [
          'Powering Jharkhand',
          'Reliable Thermal Power for a Growing State',
          'Tenughat Vidyut Nigam Limited — a Govt. of Jharkhand undertaking operating the 2×210 MW Tenughat Thermal Power Station.',
          'View Tenders',
          'About TVNL',
        ],
        'hero',
      ],
      [`${s}_quick`, 'GovPortalQuickLinks', ['Explore Our Work'], 'quicklinks'],
      [`${s}_stats`, 'GovPortalStats', ['Performance Highlights'], 'stats'],
      [
        `${s}_lead`,
        'GovPortalLeadership',
        ["Managing Director's Message"],
        'leadership',
      ],
      [
        `${s}_board`,
        'GovPortalTenderBoard',
        ['Latest Tenders & Notices'],
        'board',
      ],
      foot(s),
    ],
  },
  {
    label: 'The Company',
    slug: 'company',
    sections: (s) => [
      nav(s),
      [
        `${s}_about`,
        'GovPortalAbout',
        [
          'TVNL Overview',
          aboutText,
          [
            'A Govt. of Jharkhand undertaking',
            'CIN No. ' + cin,
            'Only Govt. thermal power utility in Jharkhand',
          ],
          'टीवीएनएल अवलोकन',
          aboutTextHi,
          [
            'झारखंड सरकार का एक उपक्रम',
            'सीआईएन ' + cin,
            'झारखंड की एकमात्र सरकारी तापीय विद्युत उपयोगिता',
          ],
        ],
        'about',
      ],
      [
        `${s}_lead`,
        'GovPortalLeadership',
        ['Leadership & Board of Directors'],
        'leadership',
      ],
      [
        `${s}_plants`,
        'GovPortalPowerPlants',
        ['Our Generating Stations'],
        'plants',
      ],
      foot(s),
    ],
  },
  {
    label: 'Power Generation',
    slug: 'power',
    sections: (s) => [
      nav(s),
      [
        `${s}_plants`,
        'GovPortalPowerPlants',
        ['Operational Power Plants'],
        'plants',
      ],
      [
        `${s}_stats`,
        'GovPortalStats',
        ['Installed Capacity & Performance'],
        'stats',
      ],
      foot(s),
    ],
  },
  {
    label: 'Tenders',
    slug: 'tenders',
    sections: (s) => [
      nav(s),
      [
        `${s}_board`,
        'GovPortalTenderBoard',
        ['Tenders, Extensions, Corrigendum & Cancellations'],
        'board',
      ],
      [
        `${s}_dl`,
        'GovPortalDownloads',
        ['Bidder Downloads & Formats'],
        'downloads',
      ],
      foot(s),
    ],
  },
  {
    label: 'Notices',
    slug: 'notices',
    sections: (s) => [
      nav(s),
      [`${s}_board`, 'GovPortalNotices', ['Notices & Updates'], 'board'],
      foot(s),
    ],
  },
  {
    label: 'Sustainability',
    slug: 'sustain',
    sections: (s) => [
      nav(s),
      [
        `${s}_about`,
        'GovPortalAbout',
        [
          'Sustainability, Environment & Safety',
          'TVNL is committed to responsible ash utilisation, environmental compliance and workplace safety across its operations, alongside CSR initiatives for local communities.',
          [
            'Environmental compliance & monitoring',
            'Ash disposal & utilisation',
            'Occupational health & safety',
            'Community CSR programmes',
          ],
          'सततता, पर्यावरण एवं सुरक्षा',
          'टीवीएनएल अपने समस्त संचालन में जिम्मेदार राख उपयोग, पर्यावरण अनुपालन और कार्यस्थल सुरक्षा के प्रति प्रतिबद्ध है, साथ ही स्थानीय समुदायों के लिए सीएसआर पहलों का संचालन करता है।',
          [
            'पर्यावरण अनुपालन एवं निगरानी',
            'राख निपटान एवं उपयोग',
            'व्यावसायिक स्वास्थ्य एवं सुरक्षा',
            'सामुदायिक सीएसआर कार्यक्रम',
          ],
        ],
        'about',
      ],
      foot(s),
    ],
  },
  {
    label: 'Media',
    slug: 'media',
    sections: (s) => [
      nav(s),
      [`${s}_news`, 'GovPortalNewsEvents', ['News & Events'], 'news'],
      [`${s}_gallery`, 'GovPortalMedia', ['Photo Gallery'], 'gallery'],
      foot(s),
    ],
  },
  {
    label: 'Info Desk',
    slug: 'info',
    sections: (s) => [
      nav(s),
      [`${s}_grv`, 'GovPortalGrievance', ['Grievance Redressal'], 'grievance'],
      [`${s}_dl`, 'GovPortalDownloads', ['Download Formats'], 'downloads'],
      [`${s}_dir`, 'GovPortalDirectory', ['Telephone Directory'], 'directory'],
      foot(s),
    ],
  },
  {
    label: 'Vendor Portal',
    slug: 'vendor',
    sections: (s) => [
      nav(s),
      [
        `${s}_vp`,
        'GovPortalVendor',
        ['Vendor Registration, Bidding & Payment'],
        'vendor',
      ],
      foot(s),
    ],
  },
  {
    label: 'Contact Us',
    slug: 'contact',
    sections: (s) => [
      nav(s),
      [`${s}_ct`, 'GovPortalContact', CONTACT, 'contact'],
      foot(s),
    ],
  },
]

const pageVars = []
const targetMap = {}
for (const page of PAGES) {
  targetMap[page.label] = page.label
  const anchorVars = []
  for (const [varName, capsule, args, anchorId] of page.sections(page.slug)) {
    anchorVars.push(section(varName, capsule, args, anchorId))
    targetMap[`${page.label}#${anchorId}`] = `${page.label}#${anchorId}`
  }
  lines.push(`${page.slug} = Stack([${anchorVars.join(', ')}])`)
  pageVars.push(page.slug)
}

const labels = PAGES.map((p) => p.label)
const openUiSource = [
  '$page = "Home"',
  ...lines,
  `root = PageSwitch(${q(labels)}, [${pageVars.join(', ')}], "", ${q(targetMap)})`,
].join('\n')

// ---- Lakebed seed data (shared GovPortal capsule) --------------------------

let clock = Date.parse('2026-01-01T00:00:00.000Z')
const rowify = (row) => {
  clock += 1000
  const iso = new Date(clock).toISOString()
  return { id: `seed-${clock}`, createdAt: iso, updatedAt: iso, ...row }
}

const finYear = (nit) => (String(nit ?? '').match(/(\d{4}-\d{2})/) ?? [''])[0]
const lastDate = (n) => {
  if (Array.isArray(n.dates) && n.dates.length)
    return n.dates[n.dates.length - 1]
  return n.date ?? ''
}
// Map a scraped notice-family row → the shared `{nitNo,title,date,docUrl}` shape.
const notices = (arr) =>
  (arr ?? []).map((n) =>
    rowify({
      nitNo: n.nitNo ?? '',
      title: n.title ?? '',
      date: lastDate(n),
      docUrl: n.pdf ?? n.docUrl ?? '',
    }),
  )

const govData = {
  tenders: (scraped.tenders ?? []).map((t) =>
    rowify({
      nitNo: t.nitNo ?? '',
      title: t.title ?? '',
      description: t.description ?? '',
      finYear: finYear(t.nitNo),
      category: 'Tender',
      date: t.dueDate ?? '',
      docUrl: t.tenderDocument || t.tenderNotice || '',
    }),
  ),
  extensionNotices: notices(scraped.extensionNotices),
  corrigendums: notices(scraped.corrigendums),
  cancellationNotices: notices(scraped.cancellationNotices),
  publicNotices: notices(scraped.publicNotices),
  circulars: notices(scraped.circulars),
  employmentNotices: notices(scraped.employmentNotices),
  updates: notices(scraped.updates),
  boardMembers: (scraped.boardMembers ?? []).map((m) =>
    rowify({
      name: m.name ?? '',
      designation: m.designation ?? '',
      bio: m.note ?? '',
      photoUrl: m.photoUrl ?? '',
    }),
  ),
  messages: (scraped.messages ?? []).map((m) =>
    rowify({
      role: m.role ?? '',
      name: (m.role ?? '').replace(/['’]s Message$/i, '').trim(),
      body: m.text ?? '',
      photoUrl: '',
    }),
  ),
  powerPlants: (scraped.powerPlants ?? []).map((p) =>
    rowify({
      name: p.name ?? '',
      capacity: p.installedCapacity ?? '',
      status: 'Operational',
      location: p.location ?? '',
      specs: [
        p.description ?? '',
        p.unit1Commissioned
          ? `Unit-1 commissioned ${p.unit1Commissioned}; Unit-2 commissioned ${p.unit2Commissioned}.`
          : '',
        p.expansion ? `Expansion: ${p.expansion}` : '',
      ]
        .filter(Boolean)
        .join(' '),
    }),
  ),
  directory: (() => {
    let sl = 0
    return (scraped.directory ?? []).flatMap((sec) =>
      (sec.people ?? []).map((p) => {
        sl += 1
        return rowify({
          slNo: sl,
          name: p.name ?? '',
          designation: p.designation ?? '',
          email: p.email ?? '',
        })
      }),
    )
  })(),
  media: [
    {
      title: 'TTPS control room',
      alt: 'Thermal power plant control room',
      category: 'Photo',
    },
    {
      title: 'Cooling towers at TTPS',
      alt: 'Power plant cooling towers at dusk',
      category: 'Photo',
    },
    {
      title: 'Turbine hall',
      alt: 'Steam turbine generator hall',
      category: 'Photo',
    },
    {
      title: 'Safety Week drill',
      alt: 'Workers at a safety drill',
      category: 'Photo',
    },
    {
      title: 'Ash utilisation site',
      alt: 'Fly ash utilisation yard',
      category: 'Photo',
    },
    {
      title: 'Township view',
      alt: 'TVNL residential township',
      category: 'Photo',
    },
  ].map(rowify),
  newsEvents: [],
  downloads: (scraped.downloads ?? []).map((d) =>
    rowify({
      title: d.name ?? d.title ?? '',
      category: 'Form',
      fileUrl: d.pdf ?? d.fileUrl ?? '',
    }),
  ),
  ashReports: (scraped.ashReports ?? []).map((a) =>
    rowify({ period: a.period ?? '', fileUrl: a.pdf ?? a.fileUrl ?? '' }),
  ),
  importantLinks: (scraped.importantLinks ?? []).map((l) =>
    rowify({ label: l.label ?? '', url: l.url ?? '' }),
  ),
  // interaction tables start empty
  grievances: [],
  vendors: [],
  bids: [],
  rfxPayments: [],
  uiState: [],
  // brand config — logoUrl filled in after the logo is uploaded to storage
  brand: [],
}

// ---- siteSpec --------------------------------------------------------------

const ownerEmail = 'tvnl-admin@example.com'
const siteSpec = {
  brand,
  projectName: brand,
  tagline,
  theme: 'corporate',
  locale: 'en',
  siteType: 'government-portal',
  modules: { home: openUiSource },
  genui: {
    version: 1,
    category: 'government-portal',
    ownerEmail,
    artifacts: {},
    adminPolicy: {
      version: 1,
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail,
      adminEmails: [ownerEmail],
      roles: ['owner', 'editor', 'author'],
      exportRequiresVerifiedOwnerEmail: true,
    },
  },
}

// ---- run -------------------------------------------------------------------

if (process.env.DRY) {
  console.log(openUiSource)
  console.error(
    `\n[dry] ${lines.length} program lines, ${labels.length} pages, ` +
      `${Object.values(govData).reduce((a, v) => a + v.length, 0)} seeded rows`,
  )
  process.exit(0)
}

const stamp = Date.now()
const ownerSecret = `tvnl-seed-secret-${stamp}`

console.error('Creating session…')
const created = convexRun(
  'sessions:create',
  {
    prompt:
      'Rebuild the Tenughat Vidyut Nigam Limited (TVNL) government power-utility portal — tenders, notices, leadership, directory, vendor portal, grievances.',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `tvnl_seed_${stamp}`,
    anonymousOwnerSecret: ownerSecret,
    anonymousClientId: `anon-tvnl-seed-${stamp}`,
  },
  TIMEOUT,
)
if (typeof created?.sessionId !== 'string') {
  throw new Error(
    `sessions:create did not return sessionId: ${JSON.stringify(created)}`,
  )
}
const sessionId = created.sessionId

console.error('Completing generation (hand-authored program)…')
convexRun(
  'internal.sessions.completeGeneration',
  {
    sessionId,
    html: '<div id="tvnl-seed">Tenughat Vidyut Nigam Limited</div>',
    openUiSource,
    siteSpecJson: JSON.stringify(siteSpec),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  },
  TIMEOUT,
)

// The dev deployment has a generation model configured, so `create` also
// schedules an LLM generation that races us and can overwrite the home preview
// module. Force our hand-authored program to be the rendered `home` module and
// hold it until it stops being clobbered by any still-streaming LLM run.
const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const homeHasOurProgram = () => {
  try {
    const view = convexRun('sessions:getGenerationView', { sessionId }, TIMEOUT)
    return String(view?.homeModule?.source ?? '').includes('GovPortalNavbar')
  } catch {
    return false
  }
}

console.error('Forcing hand-authored home module (overriding any LLM run)…')
let stable = 0
for (let attempt = 0; attempt < 40 && stable < 2; attempt += 1) {
  convexRun(
    'sessions:upsertGeneratedModule',
    { sessionId, moduleKey: 'home', source: openUiSource, status: 'succeeded' },
    TIMEOUT,
  )
  sleep(2000)
  stable = homeHasOurProgram() ? stable + 1 : 0
}
if (stable < 2) {
  throw new Error('home module did not stabilise on the GovPortal program')
}

// Upload the real TVNL logo to Convex storage and store its URL in the brand
// table so the navbar renders it (config lives entirely in the DB).
console.error('Uploading brand logo to Convex storage…')
let logoUrl = ''
try {
  const uploadUrl = convexRun(
    'gov_uploads:generateUploadUrl',
    { sessionId, anonymousOwnerSecret: ownerSecret },
    TIMEOUT,
  )
  const logoBytes = readFileSync(join(__dirname, 'assets/tvnl-emblem.png'))
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: logoBytes,
  })
  const { storageId } = await res.json()
  logoUrl = convexRun(
    'gov_uploads:getStorageUrl',
    { sessionId, storageId },
    TIMEOUT,
  )
} catch (error) {
  console.error('  logo upload skipped:', error.message)
}

govData.brand = [
  rowify({
    name: brand,
    nameHi: brandHi,
    tagline,
    taglineHi,
    cin,
    location,
    locationHi,
    logoUrl,
    themeDark: '',
  }),
]

// ---- migrate every referenced PDF into Convex storage ---------------------
// The client asked us NOT to redirect to tvnl.in — each tender/notice/download
// document is fetched from the live site (self-signed cert → `curl -k`) and
// re-hosted in Convex storage, then the row's URL is rewritten to the Convex
// copy so viewing + downloading is served entirely from our own backend.
console.error('Migrating referenced PDFs into Convex storage…')
const PDF_FIELDS = [
  ['tenders', 'docUrl'],
  ['extensionNotices', 'docUrl'],
  ['corrigendums', 'docUrl'],
  ['cancellationNotices', 'docUrl'],
  ['publicNotices', 'docUrl'],
  ['circulars', 'docUrl'],
  ['employmentNotices', 'docUrl'],
  ['updates', 'docUrl'],
  ['downloads', 'fileUrl'],
  ['ashReports', 'fileUrl'],
]
const uniqueUrls = new Set()
for (const [table, field] of PDF_FIELDS) {
  for (const row of govData[table]) {
    const u = row[field]
    if (u && /^https?:\/\//i.test(u)) uniqueUrls.add(u)
  }
}
const urlList = [...uniqueUrls]
console.error(`  ${urlList.length} unique document URLs to migrate…`)

// Convex origin (for the HTTP API + constructing served storage URLs) is taken
// from the already-uploaded logo URL, else resolved via one upload-URL call.
let convexOrigin = ''
try {
  convexOrigin = logoUrl ? new URL(logoUrl).origin : ''
} catch {
  convexOrigin = ''
}
if (!convexOrigin) {
  const probe = convexRun(
    'gov_uploads:generateUploadUrl',
    { sessionId, anonymousOwnerSecret: ownerSecret },
    TIMEOUT,
  )
  convexOrigin = new URL(probe).origin
}

// Fast, genuinely-concurrent path: hit the Convex HTTP API directly (a fresh
// signed upload URL per file) instead of the slow `npx convex run` per call,
// and build the served URL from the returned storageId.
const httpCall = async (kind, path, args) => {
  const res = await fetch(`${convexOrigin}/api/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  const json = await res.json()
  if (json.status !== 'success') {
    throw new Error(json.errorMessage ?? JSON.stringify(json))
  }
  return json.value
}
const httpMutation = (path, args) => httpCall('mutation', path, args)
const httpQuery = (path, args) => httpCall('query', path, args)
const downloadPdf = (url) =>
  new Promise((resolve, reject) => {
    // Real TVNL file names contain spaces / other unsafe chars; encode them so
    // curl accepts the URL (raw spaces → curl exit 3 "URL malformed").
    const safeUrl = encodeURI(url).replace(/#/g, '%23')
    const cp = spawn('curl', ['-k', '-fsSL', '--max-time', '90', safeUrl])
    const chunks = []
    cp.stdout.on('data', (d) => chunks.push(d))
    cp.on('error', reject)
    cp.on('close', (code) => {
      if (code === 0 && chunks.length) resolve(Buffer.concat(chunks))
      else reject(new Error(`curl exit ${code}`))
    })
  })
const migrateOne = async (url) => {
  const buf = await downloadPdf(url)
  if (!buf.length) throw new Error('empty download')
  const uploadUrl = await httpMutation('gov_uploads:generateUploadUrl', {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
  })
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/pdf' },
    body: buf,
  })
  const { storageId } = await res.json()
  if (!storageId) throw new Error('no storageId')
  // Resolve the real served URL (getUrl returns a differently-keyed public URL,
  // not `/api/storage/<storageId>`), so viewing/downloading works directly.
  const servedUrl = await httpQuery('gov_uploads:getStorageUrl', {
    sessionId,
    storageId,
  })
  if (!servedUrl) throw new Error('no served url')
  return servedUrl
}

// Migrate with a small concurrency pool; fall back to the original URL on error.
const urlMap = new Map()
let migrated = 0
let failed = 0
const CONCURRENCY = 8
let cursor = 0
const worker = async () => {
  while (cursor < urlList.length) {
    const idx = cursor++
    const url = urlList[idx]
    try {
      urlMap.set(url, await migrateOne(url))
      migrated += 1
    } catch (error) {
      urlMap.set(url, url)
      failed += 1
      console.error(`  ✗ ${url.slice(-48)} → ${error.message}`)
    }
    if ((migrated + failed) % 20 === 0) {
      console.error(`  … ${migrated + failed}/${urlList.length}`)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
for (const [table, field] of PDF_FIELDS) {
  for (const row of govData[table]) {
    if (row[field] && urlMap.has(row[field]))
      row[field] = urlMap.get(row[field])
  }
}
console.error(`  PDFs migrated: ${migrated}, failed (kept original): ${failed}`)

// Seed as a SHARED row (ownerKey undefined) so ANY visitor — including guests
// with no owner secret — sees the content directly from the DB.
console.error('Publishing GovPortal content to Lakebed (shared row)…')
convexRun(
  'internal.lakebed.seedSharedSessionData',
  {
    sessionId,
    capsule: 'GovPortal',
    data: govData,
  },
  TIMEOUT,
)

const summary = {
  sessionId,
  ownerSecret,
  pages: labels,
  counts: Object.fromEntries(
    Object.entries(govData).map(([k, v]) => [k, v.length]),
  ),
}
console.error('\n✅ TVNL session seeded.')
console.error(`   sessionId:   ${sessionId}`)
console.error(`   ownerSecret: ${ownerSecret}`)
console.error(`   open:        /generate/${sessionId}`)
console.log(JSON.stringify(summary))
