// Streaming event + artifact types shared between the generation engine and the
// frontend stream reducer (`src/hooks/useGenUIStream.ts`). Kept in a standalone
// module so the engine internals can change without the frontend importing them.

export type GenUIEvent =
  | { type: 'status'; message: string }
  | { type: 'skeleton'; text: string }
  | { type: 'plan'; ids: string[] }
  | { type: 'theme'; name: string }
  | { type: 'locale'; code: string }
  | { type: 'module_start'; id: string }
  | { type: 'module_retry'; id: string; attempt: number }
  | { type: 'module'; id: string; text: string; failed?: boolean }
  | { type: 'source'; text: string }
  | { type: 'done'; modules: number; ms: number; source?: string }
  | { type: 'error'; message: string }

/** A generated sidecar artifact (e.g. the fullstack manifest) persisted alongside source. */
export type GeneratedArtifact = { key: string; contentJson: string }
