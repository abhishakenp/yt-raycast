// Generation now runs entirely on the VPS (warm Node process) via the
// `/api/sessions/create` route, which calls `startVpsGeneration` after the
// session is admitted on Convex. The client subscribes to
// `getGenerationView` and sees progress reactively.
//
// This file previously contained the `startGeneration` Convex action with
// `'use node'` directive. It has been removed — the Node.js runtime cold
// starts (10s SSR module loading + 2s engine import) are eliminated by
// running the engine in the always-warm VPS process instead.
//
// Convex now only handles: session admission, public mutations for the VPS
// to write generation progress/results, and the reactive `getGenerationView`
// subscription the client reads.
