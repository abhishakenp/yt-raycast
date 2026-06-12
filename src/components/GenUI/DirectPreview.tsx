import { useCallback, useEffect, useRef, useState, forwardRef } from 'react'
import { PortalContainerProvider } from '@ship-fast/blocks/portal'
import {
  applyThemeVars,
  injectThemeFonts,
  clearThemeVars,
} from '../../genui/theme-apply'
import type { ThemeStyles } from '../../genui/theme-presets'
import { observeGeneratedMobileNavs } from './generated-mobile-nav'

export type PreviewToolMode = 'select' | 'annotate' | null

// Renders children in a scoped div container with theme CSS custom properties applied.
// Theme changes only affect this container, not the app chrome (TopBar).
const DirectPreview = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    themeStyles: ThemeStyles | null
    isDark: boolean
    deviceMode?: 'desktop' | 'tablet' | 'mobile'
    previewToolMode?: PreviewToolMode
  }
>(({ children, themeStyles, isDark, deviceMode = 'desktop', previewToolMode = null }, ref) => {
  const internalRef = useRef<HTMLDivElement | null>(null)
  const selectedElementRef = useRef<HTMLElement | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  )

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (internalRef.current === node) return

      internalRef.current = node
      setPortalContainer(node)

      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref],
  )

  useEffect(() => {
    const currentRoot = internalRef.current
    if (!currentRoot) return

    if (themeStyles) {
      applyThemeVars(currentRoot, themeStyles, isDark)
      injectThemeFonts(document, themeStyles)
    } else {
      clearThemeVars(currentRoot)
      currentRoot.classList.toggle('dark', isDark)
      currentRoot.style.colorScheme = isDark ? 'dark' : 'light'
    }
  }, [themeStyles, isDark])

  useEffect(() => {
    const currentRoot = internalRef.current
    if (!currentRoot) return

    return observeGeneratedMobileNavs(currentRoot, deviceMode)
  }, [children, deviceMode])

  useEffect(() => {
    const currentRoot = internalRef.current
    if (!currentRoot) return

    currentRoot.dataset.previewToolMode = previewToolMode ?? ''

    const clearSelectedElement = () => {
      const selectedElement = selectedElementRef.current
      if (!selectedElement) return

      selectedElement.removeAttribute('data-ship-fast-selected')
      selectedElement.style.outline = ''
      selectedElement.style.outlineOffset = ''
      selectedElement.style.cursor = ''
      selectedElementRef.current = null
    }

    if (previewToolMode !== 'select') {
      clearSelectedElement()
      return
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !currentRoot.contains(target)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      clearSelectedElement()

      target.setAttribute('data-ship-fast-selected', 'true')
      target.style.outline = '2px solid rgb(34, 211, 238)'
      target.style.outlineOffset = '3px'
      target.style.cursor = 'crosshair'
      selectedElementRef.current = target

      currentRoot.dispatchEvent(
        new CustomEvent('ship-fast-preview-select', {
          bubbles: true,
          detail: {
            label:
              target.getAttribute('aria-label') ||
              target.textContent?.trim().replace(/\s+/g, ' ').slice(0, 96) ||
              target.tagName.toLowerCase(),
            tagName: target.tagName.toLowerCase(),
          },
        }),
      )
    }

    currentRoot.addEventListener('click', handleClick, true)

    return () => {
      currentRoot.removeEventListener('click', handleClick, true)
      clearSelectedElement()
    }
  }, [previewToolMode, children])

  return (
    <PortalContainerProvider container={portalContainer}>
      <div
        ref={setRootRef}
        className="genui-preview relative size-full transform-gpu overflow-auto bg-background"
        data-preview-device={deviceMode}
      >
        {children}
      </div>
    </PortalContainerProvider>
  )
})

DirectPreview.displayName = 'DirectPreview'

export default DirectPreview
