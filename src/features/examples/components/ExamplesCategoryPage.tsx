import { useMatch, useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PreviewUrlBridgeContext,
  type PreviewUrlBridgeValue,
} from '@ship-fast/blocks/runtime'

import { SessionGeneratedPreview } from '@/features/dashboard/components/SessionGeneratedPreview'
import ThemePicker from '@/genui/components/ThemePicker'
import { resolveThemeStyles } from '@/genui/theme-apply'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  getExampleCategories,
  getExampleCategorySite,
} from '../lib/examples-data'
import { parseExamplesThemeSearch } from '../lib/examples-theme-search'

const SHORTCUT_WINDOW_MS = 2000
const SHORTCUT_PRESS_COUNT = 5

const extractExamplePageSlug = (
  pathname: string,
  category: string,
): string | null => {
  const prefix = `/examples/${category}/`
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length)
  if (!rest) return null
  return rest.split('/')[0] || null
}

const isEditableShortcutTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'select' ||
    tagName === 'textarea' ||
    tagName === 'button'
  )
}

export const ExamplesCategoryPage = () => {
  const categoryMatch = useMatch({
    from: '/examples/$category',
    shouldThrow: false,
  })
  const wildcardMatch = useMatch({
    from: '/examples/$category/$',
    shouldThrow: false,
  })
  const category =
    wildcardMatch?.params.category ?? categoryMatch?.params.category ?? ''
  const search = parseExamplesThemeSearch(
    wildcardMatch?.search ?? categoryMatch?.search ?? {},
  )
  const { theme, mode } = search
  const navigate = useNavigate({ from: '/examples/$category' })
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [pageFromUrl, setPageFromUrl] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? extractExamplePageSlug(window.location.pathname, category)
      : null,
  )
  const shortcutPressesRef = useRef<number[]>([])
  const site = getExampleCategorySite(category)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code !== 'Space' && event.key !== ' ') return
      if (isEditableShortcutTarget(event.target)) return

      event.preventDefault()
      const now = Date.now()
      shortcutPressesRef.current = [
        ...shortcutPressesRef.current.filter(
          (timestamp) => now - timestamp <= SHORTCUT_WINDOW_MS,
        ),
        now,
      ]

      if (shortcutPressesRef.current.length >= SHORTCUT_PRESS_COUNT) {
        shortcutPressesRef.current = []
        setThemeDialogOpen(true)
        setThemePickerOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setPageFromUrl(extractExamplePageSlug(window.location.pathname, category))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [category])

  useEffect(() => {
    setPageFromUrl(extractExamplePageSlug(pathname, category))
  }, [category, pathname])

  const navigateToPage = useCallback(
    (pageSlug: string | null) => {
      const baseUrl = `/examples/${category}`
      const search = window.location.search
      const targetUrl = pageSlug
        ? `${baseUrl}/${pageSlug}${search}`
        : `${baseUrl}${search}`
      window.history.pushState(null, '', targetUrl)
      setPageFromUrl(pageSlug)
    },
    [category],
  )

  const bridgeValue = useMemo<PreviewUrlBridgeValue>(
    () => ({
      navigateToPage,
      pageFromUrl,
    }),
    [navigateToPage, pageFromUrl],
  )

  if (!site) return null

  const previewKey = `${category}:${theme}:${mode}:${site.source.length}`

  const handleThemeChange = (nextTheme: string) => {
    void navigate({
      to: '/examples/$category',
      params: { category },
      search: { theme: nextTheme, mode },
      replace: true,
    })
  }

  const handleModeToggle = () => {
    void navigate({
      to: '/examples/$category',
      params: { category },
      search: { theme, mode: mode === 'dark' ? 'light' : 'dark' },
      replace: true,
    })
  }

  const handleCategoryChange = (nextCategory: string) => {
    void navigate({
      to: '/examples/$category',
      params: { category: nextCategory },
      search: { theme, mode },
      replace: true,
    })
  }

  const categories = getExampleCategories()
  const handleThemeDialogOpenChange = (open: boolean) => {
    setThemeDialogOpen(open)
    if (!open) setThemePickerOpen(false)
  }

  return (
    <main className="relative left-1/2 h-screen min-h-screen w-screen -translate-x-1/2 overflow-x-hidden bg-background text-foreground">
      <Dialog open={themeDialogOpen} onOpenChange={handleThemeDialogOpenChange}>
        <DialogContent className="w-[min(760px,calc(100vw-24px))] sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Example theme</DialogTitle>
            <DialogDescription>
              Pick a category, theme, and light or dark mode.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <Command className="rounded-lg border border-border">
              <CommandInput placeholder="Search categories..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-80">
                    {categories.map((item) => (
                      <CommandItem
                        key={item.category}
                        value={`${item.label} ${item.category} ${item.functionalTypes.join(' ')}`}
                        onSelect={() => handleCategoryChange(item.category)}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.capsuleCount}
                        </span>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="rounded-lg border border-border p-3">
              <ThemePicker
                value={theme}
                isDark={mode === 'dark'}
                onSelect={handleThemeChange}
                onToggleMode={handleModeToggle}
                open={themePickerOpen}
                onOpenChange={setThemePickerOpen}
                popoverSide="bottom"
                popoverAlign="start"
                popoverClassName="z-[70]"
              />
            </div>
          </div>
          <div className="sr-only" aria-live="polite">
            Current category: {site.label}
          </div>
        </DialogContent>
      </Dialog>
      <PreviewUrlBridgeContext.Provider value={bridgeValue}>
        <SessionGeneratedPreview
          key={previewKey}
          source={site.source}
          prompt={`${site.label} full site examples`}
          siteSpecJson={JSON.stringify({
            brand: site.label,
            tagline: site.imageContextTitle,
          })}
          isDark={mode === 'dark'}
          themeStyles={resolveThemeStyles(theme)}
          deviceMode="desktop"
        />
      </PreviewUrlBridgeContext.Provider>
    </main>
  )
}
