import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

const TOTAL_GENERATION_BUDGET_CEILING_MS = 90_000

const parseSourceFile = (path: string): ts.SourceFile =>
  ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  )

/**
 * Walks the top-level declarations of a parsed source file and returns the
 * numeric literal initializer of the `const` named `name`. Structural: relies
 * on the TypeScript AST, not on regex/source-text matching.
 */
const extractTopLevelNumericConst = (
  sourceFile: ts.SourceFile,
  name: string,
): number => {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) {
        continue
      }

      const initializer = declaration.initializer
      if (
        initializer === undefined ||
        !ts.isNumericLiteral(initializer)
      ) {
        throw new Error(
          `${name} must be initialized with a numeric literal`,
        )
      }

      return Number(initializer.text.replaceAll('_', ''))
    }
  }

  throw new Error(`${name} must be defined as a top-level numeric const`)
}

describe('homepage generation latency budgets', () => {
  it('keeps structural timeout budgets defined, positive, and capped', () => {
    const generationSourceFile = parseSourceFile(
      join(here, 'generation.ts'),
    )

    const totalTimeoutMs = extractTopLevelNumericConst(
      generationSourceFile,
      'DEFAULT_GENERATION_TIMEOUT_MS',
    )

    expect(totalTimeoutMs).toBeGreaterThan(0)

    // Structural budget ceiling: live homepage generation must not silently grow
    // beyond the current 90s total timeout without an explicit test update.
    expect(totalTimeoutMs).toBeLessThanOrEqual(
      TOTAL_GENERATION_BUDGET_CEILING_MS,
    )
  })
})
