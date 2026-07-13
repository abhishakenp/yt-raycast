/**
 * Codemod: Convert arrow functions with type annotations to named function declarations.
 * Uses position-based text replacement to preserve formatting.
 *
 * Handles:
 * 1. `export const foo = (params): Ret => { body }` → `export function foo(params): Ret { body }`
 * 2. `export const foo = (params): Ret => expr` → `export function foo(params): Ret { return expr }`
 * 3. `export const foo = async (params): Ret => ...` → `export async function foo(params): Ret { ... }`
 * 4. `const foo = (params): Ret => ...` → `function foo(params): Ret { ... }`
 * 5. Callback arrow params: `.map((x: string) => ...)` → `.map((x) => ...)` (remove annotations)
 * 6. Callback arrow returns: `.map((x): string => ...)` → `.map((x) => ...)` (remove annotations)
 */

import {
  Project,
  type SourceFile,
  type VariableDeclaration,
  Node,
  SyntaxKind,
  ts,
} from 'ts-morph'
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { join, extname, relative } from 'node:path'

const ROOT = process.argv[2] ?? '.'
const DRY_RUN = process.argv.includes('--dry-run')

interface TextChange {
  start: number
  end: number
  newText: string
}

function collectTsFiles(dir: string, acc: string[] = []): string[] {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const full = join(dir, entry)
    if (
      entry === 'node_modules' ||
      entry === '.git' ||
      entry === '.output' ||
      entry === '.forge' ||
      entry === 'dist' ||
      entry === '_generated' ||
      entry === 'generated'
    )
      continue
    const stat = statSync(full)
    if (stat.isDirectory()) {
      collectTsFiles(full, acc)
    } else if (
      (extname(full) === '.ts' || extname(full) === '.tsx') &&
      !full.endsWith('.d.ts')
    ) {
      acc.push(full)
    }
  }
  return acc
}

function isTopLevelConstArrow(varDecl: VariableDeclaration): boolean {
  const varStmt = varDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement)
  if (!varStmt) return false
  const parent = varStmt.getParent()
  if (!parent) return false
  return (
    parent.getKind() === SyntaxKind.SourceFile ||
    parent.getKind() === SyntaxKind.ModuleBlock
  )
}

function collectArrowConversions(
  sourceFile: SourceFile,
  fileText: string,
  changes: TextChange[],
): number {
  let count = 0
  for (const statement of sourceFile.getVariableStatements()) {
    if (statement.getDeclarationKind() !== 'const') continue
    const parent = statement.getParent()
    if (
      parent.getKind() !== SyntaxKind.SourceFile &&
      parent.getKind() !== SyntaxKind.ModuleBlock
    )
      continue

    const declarations = statement.getDeclarations()
    const convertible = new Set<VariableDeclaration>()
    for (const declaration of declarations) {
      const initializer = declaration.getInitializer()
      if (!initializer || !Node.isArrowFunction(initializer)) continue
      const hasParameterAnnotations = initializer
        .getParameters()
        .some((parameter) => parameter.getTypeNode() !== undefined)
      if (
        hasParameterAnnotations ||
        initializer.getReturnTypeNode() !== undefined
      )
        convertible.add(declaration)
    }
    if (convertible.size === 0) continue

    const isExported =
      statement.getFirstModifierByKind(SyntaxKind.ExportKeyword) !== undefined
    const fragments: string[] = []
    const statementStart = statement.getStart()
    const lineStart = fileText.lastIndexOf('\n', statementStart) + 1
    const indent =
      fileText.slice(lineStart, statementStart).match(/^\s*/)?.[0] ?? ''

    for (const declaration of declarations) {
      if (!convertible.has(declaration)) {
        fragments.push(
          `${isExported ? 'export ' : ''}const ${declaration.getText()}`,
        )
        continue
      }

      const initializer = declaration.getInitializer()
      if (!initializer || !Node.isArrowFunction(initializer)) continue
      const typeParameters = initializer.getTypeParameters()
      const typeParametersText =
        typeParameters.length === 0
          ? ''
          : `<${typeParameters.map((parameter) => parameter.getText()).join(', ')}>`
      const parametersText = initializer
        .getParameters()
        .map((parameter) => parameter.getText())
        .join(', ')
      const returnTypeNode = initializer.getReturnTypeNode()
      const returnTypeText = returnTypeNode
        ? `: ${returnTypeNode.getText()}`
        : ''
      const prefix = `${isExported ? 'export ' : ''}${initializer.isAsync() ? 'async ' : ''}function ${declaration.getName()}${typeParametersText}(${parametersText})${returnTypeText}`
      const body = initializer.getBody()
      fragments.push(
        Node.isBlock(body)
          ? `${prefix} ${body.getText()}`
          : `${prefix} {\n${indent}  return ${body.getText()}\n${indent}}`,
      )
      count++
    }

    changes.push({
      start: statementStart,
      end: statement.getEnd(),
      newText: fragments.join(`\n${indent}`),
    })
  }

  return count
}

function collectCallbackAnnotationRemovals(
  sourceFile: SourceFile,
  changes: TextChange[],
): number {
  let count = 0
  const arrows = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction)

  for (const arrow of arrows) {
    const parent = arrow.getParent()
    if (Node.isVariableDeclaration(parent) && isTopLevelConstArrow(parent))
      continue

    const arrowStart = arrow.getStart()
    const arrowText = arrow.getText()
    const arrowChanges: TextChange[] = []
    let hasParameterAnnotation = false

    const params = arrow.getParameters()
    for (const param of params) {
      const typeNode = param.getTypeNode()
      if (!typeNode) continue
      hasParameterAnnotation = true

      const nameNode = param.getNameNode()
      const nameText = nameNode.getText()
      const isRest = param.isRestParameter()
      const initializer = param.getInitializer()

      let newText = isRest ? `...${nameText}` : nameText
      if (initializer) newText += ` = ${initializer.getText()}`

      arrowChanges.push({
        start: param.getStart() - arrowStart,
        end: param.getEnd() - arrowStart,
        newText,
      })
      count++
    }

    const returnTypeNode = arrow.getReturnTypeNode()
    if (returnTypeNode) {
      const arrowTokenStart =
        arrow.getEqualsGreaterThan().getStart() - arrowStart
      const typeStart = returnTypeNode.getStart() - arrowStart
      const colonAtTypeStart = arrowText[typeStart] === ':'
      const colonPosition = colonAtTypeStart
        ? typeStart
        : arrowText.lastIndexOf(':', typeStart)
      if (colonPosition >= 0) {
        arrowChanges.push({
          start: colonPosition,
          end: arrowTokenStart,
          newText: ' ',
        })
      }
      count++
    }

    if (arrowChanges.length === 0) continue
    let replacement = applyChanges(arrowText, arrowChanges)
    const contextualSignatures =
      arrow.getContextualType()?.getCallSignatures() ?? []
    if (hasParameterAnnotation && contextualSignatures.length === 0) {
      const originalType = arrow.getType().getText(arrow)
      replacement = `(${replacement}) satisfies (${originalType})`
    }
    changes.push({
      start: arrowStart,
      end: arrow.getEnd(),
      newText: replacement,
    })
  }

  return count
}

function hasSyntaxErrors(filePath: string, content: string): boolean {
  const result = ts.transpileModule(content, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
    reportDiagnostics: true,
  })
  return (result.diagnostics ?? []).some(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  )
}

function applyChanges(text: string, changes: TextChange[]): string {
  // Sort changes by start position in descending order (bottom to top)
  changes.sort((a, b) => b.start - a.start)

  let result = text
  for (const change of changes) {
    result =
      result.slice(0, change.start) + change.newText + result.slice(change.end)
  }

  return result
}

function processFile(filePath: string): {
  converted: number
  annotations: number
} {
  const content = readFileSync(filePath, 'utf-8')
  if (hasSyntaxErrors(filePath, content))
    return { converted: 0, annotations: 0 }
  const project = new Project({ useInMemoryFileSystem: true })

  let sourceFile: SourceFile
  try {
    sourceFile = project.createSourceFile(filePath, content)
  } catch {
    return { converted: 0, annotations: 0 }
  }

  // Pass 1: Convert top-level arrow functions to named function declarations
  const changes: TextChange[] = []
  const converted = collectArrowConversions(sourceFile, content, changes)

  let intermediateText = content
  if (changes.length > 0) {
    intermediateText = applyChanges(content, changes)
  }

  // Pass 2: Remove callback annotations from the intermediate text
  // Re-parse to get correct positions
  const project2 = new Project({ useInMemoryFileSystem: true })
  const sourceFile2 = project2.createSourceFile(filePath, intermediateText)
  const changes2: TextChange[] = []
  const annotations = collectCallbackAnnotationRemovals(sourceFile2, changes2)

  if (changes2.length > 0) {
    intermediateText = applyChanges(intermediateText, changes2)
  }

  if (hasSyntaxErrors(filePath, intermediateText))
    return { converted: 0, annotations: 0 }

  if (changes.length > 0 || annotations > 0) {
    if (!DRY_RUN) {
      writeFileSync(filePath, intermediateText)
    }
  }

  return { converted, annotations }
}

// Main
const files = collectTsFiles(ROOT)
console.log(`Processing ${files.length} files...`)

let totalConverted = 0
let totalAnnotations = 0
let filesChanged = 0

for (const file of files) {
  try {
    const result = processFile(file)
    if (result.converted > 0 || result.annotations > 0) {
      filesChanged++
      totalConverted += result.converted
      totalAnnotations += result.annotations
    }
  } catch (err) {
    console.error(`Error processing ${relative(ROOT, file)}: ${err}`)
  }
}

console.log(`\nDone!`)
console.log(`Files changed: ${filesChanged}`)
console.log(`Arrow→Function conversions: ${totalConverted}`)
console.log(`Callback annotations removed: ${totalAnnotations}`)
if (DRY_RUN) console.log('(DRY RUN — no files written)')
