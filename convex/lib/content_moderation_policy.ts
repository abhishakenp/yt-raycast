export type ModerationCategory =
  | 'sexual_minors'
  | 'explicit_sexual_content'
  | 'non_consensual_exploitative'
  | 'hate_extremism'
  | 'graphic_violence'
  | 'self_harm'
  | 'fraud_malware'
  | 'illegal_dangerous_activity'
  | 'other_policy_violation'

export type ModerationSurface =
  | 'session_create'
  | 'design_reference_notes'
  | 'clone_brief'
  | 'clone_regeneration'
  | 'section_edit'
  | 'rewrite_instruction'
  | 'rewrite_text'
  | 'translation_source'
  | 'custom_language'

export type ModerationField =
  | 'prompt'
  | 'designReferenceNotes'
  | 'cloneBrief'
  | 'cloneRegeneration'
  | 'sectionEdit'
  | 'rewriteInstruction'
  | 'rewriteText'
  | 'translationSource'
  | 'customLanguage'

export type ModerationFields = Partial<Record<ModerationField, unknown>>

type BlockedDecision = {
  decision: 'blocked'
  category: ModerationCategory
  ruleId: string
  matchedField: ModerationField
  source: 'deterministic'
  prompt: string
}

type ModerationDecision = { decision: 'safe' } | BlockedDecision

type Rule = {
  id: string
  category: ModerationCategory
  matches: (text: NormalizedPolicyText) => boolean
}

type NormalizedPolicyText = {
  spaced: string
  leetSpaced: string
  collapsed: string
}

const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF\u2060-\u2064]/g

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

const FIELD_ORDER: ModerationField[] = [
  'prompt',
  'designReferenceNotes',
  'cloneBrief',
  'cloneRegeneration',
  'sectionEdit',
  'rewriteInstruction',
  'rewriteText',
  'translationSource',
  'customLanguage',
]

const UNCONDITIONAL_CATEGORIES = new Set<ModerationCategory>([
  'sexual_minors',
  'non_consensual_exploitative',
])

const ACTIONABLE_REQUEST_RE =
  /\b(build|create|make|launch|design|develop|deploy|generate|write|add|provide|produce|host|publish|promote|recruit|sell|buy|market|clone|copy|set\s+up|show\s+me|teach\s+me|give\s+me|help\s+me|how\s+to)\b/i

const SAFE_CONTEXT_RE =
  /\b(anti[-\s]?hate|archive|awareness|clinical|counter[-\s]?speech|documentary|educational?|health|histor(?:y|ical)|journalis[mt]|museum|news|non[-\s]?graphic|prevention|recogniz(?:e|ing)|reporting|research|safety|warning signs?)\b/i

const phraseRules: Array<[ModerationCategory, string, string[]]> = [
  [
    'sexual_minors',
    'sexual-minors',
    [
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
      'cp site',
    ],
  ],
  [
    'explicit_sexual_content',
    'explicit-sexual-content',
    [
      'adult dating',
      'adult entertainment',
      'adult website',
      'onlyfans clone',
      'sex chat',
      'sex site',
      'sex toy store',
      'sexual services',
      'incest porn',
      'bestiality',
      'zoophil',
      'animal sex',
      'pornhub clone',
      'onlyfans clone porn',
      'porn site',
      'porn website',
      'xxx tube',
      'hardcore porn site',
      'live sex cam site',
      'webcam sex site',
    ],
  ],
  [
    'non_consensual_exploitative',
    'exploitative-content',
    [
      'rape porn',
      'rape video',
      'deepfake nude',
      'deepfake porn',
      'revenge porn',
      'non-consensual porn',
      'sex trafficking',
      'human trafficking site',
      'buy sex slave',
      'escort trafficking',
    ],
  ],
  [
    'graphic_violence',
    'graphic-violence',
    ['snuff film', 'snuff video', 'gore porn', 'necroph'],
  ],
  [
    'self_harm',
    'self-harm',
    ['suicide method', 'how to kill yourself', 'self harm tutorial'],
  ],
  [
    'fraud_malware',
    'fraud-malware',
    [
      'credential harvester',
      'credit card skimmer',
      'malware download',
      'malware site',
      'phishing login',
      'phishing page',
      'phishing site',
      'scam landing page',
      'scam website',
      'fake bank login',
      'fake stripe checkout',
      'fake paypal login',
      'steal passwords',
      'steal credit cards',
    ],
  ],
  [
    'illegal_dangerous_activity',
    'illegal-dangerous-activity',
    [
      'black market',
      'buy stolen',
      'how to bomb',
      'make a bomb',
      'bomb tutorial',
      'how to make explosives',
      'ricin recipe',
      'anthrax how',
      'fentanyl synthesis',
      'how to make meth',
      'chloroform abduct',
      'chloroform kidnap',
    ],
  ],
  [
    'other_policy_violation',
    'other-policy-violation',
    ['counterfeit goods', 'counterfeit products'],
  ],
  [
    'hate_extremism',
    'hate-extremism',
    [
      'nazi propaganda',
      'racist website',
      'white power',
      'race war',
      'ethnic cleansing',
      'genocide',
    ],
  ],
]

const collapsedRules: Array<[ModerationCategory, string, string[]]> = [
  [
    'sexual_minors',
    'sexual-minors-collapsed',
    ['childporn', 'kidporn', 'pedoporn', 'jailbait', 'lolicon', 'shotacon'],
  ],
  ['non_consensual_exploitative', 'exploitative-collapsed', ['rapeporn']],
  ['graphic_violence', 'graphic-violence-collapsed', ['snuffporn']],
  [
    'explicit_sexual_content',
    'explicit-sexual-content-collapsed',
    ['zoophil', 'bestiality', 'incestporn'],
  ],
]

const regexRules: Array<[ModerationCategory, string, RegExp]> = [
  [
    'sexual_minors',
    'sexual-minors-proximity',
    /\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage|schoolkid)\w*\b[\s\S]{0,48}\b(porn|xxx|nude|naked|fuck|sexual|erotic\s*content)\b/i,
  ],
  [
    'sexual_minors',
    'sexual-minors-reversed-proximity',
    /\b(porn|xxx|nude|erotic)\b[\s\S]{0,48}\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage)\b/i,
  ],
  [
    'explicit_sexual_content',
    'explicit-sexual-content-site',
    /\b(porn|xxx|escort|brothel|fetish|bdsm|erotic|explicit|nude|naked|onlyfans|adult\s+content)\b[\s\S]{0,64}\b(site|website|app|landing|marketplace|directory|booking|clone|gallery|store)\b/i,
  ],
  [
    'explicit_sexual_content',
    'explicit-sexual-content-site-reversed',
    /\b(site|website|app|landing|marketplace|directory|booking|clone|gallery|store)\b[\s\S]{0,64}\b(porn|xxx|escort|brothel|fetish|bdsm|erotic|explicit|nude|naked|onlyfans|adult\s+content)\b/i,
  ],
  [
    'non_consensual_exploitative',
    'exploitative-rape-site',
    /\b(rape|raping)\b[\s\S]{0,32}\b(site|video|stream|gallery|tube)\b/i,
  ],
  [
    'illegal_dangerous_activity',
    'dangerous-violent-instructions',
    /\b(how\s+to)\b[\s\S]{0,64}\b(kidnap|abduct|murder|torture|waterboard)\b/i,
  ],
  [
    'illegal_dangerous_activity',
    'dangerous-contract-killing',
    /\b(hitman|contract\s+killing)\b/i,
  ],
  [
    'graphic_violence',
    'graphic-beheading-site',
    /\b(beheading|decapitat)\b[\s\S]{0,24}\b(video|site|live)\b/i,
  ],
  [
    'hate_extremism',
    'extremism-recruitment',
    /\bisis\b[\s\S]{0,48}\b(recruit|fighter|extremist|terror|bomb)\b/i,
  ],
  [
    'illegal_dangerous_activity',
    'dangerous-mass-violence',
    /\b(plan|commit|carry\s+out)\b[\s\S]{0,40}\b(mass\s+shooting|bombing)\b/i,
  ],
  [
    'illegal_dangerous_activity',
    'dangerous-mass-violence-reversed',
    /\b(mass\s+shooting|school\s+shooting)\b[\s\S]{0,40}\b(plan|guide|tutorial|how\s+to)\b/i,
  ],
  [
    'fraud_malware',
    'fraud-phishing',
    /\b(phishing|spoof|fake)\b[\s\S]{0,40}\b(login|checkout|bank|paypal|stripe|coinbase|wallet|oauth|2fa|password)\b/i,
  ],
  [
    'fraud_malware',
    'fraud-theft',
    /\b(steal|harvest|collect)\b[\s\S]{0,40}\b(passwords?|credentials?|credit\s*cards?|private\s*keys?|seed\s*phrases?)\b/i,
  ],
  [
    'fraud_malware',
    'fraud-malware',
    /\b(malware|ransomware|keylogger|trojan|botnet|credential\s*stealer)\b[\s\S]{0,40}\b(site|website|landing|download|builder|dashboard|panel)\b/i,
  ],
  [
    'illegal_dangerous_activity',
    'illegal-marketplace',
    /\b(sell|buy|marketplace|store)\b[\s\S]{0,40}\b(drugs?|fentanyl|cocaine|heroin|stolen|counterfeit|fake\s*ids?|weapons?|guns?)\b/i,
  ],
  [
    'other_policy_violation',
    'other-counterfeit-clone',
    /\b(clone|copy|counterfeit|knockoff|replica)\b[\s\S]{0,40}\b(nike|adidas|apple|stripe|paypal|disney|marvel|pokemon|supreme|gucci|prada|louis\s*vuitton)\b/i,
  ],
  [
    'hate_extremism',
    'hate-slur',
    /\bn[i1]gg+[a3]r[s]?\b|\bk[i1]k[e2]s?\b|\bc[h][i1]nk[s]?\b|\bf[a@]gg[o0]t[s]?\b/i,
  ],
]

const applyLeet = (value: string) =>
  [...value]
    .map(
      (character) =>
        LEET_MAP.get(character.toLowerCase()) ?? character.toLowerCase(),
    )
    .join('')

export const normalizePolicyText = (raw: unknown): NormalizedPolicyText => {
  const text = String(raw ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(ZERO_WIDTH_RE, '')
  const spaced = text.replace(/\s+/g, ' ').trim()
  const leetSpaced = applyLeet(spaced)
  return {
    spaced,
    leetSpaced,
    collapsed: leetSpaced.replace(/[^a-z0-9]+/g, ''),
  }
}

const createPhraseRule = (
  category: ModerationCategory,
  id: string,
  phrases: string[],
): Rule => ({
  id: `det-${id}`,
  category,
  matches: ({ spaced, leetSpaced, collapsed }) =>
    phrases.some((phrase) => {
      const normalizedPhrase = normalizePolicyText(phrase)
      return (
        spaced.includes(normalizedPhrase.spaced) ||
        leetSpaced.includes(normalizedPhrase.leetSpaced) ||
        collapsed.includes(normalizedPhrase.collapsed)
      )
    }),
})

const createCollapsedRule = (
  category: ModerationCategory,
  id: string,
  fragments: string[],
): Rule => ({
  id: `det-${id}`,
  category,
  matches: ({ collapsed }) =>
    fragments.some((fragment) => collapsed.includes(fragment)),
})

const createRegexRule = (
  category: ModerationCategory,
  id: string,
  pattern: RegExp,
): Rule => ({
  id: `det-${id}`,
  category,
  matches: ({ spaced, leetSpaced }) =>
    pattern.test(spaced) || pattern.test(leetSpaced),
})

const RULES = [
  ...phraseRules.map(([category, id, phrases]) =>
    createPhraseRule(category, id, phrases),
  ),
  ...collapsedRules.map(([category, id, fragments]) =>
    createCollapsedRule(category, id, fragments),
  ),
  ...regexRules.map(([category, id, pattern]) =>
    createRegexRule(category, id, pattern),
  ),
]

const shouldBlockRuleMatch = (
  category: ModerationCategory,
  normalized: NormalizedPolicyText,
) =>
  UNCONDITIONAL_CATEGORIES.has(category) ||
  ACTIONABLE_REQUEST_RE.test(normalized.leetSpaced) ||
  !SAFE_CONTEXT_RE.test(normalized.leetSpaced)

export const classifyDeterministicModeration = (
  fields: ModerationFields,
): ModerationDecision => {
  for (const matchedField of FIELD_ORDER) {
    const prompt = fields[matchedField]
    if (typeof prompt !== 'string' || !prompt.trim()) continue
    const normalized = normalizePolicyText(prompt)
    const rule = RULES.find(
      (candidate) =>
        candidate.matches(normalized) &&
        shouldBlockRuleMatch(candidate.category, normalized),
    )
    if (rule)
      return {
        decision: 'blocked',
        category: rule.category,
        ruleId: rule.id,
        matchedField,
        source: 'deterministic',
        prompt,
      }
  }
  return { decision: 'safe' }
}
