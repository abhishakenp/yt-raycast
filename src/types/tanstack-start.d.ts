// Loads TanStack Start's server-route module augmentation into the type graph.
//
// File-based server routes declare HTTP handlers via the `server` route option
// (`createFileRoute(...)({ server: { handlers: { ... } } })`). That option is
// added to `FilebaseRouteOptionsInterface` through a `declare module` augmentation
// shipped in `@tanstack/start-client-core` (re-exported by `@tanstack/react-start`).
//
// Nothing in `src` imports `@tanstack/react-start` directly (the routes import
// `createFileRoute` from `@tanstack/react-router`, and the Start integration is a
// build-time Vite plugin), so the augmentation was never pulled into `tsc`. That
// made every `server`-based route report TS2353 ("'server' does not exist") plus
// cascading TS7031 implicit-any errors on the handler parameters. Referencing the
// package types here loads the augmentation for the whole program.
/// <reference types="@tanstack/react-start" />

export {}
