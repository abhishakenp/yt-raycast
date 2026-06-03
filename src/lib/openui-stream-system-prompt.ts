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
  throw new Error(
    'Deprecated stream OpenUI prompt removed. Use the package OpenUI module engine for homepage generation.',
  )
}
