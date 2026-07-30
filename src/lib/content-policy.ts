const ZW_RE = /[\u200B-\u200D\uFEFF\u2060-\u2064]/g

/**
 * Per-category block messages. The CSAM/terrorism/violence categories get the
 * severe zero-tolerance message. Counterfeit/fraud/drugs get a milder message
 * that accurately reflects the violation instead of alarming the user with
 * unrelated accusations.
 */
export const CONTENT_POLICY_MESSAGES = {
  csam: `STOP. Your request was blocked under our zero-tolerance rules for sexual content involving minors, non-consensual sexual material, and related illegal activity.

This attempt is logged with technical identifiers tied to your session. Repeated or egregious abuse can result in a permanent ban and disclosure to law enforcement where required.

Do not submit this type of content again.`,
  violence: `Your request was blocked because it describes graphic violence, murder, or harm to others. We do not build sites that promote or instruct on violence.

Do not submit this type of content again.`,
  terrorism: `Your request was blocked under our zero-tolerance rules for terrorism, bomb-making instructions, and mass-violence planning.

This attempt is logged with technical identifiers tied to your session. Do not submit this type of content again.`,
  self_harm: `Your request was blocked because it contains self-harm or suicide instructions. If you are struggling, please contact a crisis line: 988 (US) or find help at https://findahelpline.com.

Do not submit instructions for self-harm.`,
  hate: `Your request was blocked because it contains hate speech, racism, or white-supremacy content. We do not build sites that promote hate or discrimination.

Do not submit this type of content again.`,
  sexual_exploit: `Your request was blocked under our zero-tolerance rules for sexual exploitation, trafficking, and non-consensual material.

This attempt is logged with technical identifiers tied to your session. Do not submit this type of content again.`,
  fraud: `Your request was blocked because it describes a phishing page, credential harvester, or fraudulent service. We do not build sites designed to deceive or steal from users.

Do not submit this type of content again.`,
  counterfeit: `Your request was blocked because it describes selling counterfeit or knockoff branded goods. We do not build sites for counterfeit commerce.

Do not submit this type of content again.`,
  drugs: `Your request was blocked because it describes selling illegal drugs or controlled substances. We do not build sites for illegal drug commerce.

Do not submit this type of content again.`,
  malware: `Your request was blocked because it describes malware, ransomware, or credential-stealing tools. We do not build sites for malicious software distribution.

Do not submit this type of content again.`,
} as const

export type ContentPolicyCategory = keyof typeof CONTENT_POLICY_MESSAGES

/**
 * Legacy export — the severe CSAM/terrorism message. Kept for backward compat
 * with code that imports CONTENT_POLICY_CLIENT_MESSAGE directly. New code should
 * use the per-category message from checkPromptContentPolicy().message instead.
 */
export const CONTENT_POLICY_CLIENT_MESSAGE = CONTENT_POLICY_MESSAGES.csam

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

const BLOCKED_PHRASES: Array<{ phrase: string; category: ContentPolicyCategory }> = [
  { phrase: 'adult dating', category: 'sexual_exploit' },
  { phrase: 'adult entertainment', category: 'sexual_exploit' },
  { phrase: 'adult website', category: 'sexual_exploit' },
  { phrase: 'black market', category: 'drugs' },
  { phrase: 'buy stolen', category: 'drugs' },
  { phrase: 'child porn', category: 'csam' },
  { phrase: 'childporn', category: 'csam' },
  { phrase: 'child porno', category: 'csam' },
  { phrase: 'counterfeit goods', category: 'counterfeit' },
  { phrase: 'counterfeit products', category: 'counterfeit' },
  { phrase: 'credential harvester', category: 'fraud' },
  { phrase: 'credit card skimmer', category: 'fraud' },
  { phrase: 'kid porn', category: 'csam' },
  { phrase: 'kids porn', category: 'csam' },
  { phrase: 'malware download', category: 'malware' },
  { phrase: 'malware site', category: 'malware' },
  { phrase: 'minor porn', category: 'csam' },
  { phrase: 'nazi propaganda', category: 'hate' },
  { phrase: 'onlyfans clone', category: 'sexual_exploit' },
  { phrase: 'teen porn', category: 'csam' },
  { phrase: 'phishing login', category: 'fraud' },
  { phrase: 'phishing page', category: 'fraud' },
  { phrase: 'phishing site', category: 'fraud' },
  { phrase: 'preteen porn', category: 'csam' },
  { phrase: 'racist website', category: 'hate' },
  { phrase: 'scam landing page', category: 'fraud' },
  { phrase: 'scam website', category: 'fraud' },
  { phrase: 'sex chat', category: 'sexual_exploit' },
  { phrase: 'sex site', category: 'sexual_exploit' },
  { phrase: 'sex toy store', category: 'sexual_exploit' },
  { phrase: 'sexual services', category: 'sexual_exploit' },
  { phrase: 'underage porn', category: 'csam' },
  { phrase: 'underage sex', category: 'csam' },
  { phrase: 'underage nude', category: 'csam' },
  { phrase: 'underage naked', category: 'csam' },
  { phrase: 'jailbait', category: 'csam' },
  { phrase: 'pedo porn', category: 'csam' },
  { phrase: 'pedoph', category: 'csam' },
  { phrase: 'paedoph', category: 'csam' },
  { phrase: 'lolicon', category: 'csam' },
  { phrase: 'shotacon', category: 'csam' },
  { phrase: 'toddler porn', category: 'csam' },
  { phrase: 'baby porn', category: 'csam' },
  { phrase: 'elementary porn', category: 'csam' },
  { phrase: 'schoolgirl porn', category: 'csam' },
  { phrase: 'school boy porn', category: 'csam' },
  { phrase: 'incest porn', category: 'csam' },
  { phrase: 'rape porn', category: 'sexual_exploit' },
  { phrase: 'rape video', category: 'sexual_exploit' },
  { phrase: 'snuff film', category: 'violence' },
  { phrase: 'snuff video', category: 'violence' },
  { phrase: 'gore porn', category: 'violence' },
  { phrase: 'necroph', category: 'violence' },
  { phrase: 'bestiality', category: 'violence' },
  { phrase: 'zoophil', category: 'violence' },
  { phrase: 'animal sex', category: 'violence' },
  { phrase: 'deepfake nude', category: 'sexual_exploit' },
  { phrase: 'deepfake porn', category: 'sexual_exploit' },
  { phrase: 'revenge porn', category: 'sexual_exploit' },
  { phrase: 'non-consensual porn', category: 'sexual_exploit' },
  { phrase: 'sex trafficking', category: 'sexual_exploit' },
  { phrase: 'human trafficking site', category: 'sexual_exploit' },
  { phrase: 'buy sex slave', category: 'sexual_exploit' },
  { phrase: 'how to bomb', category: 'terrorism' },
  { phrase: 'make a bomb', category: 'terrorism' },
  { phrase: 'bomb tutorial', category: 'terrorism' },
  { phrase: 'how to make explosives', category: 'terrorism' },
  { phrase: 'ricin recipe', category: 'terrorism' },
  { phrase: 'anthrax how', category: 'terrorism' },
  { phrase: 'suicide method', category: 'self_harm' },
  { phrase: 'how to kill yourself', category: 'self_harm' },
  { phrase: 'self harm tutorial', category: 'self_harm' },
  { phrase: 'fentanyl synthesis', category: 'drugs' },
  { phrase: 'how to make meth', category: 'drugs' },
  { phrase: 'cp site', category: 'csam' },
  { phrase: 'pornhub clone', category: 'sexual_exploit' },
  { phrase: 'onlyfans clone porn', category: 'sexual_exploit' },
  { phrase: 'porn site', category: 'sexual_exploit' },
  { phrase: 'porn website', category: 'sexual_exploit' },
  { phrase: 'xxx tube', category: 'sexual_exploit' },
  { phrase: 'hardcore porn site', category: 'sexual_exploit' },
  { phrase: 'live sex cam site', category: 'sexual_exploit' },
  { phrase: 'webcam sex site', category: 'sexual_exploit' },
  { phrase: 'escort trafficking', category: 'sexual_exploit' },
  { phrase: 'chloroform abduct', category: 'violence' },
  { phrase: 'chloroform kidnap', category: 'violence' },
  { phrase: 'fake bank login', category: 'fraud' },
  { phrase: 'fake stripe checkout', category: 'fraud' },
  { phrase: 'fake paypal login', category: 'fraud' },
  { phrase: 'steal passwords', category: 'fraud' },
  { phrase: 'steal credit cards', category: 'fraud' },
]

const BLOCKED_COLLAPSED: Array<{ frag: string; category: ContentPolicyCategory }> = [
  { frag: 'childporn', category: 'csam' },
  { frag: 'kidporn', category: 'csam' },
  { frag: 'pedoporn', category: 'csam' },
  { frag: 'jailbait', category: 'csam' },
  { frag: 'lolicon', category: 'csam' },
  { frag: 'shotacon', category: 'csam' },
  { frag: 'snuffporn', category: 'violence' },
  { frag: 'zoophil', category: 'violence' },
  { frag: 'bestiality', category: 'violence' },
  { frag: 'incestporn', category: 'csam' },
  { frag: 'rapeporn', category: 'sexual_exploit' },
]

/**
 * Each blocked regex is tagged with a category so the user sees an accurate
 * message instead of the generic CSAM/terrorism warning for every block.
 *
 * Counterfeit regex narrowed: "counterfeit" + brand is always blocked (the
 * word itself implies illegal commerce). "clone/copy/knockoff/replica" + brand
 * is only blocked when a commercial-intent verb (sell/buy/make/manufacture/
 * distribute/store/shop/marketplace) appears nearby — this allows legitimate
 * sneaker authenticity review blogs, fashion comparison guides, and parody
 * sites while still blocking counterfeit storefronts.
 */
const BLOCKED_REGEX: Array<{ re: RegExp; category: ContentPolicyCategory }> = [
  { re: /\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage|schoolkid)s?\b[\s\S]{0,48}\b(porn|xxx|nude|naked|fuck|sexual|erotic\s*content)\b/i, category: 'csam' },
  { re: /\b(porn|xxx|nude|erotic)\b[\s\S]{0,48}\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage)\b/i, category: 'csam' },
  { re: /\b(porn|xxx|escort|brothel|fetish|bdsm|erotic|explicit|nude|naked|onlyfans|adult\s+content)\b[\s\S]{0,64}\b(site|website|app|landing|marketplace|directory|booking|clone|gallery|store)\b/i, category: 'sexual_exploit' },
  { re: /\b(site|website|app|landing|marketplace|directory|booking|clone|gallery|store)\b[\s\S]{0,64}\b(porn|xxx|escort|brothel|fetish|bdsm|erotic|explicit|nude|naked|onlyfans|adult\s+content)\b/i, category: 'sexual_exploit' },
  { re: /\b(rape|raping)\b[\s\S]{0,32}\b(site|video|stream|gallery|tube)\b/i, category: 'sexual_exploit' },
  { re: /\b(how\s+to)\b[\s\S]{0,64}\b(kidnap|abduct|murder|torture|waterboard)\b/i, category: 'violence' },
  { re: /\b(hitman|contract\s+killing)\b/i, category: 'violence' },
  { re: /\b(beheading|decapitat)\b[\s\S]{0,24}\b(video|site|live)\b/i, category: 'violence' },
  { re: /\bisis\b[\s\S]{0,48}\b(recruit|fighter|extremist|terror|bomb)\b/i, category: 'terrorism' },
  { re: /\b(plan|commit|carry\s+out)\b[\s\S]{0,40}\b(mass\s+shooting|bombing)\b/i, category: 'terrorism' },
  { re: /\b(mass\s+shooting|school\s+shooting)\b[\s\S]{0,40}\b(plan|guide|tutorial|how\s+to)\b/i, category: 'terrorism' },
  { re: /\b(phishing|spoof|fake)\b[\s\S]{0,40}\b(login|checkout|bank|paypal|stripe|coinbase|wallet|oauth|2fa|password)\b/i, category: 'fraud' },
  { re: /\b(steal|harvest|collect)\b[\s\S]{0,40}\b(passwords?|credentials?|credit\s*cards?|private\s*keys?|seed\s*phrases?)\b/i, category: 'fraud' },
  { re: /\b(malware|ransomware|keylogger|trojan|botnet|credential\s*stealer)\b[\s\S]{0,40}\b(site|website|landing|download|builder|dashboard|panel)\b/i, category: 'malware' },
  { re: /\b(sell|buy|marketplace|store)\b[\s\S]{0,40}\b(drugs?|fentanyl|cocaine|heroin|stolen|fake\s*ids?|weapons?|guns?)\b/i, category: 'drugs' },
  // Counterfeit + brand is always blocked (the word itself implies illegal commerce)
  { re: /\bcounterfeit\b[\s\S]{0,40}\b(nike|adidas|apple|stripe|paypal|disney|marvel|pokemon|supreme|gucci|prada|louis\s*vuitton)\b/i, category: 'counterfeit' },
  // clone/copy/knockoff/replica + brand is only blocked with commercial intent
  { re: /\b(sell|buy|make|manufacture|distribute|store|shop|marketplace)\b[\s\S]{0,40}\b(clone|copy|knockoff|replica)\b[\s\S]{0,40}\b(nike|adidas|apple|stripe|paypal|disney|marvel|pokemon|supreme|gucci|prada|louis\s*vuitton)\b/i, category: 'counterfeit' },
  { re: /\b(white\s*power|race\s*war|ethnic\s*cleansing|genocide)\b/i, category: 'hate' },
  { re: /\bn[i1]gg+[a3]r[s]?\b/i, category: 'hate' },
  { re: /\bk[i1]k[e2]s?\b/i, category: 'hate' },
  { re: /\bc[h][i1]nk[s]?\b/i, category: 'hate' },
  { re: /\bf[a@]gg[o0]t[s]?\b/i, category: 'hate' },
]

function applyLeet(s: string) {
  let out = ''
  for (const ch of s) {
    const low = ch.toLowerCase()
    out += LEET_MAP.get(low) ?? low
  }
  return out
}

export function normalizePolicyText(raw: unknown) {
  const t = String(raw ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(ZW_RE, '')
  const spaced = t.replace(/\s+/g, ' ').trim()
  const leetSpaced = applyLeet(spaced)
  const collapsed = leetSpaced.replace(/[^a-z0-9]+/g, '')
  return { spaced, leetSpaced, collapsed }
}

export function checkPromptContentPolicy(raw: unknown) {
  const text = typeof raw === 'string' ? raw.trim() : ''
  if (!text) return { ok: true as const }
  const { spaced, leetSpaced, collapsed } = normalizePolicyText(text)
  const haystacks = [spaced, leetSpaced, collapsed]
  for (const { phrase, category } of BLOCKED_PHRASES) {
    const p = phrase.toLowerCase().trim()
    for (const h of haystacks) {
      if (h.includes(p))
        return {
          ok: false as const,
          code: 'CONTENT_POLICY' as const,
          category,
          message: CONTENT_POLICY_MESSAGES[category],
        }
    }
  }
  for (const { frag, category } of BLOCKED_COLLAPSED) {
    if (collapsed.includes(frag))
      return {
        ok: false as const,
        code: 'CONTENT_POLICY' as const,
        category,
        message: CONTENT_POLICY_MESSAGES[category],
      }
  }
  for (const { re, category } of BLOCKED_REGEX) {
    re.lastIndex = 0
    if (re.test(spaced) || re.test(leetSpaced))
      return {
        ok: false as const,
        code: 'CONTENT_POLICY' as const,
        category,
        message: CONTENT_POLICY_MESSAGES[category],
      }
  }
  return { ok: true as const }
}
