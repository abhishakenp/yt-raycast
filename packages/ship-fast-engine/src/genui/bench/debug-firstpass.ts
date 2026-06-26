import { shortlistFamilies, FAMILIES, brandFromPrompt } from '../v2-compose.ts'
import { getComponentSignature } from '../openui-signature.ts'
import { generateText } from '../../generate.ts'
import { DEFAULT_MODEL } from '../model-list.ts'

const model = DEFAULT_MODEL
const prompt = process.argv[2] || 'a boutique law firm for startups and IP'
const brand = brandFromPrompt(prompt)
const names = shortlistFamilies(prompt, 3)
console.log('shortlist:', names)
const shortlist = names.map((n) => FAMILIES.get(n)!).filter(Boolean)
const candidates = shortlist.map((fam) => ({
  family: fam.name,
  lines: fam.sections.map(
    (sec) =>
      `  ${sec.toLowerCase()}: ${getComponentSignature(`${fam.name}${sec}`) ?? ''}`,
  ),
}))
const sys = `You are a website superagent. Given a build request and CANDIDATE verticals with section signatures, choose the best vertical and author rich JSON props for its sections. Output ONLY {"family":"<Vertical>","sections":{"<key>":{...}}}. No prose/fences.`
const user = `Build request: ${prompt}\nBrand: ${brand}\nCandidates:\n${candidates.map((c) => `Vertical "${c.family}":\n${c.lines.join('\n')}`).join('\n\n')}\n\nReturn {"family","sections":{key:props}} for the chosen vertical.`
console.log('prompt chars:', sys.length + user.length)
const raw = await generateText(
  model,
  sys,
  user,
  new AbortController().signal,
  1,
)
console.log('=== RAW (first 1200) ===\n', raw.slice(0, 1200))
console.log('=== RAW len:', raw.length)
try {
  const t = raw.replace(/```[a-z]*/gi, '').trim()
  const obj = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1))
  console.log(
    'parsed family:',
    obj.family,
    '| section keys:',
    Object.keys(obj.sections || {}).join(','),
  )
} catch (e) {
  console.log('PARSE FAIL:', e instanceof Error ? e.message : String(e))
}
