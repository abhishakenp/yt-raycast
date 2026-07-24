const ORIGIN = 'https://courteous-horse-635.convex.cloud'
const SESSION = 'k576ce1ygzdqxq8q05aa3zcfpd8a5fmr'
const SECRET = 'tvnl-seed-secret-1783541246530'
const STATE_LOGO_URL =
  'https://courteous-horse-635.convex.cloud/api/storage/fef5a962-f3f5-4451-91bc-e02ed4890f44'

const guestQuery = async (path, args) => {
  const res = await fetch(`${ORIGIN}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  const json = await res.json()
  if (json.status !== 'success') throw new Error(JSON.stringify(json))
  return json.value
}

const data = await guestQuery('lakebed:getSessionData', {
  sessionId: SESSION,
  capsule: 'GovPortal',
})

// 1) State government (Jharkhand) logo — shown top-right in the navbar utility strip.
if (Array.isArray(data.brand) && data.brand[0]) {
  data.brand[0].stateLogoUrl = STATE_LOGO_URL
}

// 2) Website-partner link → ShipFast. Drop the site-developer link (computered.in)
//    and any tvnl-internal partner and surface ShipFast instead.
data.importantLinks = (data.importantLinks ?? []).filter(
  (l) => !/computered\.in/i.test(l.url ?? ''),
)
data.importantLinks.push({
  id: 'shipfast-partner',
  label: 'Built with ShipFast',
  url: 'https://ship-fast.ai',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

// 3) Board of Directors → fictional English names with portrait photos.
data.boardMembers = [
  {
    id: 'bod-1',
    name: 'Jonathan Blake',
    designation: 'Chairman',
    bio: 'Provides strategic direction and governance oversight for the corporation.',
    photoUrl: 'https://i.pravatar.cc/300?img=12',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bod-2',
    name: 'Richard Harmon',
    designation: 'Managing Director',
    bio: 'Leads day-to-day operations and the long-term generation strategy.',
    photoUrl: 'https://i.pravatar.cc/300?img=13',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bod-3',
    name: 'Andrew Whitfield',
    designation: 'Director (Finance)',
    bio: 'Oversees financial planning, budgeting and statutory compliance.',
    photoUrl: 'https://i.pravatar.cc/300?img=15',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bod-4',
    name: 'Catherine Ross',
    designation: 'Director (Human Resources)',
    bio: 'Drives workforce development, welfare and organisational culture.',
    photoUrl: 'https://i.pravatar.cc/300?img=45',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bod-5',
    name: 'Daniel Pierce',
    designation: 'Director (Technical)',
    bio: 'Responsible for plant engineering, maintenance and reliability.',
    photoUrl: 'https://i.pravatar.cc/300?img=51',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bod-6',
    name: 'Margaret Ellison',
    designation: 'Company Secretary',
    bio: 'Ensures corporate governance and smooth board-level coordination.',
    photoUrl: 'https://i.pravatar.cc/300?img=47',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

// 4) Paraphrase the leadership messages so they read as original prose, not a
//    verbatim copy of the source site.
const paraphrase = {
  "Chairman's Message":
    "It is a privilege to share a few words about Tenughat Vidyut Nigam Limited. Bringing the Tenughat Thermal Power Station — one of the state's most modern, computer-controlled generating stations — into the service of the nation has been a deeply rewarding undertaking, and guiding a project of this scale is a responsibility we carry with great pride. We remain firmly committed to dependable, efficient and responsible power generation for the people of Jharkhand.",
  "Managing Director's Message":
    'Tenughat Vidyut Nigam Limited, a Government of Jharkhand undertaking, was incorporated on 26 November 1987 under the Companies Act, 1956. Our first generating unit entered commercial service in September 1996, followed by the second in September 1997. Both units continue to operate above their rated capacity — a reflection of our focus on operational excellence, high plant availability and continual improvement across every aspect of thermal power generation.',
}
data.messages = (data.messages ?? []).map((m) =>
  paraphrase[m.role] ? { ...m, body: paraphrase[m.role] } : m,
)

console.error(
  'Writing: board=%d links=%d messages=%d stateLogo=%s',
  data.boardMembers.length,
  data.importantLinks.length,
  data.messages.length,
  Boolean(data.brand?.[0]?.stateLogoUrl),
)

const res = await fetch(`${ORIGIN}/api/mutation`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'lakebed:replaceSessionData',
    args: {
      sessionId: SESSION,
      anonymousOwnerSecret: SECRET,
      capsule: 'GovPortal',
      data,
    },
    format: 'json',
  }),
})
const json = await res.json()
if (json.status !== 'success') throw new Error(JSON.stringify(json))
console.log('OK updated TVNL content (owner row)')
