import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const convexRoot = join(process.cwd(), 'convex')
const sessionLibRoot = join(convexRoot, 'lib')

const parseSourceFile = (path: string): ts.SourceFile =>
  ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  )

const moduleSpecifierText = (node: ts.ImportDeclaration): string =>
  node.moduleSpecifier.getText().replace(/^['"]|['"]$/g, '')

const isExported = (node: ts.Node): boolean => {
  if (!ts.canHaveModifiers(node)) return false
  return (
    ts
      .getModifiers(node)
      ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
    false
  )
}

/**
 * Returns the callee identifier text of a `const name = callee({...})` export.
 * For `export const create = mutation({...})` this returns `mutation`.
 */
const exportedConstCallCallee = (
  statement: ts.VariableStatement,
  name: string,
): string | undefined => {
  if (!isExported(statement)) return undefined

  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) {
      continue
    }

    const initializer = declaration.initializer
    if (initializer === undefined || !ts.isCallExpression(initializer)) {
      return undefined
    }

    const expression = initializer.expression
    return ts.isIdentifier(expression) ? expression.text : undefined
  }

  return undefined
}

const propertyCallName = (node: ts.CallExpression): string | undefined => {
  const expression = node.expression
  if (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === 'v' &&
    ts.isIdentifier(expression.name)
  ) {
    return expression.name.text
  }

  return undefined
}

describe('session decomposition boundary', () => {
  it('keeps convex/sessions.ts as a registration surface under the coordination ceiling', () => {
    const sourceFile = parseSourceFile(join(convexRoot, 'sessions.ts'))

    const sessionHelperImports: string[] = []
    let importsConvexValues = false
    const exportedConstCallees = new Map<string, string>()
    const vCallNames = new Set<string>()

    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement)) {
        const specifier = moduleSpecifierText(statement)
        if (specifier.startsWith('./lib/session_')) {
          sessionHelperImports.push(specifier)
        }
        if (specifier === 'convex/values') {
          importsConvexValues = true
        }
        continue
      }

      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.initializer !== undefined
          ) {
            const callee = exportedConstCallCallee(statement, declaration.name.text)
            if (callee !== undefined) {
              exportedConstCallees.set(declaration.name.text, callee)
            }
          }
        }
      }
    }

    // Recursively walk for `v.object(` / `v.union(` call expressions anywhere
    // in the file. Structural: inspects AST nodes, not source text.
    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        const name = propertyCallName(node)
        if (name === 'object' || name === 'union') {
          vCallNames.add(name)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    expect(sessionHelperImports.length).toBeGreaterThanOrEqual(26)
    expect(sessionHelperImports).toContain('./lib/session_validators')

    // Registration surface: these exports must remain thin wrappers delegating
    // to extracted helper modules (mutation/query call expressions at top level).
    expect(exportedConstCallees.get('create')).toBe('mutation')
    expect(exportedConstCallees.get('getGenerationView')).toBe('query')
    expect(exportedConstCallees.get('listChatMessages')).toBe('query')

    // Boundary: convex/sessions.ts must not define validators inline — those
    // live in ./lib/session_validators.
    expect(importsConvexValues).toBe(false)
    expect(vCallNames.has('object')).toBe(false)
    expect(vCallNames.has('union')).toBe(false)
  })

  it('requires each extracted session helper module to have a focused sibling test', () => {
    const files = readdirSync(sessionLibRoot)
    const helperFiles = files
      .filter((file) => /^session_.+_helpers\.ts$/.test(file))
      .sort()
    const testFiles = new Set(
      files.filter((file) => /^session_.+_helpers\.test\.ts$/.test(file)),
    )
    const helpersWithoutTests = helperFiles.filter(
      (file) => !testFiles.has(file.replace(/\.ts$/, '.test.ts')),
    )

    expect(helperFiles.length).toBeGreaterThanOrEqual(27)
    expect(helpersWithoutTests).toEqual([])
  })
})
