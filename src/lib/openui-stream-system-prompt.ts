import { getStreamSessionSiteHint } from '@/lib/openui-pipeline-prompt.js'
import { OPENUI_SYSTEM_PROMPT } from '@/lib/openui-system-prompt'

export type OpenUIStreamContext = {
  /** From session `site-spec.json` when available */
  siteType?: string
  title?: string
}

/**
 * System prompt for `POST /api/stream-openui` (session preview + tools).
 * Keep this neutral: syntax + session facts only. The orchestrator owns UI direction.
 */
export function buildStreamOpenUISystemPrompt(context?: OpenUIStreamContext | null): string {
  const siteHint = getStreamSessionSiteHint(context?.siteType, context?.title)
  return `${OPENUI_SYSTEM_PROMPT}
${siteHint}`
}
