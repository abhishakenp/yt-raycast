const MIXED_ENGLISH_SLANG_KEYWORDS: Record<string, string[]> = {
  ta: ['tanglish', 'tanglish website', 'in tanglish'],
  te: ['tenglish', 'teluglish', 'telugu english mix'],
  kn: ['kanglish', 'kanglish website'],
  ml: ['manglish', 'manglish website', 'in manglish'],
  bn: ['benglish', 'banglish', 'bengali english mix'],
  mr: ['marathi english mix'],
  gu: ['gunglish', 'gujarati english mix'],
  pa: ['punglish', 'punjabi english mix'],
  or: ['odia english mix', 'oriya english mix'],
  as: ['assamese english mix'],
  ur: ['urdu english mix'],
  mai: ['maithili english mix'],
  kok: ['konkani english mix'],
  mni: ['manipuri english mix'],
  sat: ['santali english mix'],
  ks: ['kashmiri english mix'],
  doi: ['dogri english mix'],
  brx: ['bodo english mix'],
  sd: ['sindhi english mix'],
  sa: ['sanskrit english mix'],
  ne: ['nepali english mix'],
}

export const preferMixedEnglishBcp47FromSnippet = (snippet: string) => {
  const pl = String(snippet || '').toLowerCase()
  if (/\bhinglish\b/.test(pl)) return 'hinglish'
  if (/\bmanglish\b/.test(pl)) return 'ml-en'
  if (/\btanglish\b/.test(pl)) return 'ta-en'
  if (/\b(tenglish|teluglish)\b/.test(pl)) return 'te-en'
  if (/\bkanglish\b/.test(pl)) return 'kn-en'
  if (/\b(benglish|banglish)\b/.test(pl)) return 'bn-en'
  if (/\bgunglish\b/.test(pl)) return 'gu-en'
  if (/\bpunglish\b/.test(pl)) return 'pa-en'
  for (const [pureCode, words] of Object.entries(MIXED_ENGLISH_SLANG_KEYWORDS)) {
    for (const w of words) {
      if (pl.includes(w.toLowerCase())) return `${pureCode}-en`
    }
  }
  return null
}
