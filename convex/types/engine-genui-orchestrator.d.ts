/**
 * External type shim for @ship-fast/engine/genui/orchestrator.ts
 * This prevents Convex typecheck from crawling into engine/blocks source.
 */

export type GenUIEvent =
  | { type: "status"; message: string }
  | { type: "skeleton"; text: string }
  | { type: "plan"; ids: string[] }
  | { type: "theme"; name: string }
  | { type: "locale"; code: string }
  | { type: "module_start"; id: string }
  | { type: "module_retry"; id: string; attempt: number }
  | { type: "module"; id: string; text: string; failed?: boolean }
  | { type: "source"; text: string }
  | { type: "done"; modules: number; ms: number; source?: string }
  | { type: "error"; message: string }

export function generateUI(
  prompt: string,
  modelId?: string,
  parentSignal?: AbortSignal
): AsyncGenerator<GenUIEvent>
