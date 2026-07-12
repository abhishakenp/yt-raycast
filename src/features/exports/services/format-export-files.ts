import { format } from 'prettier'

/**
 * Prettier options shared across all Ship Fast export artifacts.
 * Mirrors the repo's prettier.config.js so exported code matches the
 * formatting users see in the source repository.
 */
export const EXPORT_PRETTIER_OPTIONS = {
  printWidth: 90,
  semi: false,
  singleQuote: true,
  trailingComma: 'all' as const,
}

function parserForPath(
  path: string,
): 'babel-ts' | 'babel' | 'json' | 'css' | 'markdown' | null {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'babel-ts'
  if (path.endsWith('.mjs') || path.endsWith('.js')) return 'babel'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.md')) return 'markdown'
  return null
}

/**
 * Format every formattable file in an export bundle with the shared Ship Fast
 * prettier config. Files prettier cannot parse (or any per-file failure) fall
 * back to their original content so a single bad file never breaks an export.
 */
export async function formatExportFiles(
  files: Record<string, string>,
): Promise<Record<string, string>> {
  const formatted = await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const parser = parserForPath(path)
      if (!parser) return [path, content] as const
      try {
        return [
          path,
          await format(content, {
            parser,
            ...EXPORT_PRETTIER_OPTIONS,
          }),
        ] as const
      } catch {
        return [path, content] as const
      }
    }),
  )
  return Object.fromEntries(formatted)
}
