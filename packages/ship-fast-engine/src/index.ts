import { z } from 'zod'
import { generateText } from './generate.ts'
import { THEME_CATALOG } from './theme-apply.ts'
import { stripFences } from './parser.ts'

export { generateText, THEME_CATALOG, stripFences }
export {
  loadSiteSpec,
  saveSiteSpec,
  SUPPORTED_EXPORT_TARGETS,
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
  ensureCompatibleSiteSpec,
} from './spec/index.ts'
export {
  renderProject,
  renderPreviewToWorkspace,
  writeRenderedFiles,
} from './renderers/index.ts'
export { preprocessOpenUIResponse } from './lib/openui-preprocess.ts'
export { runAll, runEdit } from './pipeline/runner.js'
export { runAllV2 } from './pipeline/runner-v2.ts'

export const IntegrationIntentSchema = z.object({
  type: z.enum(['stripe', 'form', 'auth', 'search', 'database', 'custom']),
  description: z.string(),
  config: z.record(z.string(), z.any()).optional(),
})

export type IntegrationIntent = z.infer<typeof IntegrationIntentSchema>

export const IntegrationPlanSchema = z.object({
  id: z.string(),
  intent: IntegrationIntentSchema,
  steps: z.array(
    z.object({
      description: z.string(),
      targetFile: z.string().optional(),
      status: z.enum(['pending', 'completed', 'failed']),
    }),
  ),
})

export type IntegrationPlan = z.infer<typeof IntegrationPlanSchema>
