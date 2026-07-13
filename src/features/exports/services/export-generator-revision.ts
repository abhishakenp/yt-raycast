import type { ExportTarget } from './openui-export-types'

const exportGeneratorRevisions: Record<ExportTarget, string> = {
  html: 'html-export-v2',
  react: 'react-export-v2',
  next: 'next-export-v2',
  lakebed: 'lakebed-export-v2',
}

export function exportGeneratorRevision(target: ExportTarget): string {
  return exportGeneratorRevisions[target]
}
