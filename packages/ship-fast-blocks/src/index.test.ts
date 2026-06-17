import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { componentNames } from './component-names.ts'

describe('@ship-fast/blocks root exports', () => {
  it('keeps generated source manifests behind the generated subpath', () => {
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/index.ts'),
      'utf8',
    )

    expect(source).not.toContain('./generated/component-spec.json')
    expect(source).not.toContain('./generated/react-export-sources.json')
    expect(source).not.toContain('reactExportSources')
    expect(source).not.toContain('componentSpec')
  })

  it('exports generated React source metadata through the compressed manifest', () => {
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/generated/index.ts'),
      'utf8',
    )

    expect(source).toContain('./react-export-sources.compressed')
    expect(source).not.toContain('./react-export-sources.json')
    expect(source).not.toContain('reactExportSources from')
  })

  it('keeps the browser runtime subpath independent from the eager full library', () => {
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/runtime.ts'),
      'utf8',
    )

    expect(source).not.toContain('./library')
    expect(source).not.toContain('registry/all')
    expect(source).not.toContain('capsules/index')
  })

  it('keeps the theme subpath independent from the eager full library', () => {
    const packageJson = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/package.json'),
      'utf8',
    )
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/theme.ts'),
      'utf8',
    )

    expect(packageJson).toContain('"./theme": "./src/theme.ts"')
    expect(source).toContain('./theme-presets')
    expect(source).toContain('./theme-apply')
    expect(source).not.toContain('./library')
    expect(source).not.toContain('registry/all')
    expect(source).not.toContain('capsules/index')
  })

  it('keeps the component-name subpath independent from the eager full library and runtime loaders', () => {
    const packageJson = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/package.json'),
      'utf8',
    )
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/component-names.ts'),
      'utf8',
    )

    expect(packageJson).toContain(
      '"./component-names": "./src/component-names.ts"',
    )
    expect(source).toContain('./generated/runtime-component-names')
    expect(source).not.toContain('./library')
    expect(source).not.toContain('runtime-component-loaders')
    expect(source).not.toContain('registry/all')
    expect(source).not.toContain('capsules/index')
  })

  it('serves renderer component names from the lightweight generated manifest', () => {
    expect(componentNames).toContain('Stack')
    expect(componentNames).toContain('Heading')
    expect(componentNames).toContain('Button')
  })

  it('keeps the server renderer theme import off the eager blocks barrel', () => {
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-engine/src/renderers/index.ts'),
      'utf8',
    )

    expect(source).toContain('@ship-fast/blocks/theme')
    expect(source).not.toContain("from '@ship-fast/blocks'")
    expect(source).not.toContain('from "@ship-fast/blocks"')
  })

  it('keeps clone conversion component validation off the eager blocks barrel', () => {
    const source = readFileSync(
      join(process.cwd(), 'packages/ship-fast-engine/src/clone/convert.ts'),
      'utf8',
    )

    expect(source).toContain('@ship-fast/blocks/component-names')
    expect(source).not.toContain("from '@ship-fast/blocks'")
    expect(source).not.toContain('from "@ship-fast/blocks"')
  })
})
