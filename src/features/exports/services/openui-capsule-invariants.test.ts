import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const readSourceFile = (path: string): ts.SourceFile =>
  ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

const findVariable = (
  sourceFile: ts.SourceFile,
  name: string,
): ts.VariableDeclaration | null => {
  let match: ts.VariableDeclaration | null = null

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      match = node
      return
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return match
}

const expectDefineCapsuleFactoryPredicate = (
  filePath: string,
  variableName: string,
) => {
  const sourceFile = readSourceFile(filePath)
  const declaration = findVariable(sourceFile, variableName)
  expect(declaration).not.toBeNull()

  const initializer = declaration?.initializer
  expect(initializer && ts.isArrowFunction(initializer)).toBe(true)
  if (!initializer || !ts.isArrowFunction(initializer)) return

  const body = initializer.body
  expect(ts.isBinaryExpression(body)).toBe(true)
  if (!ts.isBinaryExpression(body)) return

  expect(body.operatorToken.kind).toBe(ts.SyntaxKind.EqualsEqualsEqualsToken)
  expect(ts.isIdentifier(body.left) ? body.left.text : null).toBe('expression')
  expect(ts.isStringLiteral(body.right) ? body.right.text : null).toBe(
    'defineCapsule',
  )
}

describe('OpenUI export capsule invariants', () => {
  it('only treats defineCapsule as the registry component factory', () => {
    expectDefineCapsuleFactoryPredicate(
      join(process.cwd(), 'src/features/exports/services/openui-export-builder.ts'),
      'isExportableComponentFactory',
    )
    expectDefineCapsuleFactoryPredicate(
      join(
        process.cwd(),
        'src/features/exports/services/openui-lakebed-export-builder.ts',
      ),
      'isExportableFactory',
    )
  })
})
