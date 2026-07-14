import * as esbuild from 'esbuild'
import { describe, expect, it } from 'vitest'

import {
  buildLakebedClientComponentForTest,
  findUnboundClientReferences,
} from './openui-lakebed-export-builder'

/**
 * Regression coverage for the Lakebed deploy "blank render" bug class.
 *
 * The Lakebed client bundler resolves only preact/* and lakebed/client bare
 * imports; everything else is either stripped (zod, build-time-only) or vendored
 * (embla). Two historical bugs shipped bundles where a value identifier was
 * referenced but bound nowhere, so esbuild treated it as a global and the deploy
 * blank-rendered with a runtime ReferenceError:
 *   1. `z is not defined` — the prelude resolver followed a *type* edge
 *      (`z.infer<typeof officeSchema>`) and dragged a `const officeSchema =
 *      z.object(...)` + a reference to the stripped `z` into the client.
 *   2. `useEmblaCarousel is not defined` — the bare-import rewriter dropped the
 *      *default* binding of `import useEmblaCarousel, { type ... } from
 *      'embla-carousel-react'`, keeping only the named type.
 *
 * `findUnboundClientReferences` is the general guard: it flags any value
 * identifier that is bound nowhere in an emitted client module and is not a
 * runtime global. These tests exercise the real transformation and the guard.
 */

const HEADER = `import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
`

describe('findUnboundClientReferences (blank-render guard)', () => {
  it('flags a value referenced only via a dropped/stripped import', () => {
    // `useEmblaCarousel` is used at runtime but only its type was imported.
    const broken = `import { UseEmblaCarouselType } from '../../vendor/embla.js'
export const Block = () => {
  const [ref, api] = useEmblaCarousel({ loop: true })
  return ref ? api : null
}
`
    expect(
      findUnboundClientReferences(broken, 'client/components/x.tsx'),
    ).toEqual(['useEmblaCarousel'])
  })

  it('passes when the value binding is present (default import restored)', () => {
    const fixed = `import useEmblaCarousel from '../../vendor/embla.js'
export const Block = () => {
  const [ref, api] = useEmblaCarousel({ loop: true })
  return ref ? api : null
}
`
    expect(
      findUnboundClientReferences(fixed, 'client/components/x.tsx'),
    ).toEqual([])
  })

  it('does not false-positive on JSX intrinsics, member access, or type names', () => {
    const clean = `import { useState } from 'preact/hooks'
type CarouselApi = { scrollNext(): void }
export const Block = ({ items }: { items: string[] }) => {
  const [open, setOpen] = useState(false)
  const api: CarouselApi | null = null
  return (
    <div className="grid" onClick={() => setOpen(!open)}>
      {items.map((label) => (
        <span key={label}>{label.toUpperCase()}</span>
      ))}
      {open ? <p>{String(api?.scrollNext)}</p> : null}
    </div>
  )
}
`
    expect(
      findUnboundClientReferences(clean, 'client/components/x.tsx'),
    ).toEqual([])
  })
})

describe('lakebed client component zod handling', () => {
  it('does not leak a type-only zod schema into the client bundle (GovPortalFooter pattern)', async () => {
    const source = `${HEADER}
const officeSchema = z.object({
  name: z.string(),
  addr: z.string().optional(),
})

export const GovFooterX = defineCapsule({
  name: 'GovFooterX',
  description: 'gov footer',
  props: z.object({ headOffice: officeSchema.optional() }),
  component: ({ props }) => {
    const OfficeCard = ({ office }: { office?: z.infer<typeof officeSchema> }) => {
      if (!office) return null
      return <p>{office.name}</p>
    }
    return (
      <footer>
        <OfficeCard office={props.headOffice} />
      </footer>
    )
  },
})
`
    const built = buildLakebedClientComponentForTest('GovFooterX', source)
    expect(built).not.toBeNull()

    // Referenced only through a type annotation → excluded from the prelude…
    expect(built!.preludeSources.join('\n')).not.toContain('officeSchema')
    // …and the emitted module has no unbound value reference to `z`.
    expect(
      findUnboundClientReferences(built!.module, 'client/components/x.tsx'),
    ).toEqual([])

    const out = await esbuild.transform(built!.module, { loader: 'tsx' })
    expect(out.code).not.toContain('officeSchema')
    expect(out.code).not.toMatch(/\bz\s*\./)
  })

  it('surfaces a runtime zod use as an unbound `z` reference', () => {
    const source = `${HEADER}
export const RuntimeZod = defineCapsule({
  name: 'RuntimeZod',
  description: 'runtime zod',
  props: z.object({ value: z.string().optional() }),
  component: ({ props }) => {
    const schema = z.object({ v: z.string() })
    const ok = schema.safeParse({ v: props.value }).success
    return <div>{ok ? 'ok' : 'no'}</div>
  },
})
`
    const built = buildLakebedClientComponentForTest('RuntimeZod', source)
    expect(built).not.toBeNull()
    expect(
      findUnboundClientReferences(built!.module, 'client/components/x.tsx'),
    ).toContain('z')
  })

  it('still resolves genuine runtime helper dependencies into the prelude', async () => {
    const source = `${HEADER}
const HI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
const toHiNum = (value: string): string =>
  value.replace(/[0-9]/g, (digit) => HI_DIGITS[Number(digit)])

export const StatBlock = defineCapsule({
  name: 'StatBlock',
  description: 'stat',
  props: z.object({ value: z.string().optional() }),
  component: ({ props }) => <span>{toHiNum(String(props.value ?? '0'))}</span>,
})
`
    const built = buildLakebedClientComponentForTest('StatBlock', source)
    expect(built).not.toBeNull()

    const prelude = built!.preludeSources.join('\n')
    expect(prelude).toContain('toHiNum')
    expect(prelude).toContain('HI_DIGITS')
    expect(
      findUnboundClientReferences(built!.module, 'client/components/x.tsx'),
    ).toEqual([])

    const out = await esbuild.transform(built!.module, { loader: 'tsx' })
    expect(out.code).toContain('toHiNum')
  })
})
