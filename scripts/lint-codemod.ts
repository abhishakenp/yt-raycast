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
  const varDecls = sourceFile.getVariableDeclarations()

  for (const varDecl of varDecls) {
    const init = varDecl.getInitializer()
    if (!init || !Node.isArrowFunction(init)) continue
    if (!isTopLevelConstArrow(varDecl)) continue

    const hasParamAnnotations = init
      .getParameters()
      .some((p) => p.getTypeNode() !== undefined)
    const hasReturnAnnotation = init.getReturnTypeNode() !== undefined
    if (!hasParamAnnotations && !hasReturnAnnotation) continue

    const varStmt = varDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement)
    if (!varStmt) continue
    if (varStmt.getDeclarationKind() !== 'const') continue

    const isExported =
      varStmt.getFirstModifierByKind(SyntaxKind.ExportKeyword) !== undefined
    const isDefaultExport =
      varStmt.getFirstModifierByKind(SyntaxKind.DefaultKeyword) !== undefined
    const isAsync = init.isAsync()
    const name = varDecl.getName()
    const params = init.getParameters()
    const paramsText = params.map((p) => p.getText()).join(', ')
    const returnTypeNode = init.getReturnTypeNode()
    const returnTypeText = returnTypeNode ? `: ${returnTypeNode.getText()}` : ''

    const body = init.getBody()
    const bodyText = body.getText()

    // Get the full range of the variable statement to replace
    const stmtStart = varStmt.getStart()
    const stmtEnd = varStmt.getEnd()

    let fnText: string
    if (Node.isBlock(body)) {
      // Block body — keep the block as-is, just change the declaration syntax
      const prefix = `${isExported ? 'export ' : ''}${isDefaultExport ? 'default ' : ''}${isAsync ? 'async ' : ''}function ${isDefaultExport ? '' : name}(${paramsText})${returnTypeText} `
      fnText = prefix + bodyText
    } else {
      // Expression body — wrap in return
      // Get indentation from the variable statement
      const lineStart = fileText.lastIndexOf('\n', stmtStart) + 1
      const indent =
        fileText.slice(lineStart, stmtStart).match(/^\s*/)?.[0] ?? ''
      fnText = `${isExported ? 'export ' : ''}${isDefaultExport ? 'default ' : ''}${isAsync ? 'async ' : ''}function ${isDefaultExport ? '' : name}(${paramsText})${returnTypeText} {\n${indent}return ${bodyText}\n${indent}}`
    }

    changes.push({ start: stmtStart, end: stmtEnd, newText: fnText })
    count++
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

    // Remove parameter type annotations by replacing the entire parameter text
    const params = arrow.getParameters()
    for (const param of params) {
      const typeNode = param.getTypeNode()
      if (!typeNode) continue
      const typeText = typeNode.getText()
      if (typeText.includes(' is ')) continue
      if (typeText.startsWith('asserts ')) continue

      // Reconstruct parameter without type annotation
      const nameNode = param.getNameNode()
      const nameText = nameNode.getText()
      const isRest = param.isRestParameter()
      const initializer = param.getInitializer()

      let newText = isRest ? `...${nameText}` : nameText
      if (initializer) newText += ` = ${initializer.getText()}`

      const paramStart = param.getStart()
      const paramEnd = param.getEnd()

      changes.push({ start: paramStart, end: paramEnd, newText })
      count++
    }

    // Remove return type annotation
    const returnTypeNode = arrow.getReturnTypeNode()
    if (returnTypeNode) {
      const typeText = returnTypeNode.getText()
      if (typeText.includes(' is ')) continue
      if (typeText.startsWith('asserts ')) continue

      const typeStart = returnTypeNode.getStart()
      const typeEnd = returnTypeNode.getEnd()
      const fullText = sourceFile.getText()
      // Search backwards through whitespace ONLY to find the colon
      let colonPos = typeStart - 1
      while (colonPos > 0 && /\s/.test(fullText[colonPos])) colonPos--
      if (fullText[colonPos] !== ':') continue
      let removeStart = colonPos
      let removeEnd = typeEnd
      while (removeEnd < fullText.length && fullText[removeEnd] === ' ')
        removeEnd++

      changes.push({ start: removeStart, end: removeEnd, newText: '' })
      count++
    }
  }

  return count
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
  let annotations = 0
  if (intermediateText !== content || true) {
    const project2 = new Project({ useInMemoryFileSystem: true })
    let sourceFile2: SourceFile
    try {
      sourceFile2 = project2.createSourceFile(filePath, intermediateText)
    } catch {
      if (changes.length > 0 && !DRY_RUN) {
        writeFileSync(filePath, intermediateText)
      }
      return { converted, annotations: 0 }
    }

    const changes2: TextChange[] = []
    annotations = collectCallbackAnnotationRemovals(sourceFile2, changes2)

    if (changes2.length > 0) {
      intermediateText = applyChanges(intermediateText, changes2)
    }
  }

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
