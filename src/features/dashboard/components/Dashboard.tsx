import { useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { IntroLoader } from '@/components/GenUI/IntroLoader'
import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'
import ThemePicker from '@/genui/components/ThemePicker'
import { resolveThemeStyles } from '@/genui/theme-apply'
import { cn } from '#/lib/utils'

interface DashboardProps {
  sessionId: string
}

type RailMode = 'tools' | 'cms' | 'commerce' | 'export'

const crownIcon = (
  <svg className="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 7l4 3 5-6 5 6 4-3-2 11H5L3 7zm3 13h12v2H6v-2z" />
  </svg>
)

const readSiteThemeName = (specJson: string | undefined): string | null => {
  if (!specJson) return null
  try {
    const parsed = JSON.parse(specJson) as { theme?: unknown; themeName?: unknown; genuiTheme?: unknown }
    const theme = parsed.themeName ?? parsed.genuiTheme ?? parsed.theme
    return typeof theme === 'string' ? theme : null
  } catch {
    return null
  }
}

export function Dashboard({ sessionId }: DashboardProps) {
  const [isDashboardActive, setIsDashboardActive] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [inspectMode, setInspectMode] = useState<'select' | 'annotate' | null>('select')
  const [railMode, setRailMode] = useState<RailMode>('tools')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const generationView = useQuery(api.sessions.getGenerationView, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const commerceConfig = useQuery(api.sessions.getCommerceConfig, {
    sessionId: sessionId as Id<'sessions'>,
  })

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setIsDashboardActive(true)
      return
    }

    const tDashboard = window.setTimeout(() => {
      setIsDashboardActive(true)
    }, 2200)

    return () => {
      window.clearTimeout(tDashboard)
    }
  }, [])

  const progress = useMemo(() => {
    if (!generationView || generationView.tasks.length === 0) return 0
    if (generationView.session.status === 'preview_ready') return 100

    const done = generationView.tasks.filter((task) => task.status === 'succeeded').length
    return Math.max(5, Math.round((done / generationView.tasks.length) * 100))
  }, [generationView])

  const hasFailures =
    generationView?.session.status === 'failed' ||
    generationView?.tasks.some((task) => task.status === 'failed') === true
  const homeModule = generationView?.homeModule
  const isPreviewReady = Boolean(homeModule?.source)
  const aiTheme = useMemo(() => readSiteThemeName(generationView?.siteSpec?.specJson), [generationView?.siteSpec?.specJson])
  const effectiveTheme = selectedTheme ?? aiTheme
  const themeStyles = resolveThemeStyles(effectiveTheme)

  const navigateHome = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = '/'
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,rgba(35,229,255,0.18),transparent_34%),linear-gradient(180deg,#070913_0%,#0a0d16_100%)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(103,232,249,0.14),transparent_36%)]"></div>
      </div>

      <audio id="launch-sfx" preload="auto" src="/assets/launch.mp3"></audio>

      {!isPreviewReady ? (
        <IntroLoader
          progress={Math.min(0.94, progress / 100)}
          logs={generationView?.events.map((event) => ({
            eventType: event.eventType,
            message: event.message,
            createdAt: event.createdAt,
          })) ?? []}
        />
      ) : null}

      <div className={cn(
        'relative z-[1] min-h-screen w-full overflow-hidden p-4 opacity-0 transition-opacity duration-700 ease-out',
        isDashboardActive && 'opacity-100',
      )} id="dashboard-wrap">
        <div className={cn(
          'mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[1680px] items-center justify-center',
          isPreviewReady && 'items-stretch',
        )} id="right-panel">
          <div className={cn(
            'flex h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl rounded-bl-none border border-white/10 bg-[#0b0d14]/88 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-[22px]',
            isPreviewReady && 'bg-[#080a10]/92',
          )}>
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.035] px-3">
              <button
                type="button"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white"
                onClick={navigateHome}
                data-tip="Back to home"
                aria-label="Back to home"
              >
                <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 18-6-6 6-6"
                  />
                </svg>
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/8 bg-black/25 px-3 py-2 text-sm text-white/48">
                <span className="size-2 shrink-0 rounded-full bg-emerald-300/80">&#9679;</span>
                <a className="min-w-0 truncate font-mono text-xs text-white/56 no-underline" id="url-text" href={`/generate/${sessionId}`} aria-label="Current generation">
                  /generate/{sessionId}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2" id="preview-frame-tools" aria-label="Preview controls">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/62 transition-colors hover:bg-white/[0.09] hover:text-white"
                  id="preview-refresh-btn"
                  data-tip="Refresh generation view"
                  aria-label="Reload page"
                  onClick={() => window.location.reload()}
                >
                  <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M21 21v-5h-5"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1" role="group" aria-label="Viewport size">
                  {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                    <button
                      key={device}
                      type="button"
                      className={cn(
                        'grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                        currentDevice === device && 'bg-cyan-300/16 text-cyan-100',
                      )}
                      data-preview-device={device}
                      data-tip={device}
                      aria-label={`${device} width`}
                      aria-pressed={currentDevice === device}
                      onClick={() => setCurrentDevice(device)}
                    >
                      {device === 'desktop' ? (
                        <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : device === 'tablet' ? (
                        <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M11 18h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="8" y="2.5" width="8" height="19" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M11 18h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1 max-[760px]:hidden" role="group" aria-label="Inspect controls">
                  <button
                    type="button"
                    className={cn(
                      'grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                      inspectMode === 'select' && 'bg-cyan-300/16 text-cyan-100',
                    )}
                    data-tip="Select"
                    aria-label="Select element"
                    aria-pressed={inspectMode === 'select'}
                    onClick={() => setInspectMode('select')}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M4 3l7 17 2-7 7-2L4 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                      inspectMode === 'annotate' && 'bg-cyan-300/16 text-cyan-100',
                    )}
                    data-tip="Annotate"
                    aria-label="Annotate preview"
                    aria-pressed={inspectMode === 'annotate'}
                    onClick={() => setInspectMode('annotate')}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M12 20h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white"
                    data-tip="Clear selection"
                    aria-label="Clear selection"
                    onClick={() => setInspectMode(null)}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] max-[1100px]:grid-cols-1">
              <div className="relative min-h-0 overflow-hidden bg-[#05070c]">
                <div className={cn(
                  'flex h-full min-h-0 items-center justify-center overflow-auto',
                )} id="preview-stage">
                  <div className={cn(
                    'h-full min-h-[480px] overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.38)] transition-all duration-300',
                    currentDevice === 'desktop' && 'w-full max-w-none',
                    currentDevice === 'tablet' && 'w-[820px] max-w-full',
                    currentDevice === 'mobile' && 'w-[390px] max-w-full',
                  )} id="preview-device-shell">
                    {homeModule?.source ? (
                      <GeneratedModulePreview
                        source={homeModule.source}
                        sessionId={sessionId}
                        siteSpecJson={generationView?.siteSpec?.specJson}
                        locale={generationView?.session.preferredLanguage}
                        isDark={isDark}
                        themeStyles={themeStyles}
                      />
                    ) : (
                      <div className="grid h-full min-h-[480px] place-items-center gap-4 bg-[#090c14] text-center text-white/62" role="status" aria-live="polite">
                        <div className="size-12 animate-ping rounded-full border border-cyan-300/40"></div>
                        <p>{hasFailures ? 'Generation failed' : 'Waiting for generated module...'}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  'absolute inset-x-10 bottom-8 rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur',
                  isPreviewReady && 'hidden',
                )} id="preview-loading">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300 transition-[width] duration-300" id="preview-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
              <aside
                className={cn(
                  'relative flex min-h-0 flex-col border-l border-white/10 bg-[#0c1018]/92 max-[1100px]:hidden',
                  railMode !== 'tools' && 'bg-[#0d111b]/96',
                )}
                id="preview-site-rail"
                aria-label="Site tools"
              >
                <div className={cn('flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4', railMode !== 'tools' && 'hidden')}>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">Manage content</div>
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/74 transition-colors hover:bg-white/[0.075] hover:text-white" data-rail-action="cms-studio" onClick={() => setRailMode('cms')}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white" aria-hidden="true">
                        <svg viewBox="0 -10 28 32" width="30" height="32" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                          <path d="M21.5 6.5c0-1.9-1.55-2.95-3.65-2.95h-4.2c-2.55 0-4.25 1.45-4.25 3.65 0 1.9 1.35 2.95 3.65 3.4l4.2 0.9c2.3 0.45 3.6 1.5 3.6 3.4 0 2.15-1.7 3.5-4.25 3.5H11.9" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M20.4 5.2 C 20.9 -0.6 21.6 -3 23.3 -6 C 23.7 -2 23.2 1 22.3 5.2 Z" fill="#ffffff" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate">Edit content</span>
                      <span className="rounded-full bg-cyan-300/14 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-100">NEW</span>
                    </button>
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/74 transition-colors hover:bg-white/[0.075] hover:text-white" data-rail-action="ecommerce" onClick={() => setRailMode('commerce')}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate">E-commerce</span>
                      <span className="rounded-full bg-cyan-300/14 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-100">
                        {commerceConfig?.status === 'ready' ? 'READY' : 'NEW'}
                      </span>
                      <span className="grid size-5 place-items-center rounded-full bg-amber-300/14 text-amber-200" aria-label="Pro only - upgrade to unlock" tabIndex={0}>
                        {crownIcon}
                      </span>
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">Design</div>
                    <ThemePicker
                      value={effectiveTheme}
                      isDark={isDark}
                      onSelect={setSelectedTheme}
                      onToggleMode={() => setIsDark((dark) => !dark)}
                      trigger={
                        <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/74 transition-colors hover:bg-white/[0.075] hover:text-white" data-rail-action="palette">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                              <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
                              <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
                              <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10a1.7 1.7 0 0 0 1.7-1.7c0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.2a1.7 1.7 0 0 1 1.7-1.7H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8Z" />
                            </svg>
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="truncate">Theme</span>
                            <span className="truncate text-xs text-white/38">{effectiveTheme ?? 'Default'}</span>
                          </span>
                          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-white/52" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                              <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
                              <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
                              <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10a1.7 1.7 0 0 0 1.7-1.7c0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.2a1.7 1.7 0 0 1 1.7-1.7H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8Z" />
                            </svg>
                          </span>
                        </button>
                      }
                    />
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/74 transition-colors hover:bg-white/[0.075] hover:text-white" data-rail-action="github">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate">GitHub</span>
                      <span className="grid size-5 place-items-center rounded-full bg-amber-300/14 text-amber-200" aria-label="Pro only - upgrade to unlock" tabIndex={0}>{crownIcon}</span>
                    </button>
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/74 transition-colors hover:bg-white/[0.075] hover:text-white" data-rail-action="export" aria-haspopup="dialog" onClick={() => setRailMode('export')}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="m7 10 5 5 5-5" />
                          <path d="M12 15V3" />
                        </svg>
                      </span>
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="truncate">Export</span>
                        <span className="truncate text-xs text-white/38">HTML / React / Next.js</span>
                      </span>
                      <span className="rounded-full bg-amber-300/14 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-200" data-state="premium">Pro only</span>
                    </button>
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/74 transition-colors hover:bg-white/[0.075] hover:text-white" data-rail-action="domain">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate">Assign custom domain</span>
                      <span className="grid size-5 place-items-center rounded-full bg-amber-300/14 text-amber-200" aria-label="Pro only - upgrade to unlock" tabIndex={0}>{crownIcon}</span>
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">Three JS</div>
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-3 py-3 text-left text-sm text-white/34" disabled data-rail-action="3d">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-white/38" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate">3D</span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-white/38">SOON</span>
                    </button>
                  </div>
                </div>
                <div className={cn('hidden min-h-0 flex-1 flex-col p-4', railMode !== 'tools' && 'flex')} id="preview-site-rail-editor">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-cyan-300/14" id="rail-editor-thumb"></div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white" id="rail-editor-label-title">
                        {railMode === 'cms' ? 'Content' : railMode === 'commerce' ? 'Medusa commerce' : 'Export'}
                      </div>
                      <div className="truncate text-xs text-white/42" id="rail-editor-label-sub">
                        {generationView?.session.status.replaceAll('_', ' ') ?? 'loading'}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-xs text-white/42" id="rail-editor-breadcrumb">
                    <button type="button" className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/70" data-active="true" onClick={() => setRailMode('tools')}>tools</button>
                    <span>/</span>
                    <span className="rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1 text-cyan-100" data-active="true">{railMode}</span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/18">
                    <div className="border-b border-white/10 p-2" id="rail-editor-tabs">
                      <button type="button" className="grid size-9 place-items-center rounded-xl bg-cyan-300/12 text-cyan-100" data-active="true" aria-label={railMode}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7h16M4 12h16M4 17h10" />
                        </svg>
                      </button>
                    </div>
                    <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-4" id="rail-editor-body">
                      {railMode === 'cms' ? (
                        <div className="grid gap-4 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-white/[0.04] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-white/45 [&_textarea]:mt-2 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/10 [&_textarea]:bg-white/[0.04] [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm [&_textarea]:text-white [&_textarea]:outline-none">
                          <p className="m-0 text-sm leading-6 text-white/55">Content controls are bound to this Convex session and render against the live generated module.</p>
                          <label>Homepage title override<input type="text" defaultValue="" /></label>
                          <label>Generation prompt<textarea rows={5} defaultValue={generationView?.session.prompt ?? ''} /></label>
                        </div>
                      ) : railMode === 'commerce' ? (
                        <div className="grid gap-4 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-white/[0.04] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-white/45">
                          <p className="m-0 text-sm leading-6 text-white/55">Medusa config is read from Convex for this session.</p>
                          <label>Status<input type="text" readOnly value={commerceConfig?.status ?? 'not configured'} /></label>
                          <label>Backend URL<input type="url" readOnly value={commerceConfig?.backendUrl ?? ''} /></label>
                          <label>Admin URL<input type="url" readOnly value={commerceConfig?.adminUrl ?? ''} /></label>
                        </div>
                      ) : (
                        <div className="grid gap-4 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-white/[0.04] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-white/45">
                          <p className="m-0 text-sm leading-6 text-white/55">Export will use the Convex generated module source for this session.</p>
                          <label>Module<input type="text" readOnly value={homeModule?.moduleKey ?? 'home'} /></label>
                          <label>Source bytes<input type="text" readOnly value={String(homeModule?.source?.length ?? 0)} /></label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white" id="rail-editor-cancel" onClick={() => setRailMode('tools')}>Cancel</button>
                    <button type="button" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px" id="rail-editor-done" onClick={() => setRailMode('tools')}>Done</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/48" id="preview-site-rail-status">
                  <span className="grid size-5 place-items-center rounded-full bg-white/[0.04]" aria-hidden="true">
                    <span className={cn('size-2 rounded-full', isPreviewReady ? 'bg-emerald-300' : 'bg-cyan-300 animate-pulse')} id="status-dot"></span>
                  </span>
                  <span id="status-text">
                    {isPreviewReady ? 'Preview ready' : 'Generating'}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
