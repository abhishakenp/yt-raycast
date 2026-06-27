import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  patchOpenUiSourceWithAiCapsule,
} from './section-edit-response'

// We test the exported pure functions. The main handler requires Convex +
// esbuild + LLM mocking which is covered by integration tests.

const parseFile = (path: string): ts.SourceFile =>
  ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )

const importDeclarations = (sourceFile: ts.SourceFile): ts.ImportDeclaration[] =>
  sourceFile.statements.filter(ts.isImportDeclaration)

const importModuleName = (statement: ts.ImportDeclaration): string | null =>
  ts.isStringLiteral(statement.moduleSpecifier)
    ? statement.moduleSpecifier.text
    : null

const hasDynamicImport = (
  sourceFile: ts.SourceFile,
  specifier: string | null = null,
): boolean => {
  let found = false

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [firstArg] = node.arguments
      if (
        specifier === null ||
        (firstArg && ts.isStringLiteral(firstArg) && firstArg.text === specifier)
      ) {
        found = true
        return
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

const stringLiterals = (sourceFile: ts.SourceFile): Set<string> => {
  const values = new Set<string>()

  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node)) values.add(node.text)
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return values
}

describe('patchOpenUiSourceWithAiCapsule', () => {
  it('replaces capsule reference with AI capsule name when varName is provided', () => {
    const source = `
hero = SaasHero({
  headline: "Welcome",
  ctaLabel: "Get Started"
})
navbar = SaasNavbar({ links: [] })
`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'SaasHero',
      'AICustom_SaasHero_abc123',
      'hero',
    )
    expect(result).toBe(`
hero = AICustom_SaasHero_abc123({
  headline: "Welcome",
  ctaLabel: "Get Started"
})
navbar = SaasNavbar({ links: [] })
`)
  })

  it('replaces all references when varName is not provided', () => {
    const source = `hero = SaasHero({})
footer = SaasHero({})`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'SaasHero',
      'AICustom_SaasHero_xyz',
    )
    expect(result).toBe(`hero = AICustom_SaasHero_xyz({})
footer = AICustom_SaasHero_xyz({})`)
  })

  it('handles capsule names with special regex characters', () => {
    const source = `hero = My.Capsule({})`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'My.Capsule',
      'AICustom_MyCapsule',
      'hero',
    )
    expect(result).toBe('hero = AICustom_MyCapsule({})')
  })

  it('does not modify source when capsule name is not found', () => {
    const source = `hero = SaasHero({})`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'NonExistent',
      'AICustom_NonExistent',
      'hero',
    )
    expect(result).toBe(source)
  })
})

describe('section-edit-response module structure', () => {
  it('uses dynamic import for esbuild to avoid fsevents in client bundle', () => {
    const sourceFile = parseFile(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
    )
    expect(
      importDeclarations(sourceFile).some(
        (statement) => importModuleName(statement) === 'esbuild',
      ),
    ).toBe(false)
    expect(hasDynamicImport(sourceFile, 'esbuild')).toBe(true)
  })

  it('route handler uses dynamic import for the section-edit module', () => {
    const sourceFile = parseFile(
      join(process.cwd(), 'src/routes/api/sessions.$sessionId.section-edit.ts'),
    )
    expect(hasDynamicImport(sourceFile)).toBe(true)
    expect(
      importDeclarations(sourceFile).some(
        (statement) =>
          importModuleName(statement) ===
          '#/features/editing/server/section-edit-response',
      ),
    ).toBe(false)
  })

  it('loads generated capsule helpers through the stable generated package export', () => {
    const sourceFile = parseFile(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
    )
    let loadsGeneratedBarrel = false
    let loadsCapsuleCategoriesSubpath = false

    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword
      ) {
        const [firstArg] = node.arguments
        if (firstArg && ts.isStringLiteral(firstArg)) {
          loadsGeneratedBarrel =
            loadsGeneratedBarrel ||
            firstArg.text === '@ship-fast/blocks/generated'
          loadsCapsuleCategoriesSubpath =
            loadsCapsuleCategoriesSubpath ||
            firstArg.text ===
              '@ship-fast/blocks/generated/capsule-categories'
        }
      }
      ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    expect(loadsGeneratedBarrel).toBe(true)
    expect(loadsCapsuleCategoriesSubpath).toBe(false)
  })

  it('marks Blob URL capsule smoke-test imports as Vite ignored', () => {
    const sourceFile = parseFile(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
    )
    let viteIgnoredBlobImport = false

    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword
      ) {
        const [firstArg] = node.arguments
        viteIgnoredBlobImport =
          viteIgnoredBlobImport ||
          firstArg.getFullText(sourceFile).trim().startsWith('/* @vite-ignore */')
      }
      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    expect(viteIgnoredBlobImport).toBe(true)
  })

  it('vite config excludes esbuild and fsevents from dep optimization', () => {
    const sourceFile = parseFile(join(process.cwd(), 'vite.config.ts'))
    const values = stringLiterals(sourceFile)

    expect(values.has('esbuild')).toBe(true)
    expect(values.has('fsevents')).toBe(true)
  })

  it('uses deterministic AI capsule names (not timestamp-based)', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
      'utf8',
    )
    // Must NOT use Date.now() in capsule name generation
    expect(source).not.toMatch(/generateAiCapsuleName.*Date\.now/)
    // Must use parent name + optional varName for deterministic naming
    expect(source).toMatch(/AICustom_\$\{parentName\}/)
  })

  it('compileTsx rewrites React imports to globalThis references', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
      'utf8',
    )
    // Must replace react imports with globalThis.React
    expect(source).toContain('globalThis.React')
    expect(source).toContain('globalThis.__jsxRuntime')
    // Must NOT use external: ['react'] only (needs react/jsx-runtime too)
    expect(source).toContain("'react/jsx-runtime'")
  })

  it('loadCapsuleSource loads from compressed manifest (not a stub)', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
      'utf8',
    )
    // Must decompress from react-export-sources manifest
    expect(source).toContain('reactExportSourcesBase64')
    expect(source).toContain('brotliDecompressSync')
    // Must NOT be a stub that returns a comment
    expect(source).not.toMatch(/\/\/ Capsule .* loaded\. See data-openui-component/)
  })

  it('smokeTestCapsule sets up React globals before import', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/editing/server/section-edit-response.ts'),
      'utf8',
    )
    expect(source).toContain('globalThis.React')
    expect(source).toContain('globalThis.__jsxRuntime')
    // Must use data: URL (not Blob URL) for Node.js compatibility
    expect(source).toContain('data:text/javascript;base64')
  })
})
