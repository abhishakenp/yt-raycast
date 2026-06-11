import { useEffect, useRef, forwardRef } from "react"
import {
  applyThemeVars,
  injectThemeFonts,
  clearThemeVars,
} from "../../genui/theme-apply"
import type { ThemeStyles } from "../../genui/theme-presets"
import { observeGeneratedMobileNavs } from './generated-mobile-nav'

// Renders children in a scoped div container with theme CSS custom properties applied.
// Theme changes only affect this container, not the app chrome (TopBar).
const DirectPreview = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    themeStyles: ThemeStyles | null
    isDark: boolean
    deviceMode?: 'desktop' | 'tablet' | 'mobile'
  }
>(({ children, themeStyles, isDark, deviceMode = 'desktop' }, ref) => {
  const internalRef = useRef<HTMLDivElement | null>(null)
  const setRootRef = (node: HTMLDivElement | null) => {
    internalRef.current = node

    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  useEffect(() => {
    const currentRoot = internalRef.current
    if (!currentRoot) return

    if (themeStyles) {
      applyThemeVars(currentRoot, themeStyles, isDark)
      injectThemeFonts(document, themeStyles)
    } else {
      clearThemeVars(currentRoot)
      currentRoot.classList.toggle("dark", isDark)
      currentRoot.style.colorScheme = isDark ? "dark" : "light"
    }
  }, [themeStyles, isDark])

  useEffect(() => {
    const currentRoot = internalRef.current
    if (!currentRoot) return

    return observeGeneratedMobileNavs(currentRoot, deviceMode)
  }, [children, deviceMode])

  return (
    <div
      ref={setRootRef}
      className="genui-preview size-full bg-background overflow-auto"
      data-preview-device={deviceMode}
    >
      {children}
    </div>
  )
})

DirectPreview.displayName = 'DirectPreview'

export default DirectPreview
