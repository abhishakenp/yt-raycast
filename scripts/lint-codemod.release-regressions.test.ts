import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'

import { Node, Project, SyntaxKind, ts } from 'ts-morph'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts/lint-codemod.ts')

function runCodemod(source: string, filename = 'fixture.ts', dryRun = false) {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-lint-codemod-'))
  const filePath = join(workspace, filename)
  mkdirSync(join(filePath, '..'), { recursive: true })
  writeFileSync(filePath, source)

  const args = [scriptPath, workspace]
  if (dryRun) args.push('--dry-run')
  const result = spawnSync('bun', args, {
    encoding: 'utf8',
    env: process.env,
  })
  const output = readFileSync(filePath, 'utf8')

  return { workspace, filePath, output, result }
}

function diagnosticsFor(source: string, filename = 'fixture.ts') {
  const project = new Project({
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      noEmit: true,
      strict: true,
      target: ts.ScriptTarget.ES2022,
    },
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: true,
  })
  project.createSourceFile(filename, source)
  const diagnostics = project.getPreEmitDiagnostics()
  return {
    diagnostics,
    formatted: project.formatDiagnosticsWithColorAndContext(diagnostics),
  }
}

function anonymousTypeAnnotations(source: string, filename = 'fixture.ts') {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: true,
  })
  const file = project.createSourceFile(filename, source)
  const annotations: string[] = []

  for (const arrow of file.getDescendantsOfKind(SyntaxKind.ArrowFunction)) {
    for (const parameter of arrow.getParameters()) {
      if (parameter.getTypeNode()) annotations.push(parameter.getText())
    }
    if (arrow.getReturnTypeNode()) annotations.push(arrow.getText())
  }
  for (const expression of file.getDescendantsOfKind(
    SyntaxKind.FunctionExpression,
  )) {
    for (const parameter of expression.getParameters()) {
      if (parameter.getTypeNode()) annotations.push(parameter.getText())
    }
    if (expression.getReturnTypeNode()) annotations.push(expression.getText())
  }

  return annotations
}

describe('strict lint codemod', () => {
  it('converts exported, local, async, block, and expression arrows into declarations', () => {
    const fixture = runCodemod(`
export const add = (left: number, right: number): number => left + right
const describe = (value: string): string => {
  return value.toUpperCase()
}
export const load = async (id: string): Promise<string> => Promise.resolve(id)
`)

    try {
      expect(fixture.result.status).toBe(0)
      expect(fixture.output).toContain(
        'export function add(left: number, right: number): number',
      )
      expect(fixture.output).toContain(
        'function describe(value: string): string',
      )
      expect(fixture.output).toContain(
        'export async function load(id: string): Promise<string>',
      )
      expect(fixture.output).not.toContain('=>')
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('removes callback annotations only when contextual types preserve strict inference', () => {
    const fixture = runCodemod(`
declare const consume: (callback: (value: string) => string) => void
consume((value: string): string => value.trim())
const values = ['one', 'two'].map((value: string): string => value.toUpperCase())
void values
`)

    try {
      expect(anonymousTypeAnnotations(fixture.output)).toEqual([])
      expect(fixture.output).toContain('consume((value) => value.trim())')
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('preserves destructuring, rest parameters, and default initializers', () => {
    const fixture = runCodemod(`
interface Item { name: string }
declare const mapItem: (callback: (item: Item) => string) => string
declare const collect: (callback: (...values: string[]) => string) => string
declare const withDefault: (callback: (item?: Item) => string) => string
mapItem(({ name }: Item): string => name)
collect((...values: string[]): string => values.join(','))
withDefault((item: Item = { name: 'fallback' }): string => item.name)
`)

    try {
      expect(anonymousTypeAnnotations(fixture.output)).toEqual([])
      expect(fixture.output).toContain('mapItem(({ name }) => name)')
      expect(fixture.output).toContain('collect((...values) => values.join')
      expect(fixture.output).toContain(
        "withDefault((item = { name: 'fallback' })",
      )
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('preserves generic top-level function semantics and type parameters', () => {
    const fixture = runCodemod(`
export const identity = <Value>(value: Value): Value => value
const result = identity({ ok: true })
result.ok satisfies boolean
`)

    try {
      const project = new Project({
        skipAddingFilesFromTsConfig: true,
        useInMemoryFileSystem: true,
      })
      const file = project.createSourceFile('fixture.ts', fixture.output)
      const identity = file.getFunction('identity')

      expect(
        identity?.getTypeParameters().map((parameter) => parameter.getText()),
      ).toEqual(['Value'])
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('preserves every sibling in a multi-declaration const statement', () => {
    const fixture = runCodemod(`
export const encode = (value: string): string => value.trim(), marker = 'kept'
export const output = encode(marker)
`)

    try {
      const project = new Project({
        skipAddingFilesFromTsConfig: true,
        useInMemoryFileSystem: true,
      })
      const file = project.createSourceFile('fixture.ts', fixture.output)

      expect(file.getVariableDeclaration('marker')).toBeDefined()
      expect(file.getVariableDeclaration('output')).toBeDefined()
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('eliminates typed predicate callbacks without deleting their narrowing contract', () => {
    const fixture = runCodemod(`
const values: Array<string | undefined> = ['ready', undefined]
const present = values.filter((value: string | undefined): value is string => value !== undefined)
present.map((value) => value.toUpperCase())
`)

    try {
      expect(anonymousTypeAnnotations(fixture.output)).toEqual([])
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('does not replace explicit annotations with implicit-any callbacks', () => {
    const fixture = runCodemod(`
interface Query { key: string }
declare function register(callback: Function): void
register((query: Query): string => query.key)
`)

    try {
      expect(anonymousTypeAnnotations(fixture.output)).toEqual([])
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('never writes malformed output when the input cannot be parsed', () => {
    const source = 'const broken = (value: string => value'
    const fixture = runCodemod(source)

    try {
      expect(fixture.result.status).toBe(0)
      expect(fixture.output).toBe(source)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('keeps dry-run files byte-identical while reporting planned changes', () => {
    const source =
      'export const trim = (value: string): string => value.trim()\n'
    const fixture = runCodemod(source, 'fixture.ts', true)

    try {
      expect(fixture.result.status).toBe(0)
      expect(fixture.output).toBe(source)
      expect(fixture.result.stdout).toContain('DRY RUN')
      expect(fixture.result.stdout).toContain('Arrow→Function conversions: 1')
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })

  it('ignores declarations, generated code, dependencies, and non-TypeScript files', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-lint-codemod-'))
    const files = [
      join(workspace, 'types.d.ts'),
      join(workspace, 'generated', 'artifact.ts'),
      join(workspace, 'node_modules', 'dependency.ts'),
      join(workspace, 'notes.js'),
    ]
    for (const file of files) {
      mkdirSync(join(file, '..'), { recursive: true })
      writeFileSync(file, 'const value = (input: string): string => input\n')
    }

    try {
      const result = spawnSync('bun', [scriptPath, workspace], {
        encoding: 'utf8',
        env: process.env,
      })

      expect(result.status).toBe(0)
      expect(result.stdout).toContain('Processing 0 files')
      for (const file of files) {
        expect(existsSync(file)).toBe(true)
        expect(readFileSync(file, 'utf8')).toContain('=>')
        expect(basename(file)).toBeTruthy()
      }
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('produces syntax trees without parser recovery nodes', () => {
    const fixture = runCodemod(`
interface Row { id: string }
declare const callbackHost: (callback: (row: Row, column: string, value: unknown) => Promise<void>) => void
callbackHost(async (row: Row, column: string, value: unknown): Promise<void> => {
  void [row.id, column, value]
})
`)

    try {
      const project = new Project({
        skipAddingFilesFromTsConfig: true,
        useInMemoryFileSystem: true,
      })
      const file = project.createSourceFile('fixture.ts', fixture.output)
      const recoveryNodes = file
        .getDescendants()
        .filter(
          (node) => Node.isSyntaxList(node) && node.getText().includes(':)'),
        )

      expect(recoveryNodes).toEqual([])
      expect(file.getFullText()).not.toContain(':) =>')
      const checked = diagnosticsFor(fixture.output)
      expect(checked.diagnostics, checked.formatted).toHaveLength(0)
    } finally {
      rmSync(fixture.workspace, { recursive: true, force: true })
    }
  })
})
