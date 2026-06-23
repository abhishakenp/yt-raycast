import { createParser, type ElementNode } from '@openuidev/lang-core'
import { loadOpenUIRuntimeLibrary } from '@ship-fast/blocks/runtime'
import { preprocessOpenUIResponse } from '../lib/openui-preprocess.ts'

export type OpenUIProgramAuditOptions = {
  expectedRoot?: string
  expectedPageIds?: string[]
}

const readMetaErrors = (
  errors: Array<{ code?: string; component?: string; message?: string }>,
  code: string,
): string[] =>
  errors
    .filter((error) => error.code === code)
    .map(
      (error) =>
        error.component ?? error.message ?? JSON.stringify(error) ?? code,
    )

const isElementNode = (value: unknown): value is ElementNode =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { type?: unknown }).type === 'element'

export async function auditOpenUIProgram(
  source: string,
  options: OpenUIProgramAuditOptions = {},
): Promise<void> {
  const cleaned = preprocessOpenUIResponse(source, { resolveRefs: false })
  const library = await loadOpenUIRuntimeLibrary(cleaned)
  const parser = createParser(library.toJSONSchema(), 'root')
  const result = parser.parse(cleaned)

  if (result.root === null) {
    throw new Error('OpenUI audit failed: missing root element')
  }
  if (result.meta.incomplete) {
    throw new Error('OpenUI audit failed: source is incomplete')
  }
  if (result.meta.unresolved.length > 0) {
    throw new Error(
      `OpenUI audit failed: unresolved references ${result.meta.unresolved.join(', ')}`,
    )
  }

  const unknown = readMetaErrors(result.meta.errors, 'unknown-component')
  if (unknown.length > 0) {
    throw new Error(
      `OpenUI audit failed: unknown components ${unknown.join(', ')}`,
    )
  }

  if (
    options.expectedRoot !== undefined &&
    result.root.typeName !== options.expectedRoot
  ) {
    throw new Error(
      `OpenUI audit failed: expected ${options.expectedRoot} root, found ${result.root.typeName}`,
    )
  }

  const expectedPageIds = options.expectedPageIds ?? []
  if (expectedPageIds.length === 0) return

  const routes =
    result.root.typeName === 'PageSwitch' ? result.root.props.routes : undefined
  const pages =
    result.root.typeName === 'PageSwitch' ? result.root.props.pages : undefined

  if (!Array.isArray(routes)) {
    throw new Error('OpenUI audit failed: PageSwitch routes must be an array')
  }
  if (!Array.isArray(pages)) {
    throw new Error('OpenUI audit failed: PageSwitch pages must be an array')
  }
  if (routes.length !== expectedPageIds.length) {
    throw new Error(
      `OpenUI audit failed: expected ${expectedPageIds.length} routes, found ${routes.length}`,
    )
  }
  if (pages.length !== expectedPageIds.length) {
    throw new Error(
      `OpenUI audit failed: expected ${expectedPageIds.length} pages, found ${pages.length}`,
    )
  }

  const invalidPageIndex = pages.findIndex((page) => !isElementNode(page))
  if (invalidPageIndex >= 0) {
    throw new Error(
      `OpenUI audit failed: PageSwitch page ${invalidPageIndex} is not an element`,
    )
  }
}
