import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const sourcePath = new URL('./lakebed_deploy.ts', import.meta.url)

const parseLakebedDeploy = () =>
  ts.createSourceFile(
    sourcePath.pathname,
    readFileSync(sourcePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

const stringLiterals = (sourceFile: ts.SourceFile): Set<string> => {
  const values = new Set<string>()

  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      values.add(node.text)
    }
    if (
      node.kind === ts.SyntaxKind.TemplateHead ||
      node.kind === ts.SyntaxKind.TemplateMiddle ||
      node.kind === ts.SyntaxKind.TemplateTail
    ) {
      values.add((node as ts.TemplateLiteralLikeNode).text)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return values
}

const dynamicImportSpecifiers = (sourceFile: ts.SourceFile): Set<string> => {
  const specifiers = new Set<string>()

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [specifier] = node.arguments
      if (specifier && ts.isStringLiteral(specifier)) {
        specifiers.add(specifier.text)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return specifiers
}

const hasHtmlSourceKindThrow = (sourceFile: ts.SourceFile): boolean => {
  let found = false

  const visit = (node: ts.Node) => {
    if (ts.isIfStatement(node)) {
      const condition = node.expression
      const isHtmlSourceKindCheck =
        ts.isBinaryExpression(condition) &&
        condition.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
        ts.isIdentifier(condition.left) &&
        condition.left.text === 'sourceKind' &&
        ts.isStringLiteral(condition.right) &&
        condition.right.text === 'html'

      if (isHtmlSourceKindCheck) {
        const branch = node.thenStatement
        found =
          found ||
          (ts.isBlock(branch) &&
            branch.statements.some((statement) =>
              ts.isThrowStatement(statement),
            ))
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

describe('lakebed_deploy action structure', () => {
  it('logs publish phases and refuses static HTML Lakebed deploys', () => {
    const sourceFile = parseLakebedDeploy()
    const literals = stringLiterals(sourceFile)
    const imports = dynamicImportSpecifiers(sourceFile)

    expect(literals.has('[lakebed_deploy:deploy] ')).toBe(true)
    expect(literals.has('action:start')).toBe(true)
    expect(literals.has('prepare:start')).toBe(true)
    expect(literals.has('project-build:start')).toBe(true)
    expect(literals.has('project-build:complete')).toBe(true)
    expect(literals.has('record:start')).toBe(true)
    expect(literals.has('failed')).toBe(true)

    expect(hasHtmlSourceKindThrow(sourceFile)).toBe(true)
    expect(imports.has('../src/features/deployments/server/lakebed-static-project-builder')).toBe(
      false,
    )
    expect(
      imports.has('../src/features/exports/services/openui-lakebed-export-builder'),
    ).toBe(true)
  })
})
