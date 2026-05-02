const ZW_RE = /[\u200B-\u200D\uFEFF\u2060-\u2064]/g

export const CONTENT_POLICY_CLIENT_MESSAGE = `STOP. Your request was blocked under our zero-tolerance rules for sexual content involving minors, non-consensual sexual material, graphic violence, terrorism, self-harm instructions, and related illegal activity.

This attempt is logged with technical identifiers tied to your session. Repeated or egregious abuse can result in a permanent ban and disclosure to law enforcement where required.

Do not submit this type of content again.`

const LEET_MAP = new Map([
  ['0', 'o'],
  ['1', 'i'],
  ['3', 'e'],
  ['4', 'a'],
  ['5', 's'],
  ['7', 't'],
  ['8', 'b'],
  ['9', 'g'],
  ['@', 'a'],
  ['$', 's'],
  ['!', 'i'],
])

const BLOCKED_PHRASES = [
  'child porn',
  'childporn',
  'child porno',
  'kid porn',
  'kids porn',
  'minor porn',
  'teen porn',
  'preteen porn',
  'underage porn',
  'underage sex',
  'underage nude',
  'underage naked',
  'jailbait',
  'pedo porn',
  'pedoph',
  'paedoph',
  'lolicon',
  'shotacon',
  'toddler porn',
  'baby porn',
  'elementary porn',
  'schoolgirl porn',
  'school boy porn',
  'incest porn',
  'rape porn',
  'rape video',
  'snuff film',
  'snuff video',
  'gore porn',
  'necroph',
  'bestiality',
  'zoophil',
  'animal sex',
  'deepfake nude',
  'deepfake porn',
  'revenge porn',
  'non-consensual porn',
  'sex trafficking',
  'human trafficking site',
  'buy sex slave',
  'how to bomb',
  'make a bomb',
  'bomb tutorial',
  'how to make explosives',
  'ricin recipe',
  'anthrax how',
  'suicide method',
  'how to kill yourself',
  'self harm tutorial',
  'fentanyl synthesis',
  'how to make meth',
  'cp site',
  'pornhub clone',
  'onlyfans clone porn',
  'xxx tube',
  'hardcore porn site',
  'live sex cam site',
  'webcam sex site',
  'escort trafficking',
  'chloroform abduct',
  'chloroform kidnap',
]

const BLOCKED_COLLAPSED = [
  'childporn',
  'kidporn',
  'pedoporn',
  'jailbait',
  'lolicon',
  'shotacon',
  'snuffporn',
  'zoophil',
  'bestiality',
  'incestporn',
  'rapeporn',
]

const BLOCKED_REGEX = [
  /\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage|schoolkid)s?\b[\s\S]{0,48}\b(porn|xxx|nude|naked|fuck|sexual|erotic\s*content)\b/i,
  /\b(porn|xxx|nude|erotic)\b[\s\S]{0,48}\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage)\b/i,
  /\b(rape|raping)\b[\s\S]{0,32}\b(site|video|stream|gallery|tube)\b/i,
  /\b(how\s+to)\b[\s\S]{0,64}\b(kidnap|abduct|murder|torture|waterboard)\b/i,
  /\b(hitman|contract\s+killing)\b/i,
  /\b(beheading|decapitat)\b[\s\S]{0,24}\b(video|site|live)\b/i,
  /\bisis\b[\s\S]{0,48}\b(recruit|fighter|extremist|terror|bomb)\b/i,
  /\b(plan|commit|carry\s+out)\b[\s\S]{0,40}\b(mass\s+shooting|bombing)\b/i,
  /\b(mass\s+shooting|school\s+shooting)\b[\s\S]{0,40}\b(plan|guide|tutorial|how\s+to)\b/i,
  /\bn[i1]gg+[a3]r[s]?\b/i,
  /\bk[i1]k[e2]s?\b/i,
  /\bc[h][i1]nk[s]?\b/i,
]

const applyLeet = (s: string) => {
  let out = ''
  for (const ch of s) {
    const low = ch.toLowerCase()
    out += LEET_MAP.get(low) ?? low
  }
  return out
}

export const normalizePolicyText = (raw: unknown) => {
  const t = String(raw ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(ZW_RE, '')
  const spaced = t.replace(/\s+/g, ' ').trim()
  const leetSpaced = applyLeet(spaced)
  const collapsed = leetSpaced.replace(/[^a-z0-9]+/g, '')
  return { spaced, leetSpaced, collapsed }
}

export const checkPromptContentPolicy = (raw: unknown) => {
  const text = typeof raw === 'string' ? raw.trim() : ''
  if (!text) return { ok: true as const }
  const { spaced, leetSpaced, collapsed } = normalizePolicyText(text)
  const haystacks = [spaced, leetSpaced, collapsed]
  for (const phrase of BLOCKED_PHRASES) {
    const p = phrase.toLowerCase().trim()
    for (const h of haystacks) {
      if (h.includes(p)) return { ok: false as const, code: 'CONTENT_POLICY' as const }
    }
  }
  for (const frag of BLOCKED_COLLAPSED) {
    if (collapsed.includes(frag)) return { ok: false as const, code: 'CONTENT_POLICY' as const }
  }
  for (const re of BLOCKED_REGEX) {
    re.lastIndex = 0
    if (re.test(spaced) || re.test(leetSpaced))
      return { ok: false as const, code: 'CONTENT_POLICY' as const }
  }
  return { ok: true as const }
}
