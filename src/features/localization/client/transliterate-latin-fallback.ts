const DEVANAGARI_CONSONANTS: Record<string, string> = {
  bh: 'भ',
  ch: 'च',
  dh: 'ध',
  gh: 'घ',
  jh: 'झ',
  kh: 'ख',
  ng: 'ङ',
  ph: 'फ',
  sh: 'श',
  th: 'थ',
  b: 'ब',
  d: 'ड',
  f: 'फ़',
  g: 'ग',
  h: 'ह',
  j: 'ज',
  k: 'क',
  l: 'ल',
  m: 'म',
  n: 'न',
  p: 'प',
  r: 'र',
  s: 'स',
  t: 'ट',
  v: 'व',
  w: 'व',
  y: 'य',
  z: 'ज़',
}

const DEVANAGARI_INDEPENDENT_VOWELS: Record<string, string> = {
  ai: 'ऐ',
  au: 'औ',
  ii: 'ई',
  uu: 'ऊ',
  Q: 'ऑ',
  a: 'अ',
  e: 'ए',
  i: 'इ',
  o: 'ओ',
  u: 'उ',
}

const DEVANAGARI_VOWEL_MARKS: Record<string, string> = {
  ai: 'ै',
  au: 'ौ',
  ii: 'ी',
  uu: 'ू',
  Q: 'ॉ',
  a: '',
  e: 'े',
  i: 'ि',
  o: 'ो',
  u: 'ु',
}

function englishSpellingToPhoneticHindi(word: string): string {
  return word
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLowerCase()
    .replace(/^cho(?=co)/, 'chQ')
    .replace(/tch/g, 'ch')
    .replace(/qu/g, 'kw')
    .replace(/ck/g, 'k')
    .replace(/ph/g, 'f')
    .replace(/oo/g, 'u')
    .replace(/(?:ee|ea)/g, 'ii')
    .replace(/ie$/g, 'ii')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c(?!h)/g, 'k')
    .replace(/a([bcdfghjklmnpqrstvwxyz])e$/g, 'e$1')
    .replace(/([eiou])([bcdfghjklmnpqrstvwxyz])e$/g, '$1$2')
    .replace(/o(?=[bcdfghjklmnpqrstvwxyz][aeiou])/g, 'a')
    .replace(/q/g, 'k')
    .replace(/x/g, 'ks')
}

function latinWordToDevanagari(word: string): string {
  const phonetic = englishSpellingToPhoneticHindi(word)
  let output = ''
  let index = 0
  let awaitingVowel = false

  while (index < phonetic.length) {
    const pair = phonetic.slice(index, index + 2)
    const vowelToken =
      DEVANAGARI_INDEPENDENT_VOWELS[pair] !== undefined
        ? pair
        : DEVANAGARI_INDEPENDENT_VOWELS[phonetic[index]] !== undefined
          ? phonetic[index]
          : null

    if (vowelToken) {
      output += awaitingVowel
        ? DEVANAGARI_VOWEL_MARKS[vowelToken]
        : DEVANAGARI_INDEPENDENT_VOWELS[vowelToken]
      awaitingVowel = false
      index += vowelToken.length
      continue
    }

    const consonantToken =
      DEVANAGARI_CONSONANTS[pair] !== undefined
        ? pair
        : DEVANAGARI_CONSONANTS[phonetic[index]] !== undefined
          ? phonetic[index]
          : null

    if (consonantToken) {
      if (awaitingVowel) output += '्'
      output += DEVANAGARI_CONSONANTS[consonantToken]
      awaitingVowel = true
      index += consonantToken.length
      continue
    }

    output += phonetic[index]
    awaitingVowel = false
    index += 1
  }

  return output
}

/**
 * Last-resort script consistency for untranslated Latin proper names.
 * Network/browser translation remains authoritative; this only prevents mixed
 * Latin/native accessible names when a translator echoes the source text.
 */
export function transliterateLatinFallback(
  text: string,
  locale: string,
): string {
  const language = locale.trim().toLowerCase().split(/[-_]/)[0]
  if (language !== 'hi') return text
  return text.replace(
    /\p{Script=Latin}[\p{Script=Latin}\p{Mark}]*/gu,
    latinWordToDevanagari,
  )
}
