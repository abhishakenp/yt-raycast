import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const TEST_ARTIFACT_GLOBS = [
  'convex/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  'packages/*/src/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  'public/scripts/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  'scripts/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  'src/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
]

const TEST_API_NAMES = new Set([
  'bench',
  'describe',
  'it',
  'specify',
  'suite',
  'test',
])
const DISABLED_MODIFIERS = new Set([
  'fails',
  'only',
  'runIf',
  'skip',
  'skipIf',
  'skipWhen',
  'todo',
])
const DISABLED_IDENTIFIERS = new Set([
  'fdescribe',
  'fit',
  'xdescribe',
  'xit',
  'xtest',
])

// Integration tests that legitimately require external env vars to run.
// These are allowed to use skipIf to skip when the env is absent.
const SKIP_IF_ALLOWLIST = new Set([
  'src/features/deployments/inspect-tvnl-build.test.ts',
  'src/features/deployments/run-tvnl-lakebed-deploy.test.ts',
])

function collectTestArtifacts(root: string) {
  const artifacts = new Set<string>()
  for (const pattern of TEST_ARTIFACT_GLOBS) {
    for (const file of globSync(pattern, { cwd: root })) {
      if (SKIP_IF_ALLOWLIST.has(file.replace(/\\/g, '/'))) continue
      artifacts.add(file)
    }
  }
  return [...artifacts].sort()
}

function rootApiName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isCallExpression(expression)) return rootApiName(expression.expression)
  if (ts.isPropertyAccessExpression(expression)) {
    return rootApiName(expression.expression)
  }
  if (ts.isElementAccessExpression(expression)) {
    return rootApiName(expression.expression)
  }
  return undefined
}

function disabledProperty(node: ts.Node): string | undefined {
  if (ts.isPropertyAccessExpression(node)) {
    const rootName = rootApiName(node.expression)
    if (rootName && TEST_API_NAMES.has(rootName)) return node.name.text
  }
  if (ts.isElementAccessExpression(node)) {
    const rootName = rootApiName(node.expression)
    const argument = node.argumentExpression
    if (
      rootName &&
      TEST_API_NAMES.has(rootName) &&
      ts.isStringLiteral(argument)
    ) {
      return argument.text
    }
  }
  return undefined
}

function location(sourceFile: ts.SourceFile, node: ts.Node) {
  const position = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  )
  return `${sourceFile.fileName}:${position.line + 1}:${position.character + 1}`
}

function findPolicyViolations(root: string, file: string) {
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(resolve(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const violations: string[] = []

  function visit(node: ts.Node) {
    const modifier = disabledProperty(node)
    if (modifier && DISABLED_MODIFIERS.has(modifier)) {
      violations.push(`${location(sourceFile, node)} ${modifier}`)
    }
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      DISABLED_IDENTIFIERS.has(node.expression.text)
    ) {
      violations.push(`${location(sourceFile, node)} ${node.expression.text}`)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return violations
}

describe('Vitest release policy', () => {
  it('contains no disabled, focused, conditional, or expected-failure tests', () => {
    const root = resolve(import.meta.dirname, '..')
    const violations: string[] = []
    for (const file of collectTestArtifacts(root)) {
      violations.push(...findPolicyViolations(root, file))
    }

    expect(violations).toEqual([])
  })
})
