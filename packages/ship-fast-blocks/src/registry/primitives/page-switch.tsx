import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useStateField } from '@openuidev/react-lang'
import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  PageStateContext,
  RoutesContext,
  slugifyRoute,
} from '#/lib/route-context.tsx'
import { PreviewUrlBridgeContext } from '#/lib/preview-url-bridge.tsx'

// System-owned multi-page switcher. The orchestrator emits exactly one of these as `root`.
// routes[i] is the nav label; pages[i] is the page node for that route. Renders only the
// active page (by $page state, default routes[0]). Never picked by the model.
export const PageSwitch = defineCapsule({
  name: 'PageSwitch',
  description:
    'INTERNAL site router — do not select this directly. Renders one page at a time, switched by the shared $page state.',
  props: z.object({
    routes: z.array(z.string()),
    pages: z.array(z.any()),
    className: z.string().optional(),
    targetMap: z.record(z.string(), z.string()).optional(),
  }),
  component: ({ props, renderNode }) => {
    const routes = props.routes ?? []
    const page = useStateField<string>('page', routes[0])
    const [currentPage, setCurrentPage] = useState(
      page.value || routes[0] || '',
    )
    const [pendingSectionId, setPendingSectionId] = useState<string | null>(
      null,
    )
    const urlBridge = useContext(PreviewUrlBridgeContext)
    useEffect(() => {
      if (page.value && page.value !== currentPage) setCurrentPage(page.value)
    }, [currentPage, page.value])
    // Sync from the host URL router (preview dashboard). When the URL path
    // changes (e.g. browser back/forward), match the slug to a route label
    // and update the active page. Skipped when no bridge is provided
    // (exported/deployed site — each page is a real route there).
    useEffect(() => {
      if (urlBridge.navigateToPage === null) return
      const targetSlug = urlBridge.pageFromUrl
      if (targetSlug === null) {
        if (routes[0] && currentPage !== routes[0]) {
          setCurrentPage(routes[0])
          page.setValue(routes[0])
        }
        return
      }
      const matched = routes.find((route) => slugifyRoute(route) === targetSlug)
      if (matched && matched !== currentPage) {
        setCurrentPage(matched)
        page.setValue(matched)
      }
    }, [
      urlBridge.pageFromUrl,
      urlBridge.navigateToPage,
      routes,
      currentPage,
      page,
    ])

    let idx = routes.indexOf(currentPage)
    if (idx < 0) idx = 0
    const node = props.pages?.[idx]
    const contextValue = useMemo(
      () => ({
        routes,
        targetMap: props.targetMap ?? {},
        currentPage,
        setCurrentPage,
        pendingSectionId,
        setPendingSectionId,
      }),
      [currentPage, pendingSectionId, props.targetMap, routes],
    )
    const pageStateValue = useMemo(() => ({ setPage: page.setValue }), [page])
    return (
      <PageStateContext.Provider value={pageStateValue}>
        <RoutesContext.Provider value={contextValue}>
          <div className={props.className}>
            {node != null ? renderNode(node) : null}
          </div>
        </RoutesContext.Provider>
      </PageStateContext.Provider>
    )
  },
})

const fixedHeaderOffset = () => {
  if (typeof window === 'undefined') return 0
  const headers = Array.from(document.querySelectorAll('header'))
  for (const header of headers) {
    const style = window.getComputedStyle(header)
    if (style.position !== 'fixed' && style.position !== 'sticky') continue

    const rect = header.getBoundingClientRect()
    if (rect.height <= 0 || rect.bottom <= 0) continue
    if (style.position === 'fixed' || rect.top <= 1) {
      return Math.ceil(rect.height)
    }
  }

  return 0
}

function scrollElementIntoViewBelowChrome(node: HTMLElement) {
  const offset = fixedHeaderOffset()
  if (!offset) {
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  const top = Math.max(
    0,
    node.getBoundingClientRect().top + window.scrollY - offset,
  )
  window.scrollTo({ top, behavior: 'smooth' })
}

export const SectionAnchor = defineCapsule({
  name: 'SectionAnchor',
  description:
    'INTERNAL section anchor — do not select this directly. Wraps a generated section with a stable scroll target.',
  props: z.object({
    id: z.string(),
    children: z.any(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => {
    const routing = useMemo(() => props.id, [props.id])
    return (
      <RoutesContext.Consumer>
        {(context) => (
          <SectionAnchorNode
            id={routing}
            className={props.className}
            pendingSectionId={context.pendingSectionId}
            clearPending={() => context.setPendingSectionId(null)}
          >
            {renderNode(props.children)}
          </SectionAnchorNode>
        )}
      </RoutesContext.Consumer>
    )
  },
})

function SectionAnchorNode({
  id,
  className,
  pendingSectionId,
  clearPending,
  children,
}: {
  id: string
  className?: string
  pendingSectionId: string | null
  clearPending: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const hash =
      typeof window !== 'undefined'
        ? window.location.hash.replace(/^#/, '')
        : ''
    if (pendingSectionId !== id && hash !== id) return
    const node = document.getElementById(id)
    if (!node) return
    requestAnimationFrame(() => {
      scrollElementIntoViewBelowChrome(node)
      clearPending()
    })
  }, [clearPending, id, pendingSectionId])

  return (
    <div id={id} className={className}>
      {children}
    </div>
  )
}
