import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useStateField } from '@openuidev/react-lang'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { RoutesContext } from '#/lib/use-navigate.tsx'

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
    useEffect(() => {
      if (page.value && page.value !== currentPage) setCurrentPage(page.value)
    }, [currentPage, page.value])

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
    return (
      <RoutesContext.Provider value={contextValue}>
        <div className={props.className}>
          {node != null ? renderNode(node) : null}
        </div>
      </RoutesContext.Provider>
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

const scrollElementIntoViewBelowChrome = (node: HTMLElement) => {
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
