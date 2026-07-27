import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { createElement, useRef, useEffect, type ReactNode } from 'react'

// ── SvelteIsland capsule ────────────────────────────────────────────────────
//
// Renders a server-compiled Svelte component inside the React tree.
// - SSR: the pre-rendered HTML string is injected via dangerouslySetInnerHTML.
// - Client: the compiled DOM JS module is loaded from a script path and
//   mounted into a container div via Svelte's imperative mount API.
//
// This replaces the old Freeform capsule. The LLM emits raw Svelte 4 source
// in @svelte blocks; the V3 engine compiles it server-side using svelte/compiler
// and passes the SSR HTML + DOM JS script path as props.

export const SvelteIsland = defineCapsule({
  name: 'SvelteIsland',
  description:
    'Renders a server-compiled Svelte 4 component. SSR HTML is injected directly; DOM JS is loaded client-side for interactivity. Used when no existing section component matches a role and the LLM generated a custom Svelte component.',
  props: z.object({
    /** Pre-rendered SSR HTML string from svelte/compiler SSR output. */
    html: z.string(),
    /** Path to the compiled DOM JS module (served from /scripts/). */
    script: z.string().optional(),
    /** Extracted CSS from the Svelte component (scoped styles). */
    css: z.string().optional(),
  }),
  component: ({ props }) => {
    const { html, script, css } = props
    const containerRef = useRef<HTMLDivElement>(null)
    const svelteInstanceRef = useRef<unknown>(null)

    // Inject scoped CSS if present
    useEffect(() => {
      if (!css || css.length === 0) return
      const styleId = 'svelte-island-style'
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      if (!styleEl.textContent?.includes(css)) {
        styleEl.textContent += css
      }
    }, [css])

    // Client-side mount: load the DOM JS module and mount the Svelte component
    useEffect(() => {
      if (!script || !containerRef.current) return

      let cancelled = false
      let cleanup: (() => void) | null = null

      // Ensure svelte/internal is available via import map
      ensureSvelteImportMap()

      // Dynamic import the compiled Svelte DOM module
      import(/* @vite-ignore */ script)
        .then((mod) => {
          if (cancelled || !containerRef.current) return
          const Component = mod.default
          if (!Component) return

          // Svelte 4 mount: new Component({ target })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const instance = new (Component as any)({
            target: containerRef.current,
            hydrate: true,
          })
          svelteInstanceRef.current = instance

          cleanup = () => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(instance as any)?.$destroy?.()
            } catch {
              // non-fatal
            }
          }
        })
        .catch(() => {
          // Script load failed — SSR HTML is already rendered, so the
          // component is visible but non-interactive. Acceptable fallback.
        })

      return () => {
        cancelled = true
        if (cleanup) cleanup()
      }
    }, [script])

    return createElement('div', {
      ref: containerRef,
      className: 'svelte-island',
      dangerouslySetInnerHTML: { __html: html },
    })
  },
})

// ── Import map for svelte/internal in the browser ───────────────────────────
//
// The compiled Svelte DOM JS imports from "svelte/internal". In the browser,
// this needs to be resolvable. We inject an import map pointing to a CDN
// (esm.sh) the first time a SvelteIsland mounts.

let importMapInjected = false

function ensureSvelteImportMap(): void {
  if (importMapInjected) return
  if (typeof document === 'undefined') return

  // Check if an import map already covers svelte/internal
  const existingMaps = document.querySelectorAll('script[type="importmap"]')
  for (const map of existingMaps) {
    try {
      const parsed = JSON.parse(map.textContent ?? '{}')
      if (parsed.imports?.['svelte/internal'] || parsed.imports?.svelte) {
        importMapInjected = true
        return
      }
    } catch {
      // ignore
    }
  }

  const importMap = {
    imports: {
      'svelte/internal': 'https://esm.sh/svelte@4.2.20/internal',
      'svelte/internal/disclose-version':
        'https://esm.sh/svelte@4.2.20/internal/disclose-version',
    },
  }

  const script = document.createElement('script')
  script.type = 'importmap'
  script.textContent = JSON.stringify(importMap)
  document.head.appendChild(script)
  importMapInjected = true
}
