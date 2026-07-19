import { createContext } from 'react'

/**
 * Bridge between the OpenUI runtime's internal page navigation and the host
 * application's URL router (e.g. TanStack Router in the preview dashboard).
 *
 * In the exported/deployed site each page is a real route, so this bridge is
 * not provided and the context keeps its default no-op values.
 *
 * In the preview dashboard the host wraps the rendered site in
 * `PreviewUrlBridgeContext.Provider` so that:
 * - route links can push the page slug to the URL via `navigateToPage`.
 * - `PageSwitch` can read `pageFromUrl` to initialise / sync the active page
 *   when the user navigates with the browser back/forward buttons.
 *
 * Routing convention (matches both export builders):
 * - Home page (routes[0]) → base URL, no trailing path → `navigateToPage(null)`
 * - Other pages → `navigateToPage(slug)` where slug = slugifyRoute(label)
 */
export type PreviewUrlBridgeValue = {
  /**
   * Called after the internal `$page` state has been updated.
   * `null` = home page (push base URL, no trailing path).
   * `string` = page slug (push `/<slug>` after the session base).
   * The field itself is `null` when no host bridge is active (exported site).
   */
  navigateToPage: ((pageSlug: string | null) => void) | null
  /**
   * Slug from the URL after the session base, or `null` when the URL has no
   * trailing path (i.e. home / base `/generate/<sessionId>`).
   * `PageSwitch` slugifies its `routes` and matches against this to determine
   * which page to show. `null` → show routes[0] (home).
   */
  pageFromUrl: string | null
}

export const PreviewUrlBridgeContext = createContext<PreviewUrlBridgeValue>({
  navigateToPage: null,
  pageFromUrl: null,
})
