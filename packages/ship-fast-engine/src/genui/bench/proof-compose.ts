import { writeFileSync } from 'node:fs'
import { synthesizeComponentCall } from '../openui-signature.ts'
import { auditOpenUIProgram } from '../openui-program-audit.ts'
import { renderOpenUIToHTML } from '../../openui-ssr'

const FAMILY = 'Crm'
const SECTIONS = [
  'Navbar',
  'Hero',
  'Logos',
  'Features',
  'Stats',
  'Pricing',
  'Testimonials',
  'Faq',
  'Cta',
  'Footer',
]
const ctx = {
  brand: 'Northwind CRM',
  nav: ['Home', 'Product', 'Pricing', 'Contact'],
  topic: 'an all-in-one CRM for small sales teams',
  pageLabel: 'Home',
}

const stmts: string[] = []
const ids: string[] = []
for (const sec of SECTIONS) {
  const comp = `${FAMILY}${sec}`
  const body = synthesizeComponentCall(comp, ctx)
  if (!body) {
    console.log('NO SPEC for', comp)
    continue
  }
  const id = sec.toLowerCase()
  ids.push(id)
  stmts.push(`${id} = ${body}`)
}
const source = `${stmts.join('\n')}\nhome = Stack([${ids.join(', ')}])\nroot = PageSwitch(["Home"], [home])`

console.log('composed sections:', ids.length, '| source chars:', source.length)
try {
  await auditOpenUIProgram(source, {
    expectedRoot: 'PageSwitch',
    expectedPageIds: ['home'],
  })
  console.log('AUDIT: VALID ✅')
} catch (e) {
  console.log('AUDIT FAILED:', e instanceof Error ? e.message : String(e))
}

const html = await renderOpenUIToHTML(source, undefined, 'en')
writeFileSync('/tmp/compose-proof.html', html)
console.log('rendered HTML chars:', html.length, '→ /tmp/compose-proof.html')
console.log('has section markers:', /CrmHero|hero|Pricing|pricing/i.test(html))
