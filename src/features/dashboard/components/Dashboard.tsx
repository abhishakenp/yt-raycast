import { useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { IntroLoader } from '@/components/GenUI/IntroLoader'
import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'
import ThemePicker from '@/genui/components/ThemePicker'
import { resolveThemeStyles } from '@/genui/theme-apply'
import './Dashboard.css'
import './space-shell.css'
import './liquid-glass-button.css'

interface DashboardProps {
  sessionId: string
}

type RailMode = 'tools' | 'cms' | 'commerce' | 'export'

const crownIcon = (
  <svg className="preview-site-rail-badge__crown" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
      <div className="stitch-grid sf-dashboard-stitch" aria-hidden="true">
        <div className="stitch-grid__layer"></div>
        <div className="stitch-grid__layer stitch-grid__layer--lit"></div>
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

      <div className={`dashboard-wrap ${isDashboardActive ? 'active' : ''}`} id="dashboard-wrap">
        <div className={`right-panel open ${isPreviewReady ? 'expanded' : ''}`} id="right-panel">
          <div className={`browser-chrome ${isPreviewReady ? 'is-preview-ready' : ''}`}>
            <div className="browser-toolbar">
              <button
                type="button"
                className="preview-toolbar-home"
                onClick={navigateHome}
                data-tip="Back to home"
                aria-label="Back to home"
              >
                <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
              <div className="browser-url">
                <span className="lock">&#9679;</span>
                <a className="url-text" id="url-text" href={`/generate/${sessionId}`} aria-label="Current generation">
                  /generate/{sessionId}
                </a>
              </div>
              <div className="preview-frame-tools" id="preview-frame-tools" aria-label="Preview controls">
                <button
                  type="button"
                  className="preview-tool-btn"
                  id="preview-refresh-btn"
                  data-tip="Refresh generation view"
                  aria-label="Reload page"
                  onClick={() => window.location.reload()}
                >
                  <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
                <div className="preview-device-group" role="group" aria-label="Viewport size">
                  {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                    <button
                      key={device}
                      type="button"
                      className={`preview-tool-btn preview-device-btn ${currentDevice === device ? 'is-active' : ''}`}
                      data-preview-device={device}
                      data-tip={device}
                      aria-label={`${device} width`}
                      aria-pressed={currentDevice === device}
                      onClick={() => setCurrentDevice(device)}
                    >
                      {device === 'desktop' ? (
                        <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : device === 'tablet' ? (
                        <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M11 18h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="8" y="2.5" width="8" height="19" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M11 18h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="preview-inspect-group" role="group" aria-label="Inspect controls">
                  <button
                    type="button"
                    className={`preview-tool-btn ${inspectMode === 'select' ? 'is-active' : ''}`}
                    data-tip="Select"
                    aria-label="Select element"
                    aria-pressed={inspectMode === 'select'}
                    onClick={() => setInspectMode('select')}
                  >
                    <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M4 3l7 17 2-7 7-2L4 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`preview-tool-btn ${inspectMode === 'annotate' ? 'is-active' : ''}`}
                    data-tip="Annotate"
                    aria-label="Annotate preview"
                    aria-pressed={inspectMode === 'annotate'}
                    onClick={() => setInspectMode('annotate')}
                  >
                    <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M12 20h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="preview-tool-btn"
                    data-tip="Clear selection"
                    aria-label="Clear selection"
                    onClick={() => setInspectMode(null)}
                  >
                    <svg className="preview-tool-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="browser-content browser-content--has-site-rail">
              <div className="browser-content-main">
                <div className={`preview-stage sf-device-${currentDevice}`} id="preview-stage">
                  <div className="preview-device-shell" id="preview-device-shell">
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
                      <div className="generated-module-empty" role="status" aria-live="polite">
                        <div className="pulse-ring"></div>
                        <p>{hasFailures ? 'Generation failed' : 'Waiting for generated module...'}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`preview-loading determinate ${isPreviewReady ? 'hidden' : ''}`} id="preview-loading">
                  <div className="preview-progress">
                    <div className="preview-progress-fill" id="preview-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
              <aside
                className={`preview-site-rail ${railMode !== 'tools' ? 'is-editing' : ''}`}
                id="preview-site-rail"
                aria-label="Site tools"
              >
                <div className="preview-site-rail-inner preview-site-rail-default">
                  <div className="preview-site-rail-section">
                    <div className="preview-site-rail-section-label">Manage content</div>
                    <button type="button" className="preview-site-rail-row" data-rail-action="cms-studio" onClick={() => setRailMode('cms')}>
                      <span className="preview-site-rail-row-icon preview-site-rail-row-icon--sanity" aria-hidden="true">
                        <svg viewBox="0 -10 28 32" width="30" height="32" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                          <path d="M21.5 6.5c0-1.9-1.55-2.95-3.65-2.95h-4.2c-2.55 0-4.25 1.45-4.25 3.65 0 1.9 1.35 2.95 3.65 3.4l4.2 0.9c2.3 0.45 3.6 1.5 3.6 3.4 0 2.15-1.7 3.5-4.25 3.5H11.9" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M20.4 5.2 C 20.9 -0.6 21.6 -3 23.3 -6 C 23.7 -2 23.2 1 22.3 5.2 Z" fill="#ffffff" />
                        </svg>
                      </span>
                      <span className="preview-site-rail-row-label">Edit content</span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--new">NEW</span>
                    </button>
                    <button type="button" className="preview-site-rail-row" data-rail-action="ecommerce" onClick={() => setRailMode('commerce')}>
                      <span className="preview-site-rail-row-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </span>
                      <span className="preview-site-rail-row-label">E-commerce</span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--new">
                        {commerceConfig?.status === 'ready' ? 'READY' : 'NEW'}
                      </span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--premium" aria-label="Pro only - upgrade to unlock" tabIndex={0}>
                        {crownIcon}
                      </span>
                    </button>
                  </div>
                  <div className="preview-site-rail-section">
                    <div className="preview-site-rail-section-label">Design</div>
                      <ThemePicker
                        value={effectiveTheme}
                        isDark={isDark}
                        onSelect={setSelectedTheme}
                        onToggleMode={() => setIsDark((dark) => !dark)}
                        trigger={
                          <button type="button" className="preview-site-rail-row preview-site-rail-row--theme-picker" data-rail-action="palette">
                            <span className="preview-site-rail-row-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
                                <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
                                <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10a1.7 1.7 0 0 0 1.7-1.7c0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.2a1.7 1.7 0 0 1 1.7-1.7H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8Z" />
                              </svg>
                            </span>
                            <span className="preview-site-rail-row-text">
                              <span className="preview-site-rail-row-label">Theme</span>
                              <span className="preview-site-rail-row-meta">{effectiveTheme ?? 'Default'}</span>
                            </span>
                            <span className="preview-site-rail-row-icon" aria-hidden="true">
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
                    <button type="button" className="preview-site-rail-row" data-rail-action="github">
                      <span className="preview-site-rail-row-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      </span>
                      <span className="preview-site-rail-row-label">GitHub</span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--premium" aria-label="Pro only - upgrade to unlock" tabIndex={0}>{crownIcon}</span>
                    </button>
                    <button type="button" className="preview-site-rail-row preview-site-rail-row--export" data-rail-action="export" aria-haspopup="dialog" onClick={() => setRailMode('export')}>
                      <span className="preview-site-rail-row-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="m7 10 5 5 5-5" />
                          <path d="M12 15V3" />
                        </svg>
                      </span>
                      <span className="preview-site-rail-row-text">
                        <span className="preview-site-rail-row-label">Export</span>
                        <span className="preview-site-rail-row-meta">HTML / React / Next.js</span>
                      </span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--state" data-state="premium">Pro only</span>
                    </button>
                    <button type="button" className="preview-site-rail-row" data-rail-action="domain">
                      <span className="preview-site-rail-row-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                        </svg>
                      </span>
                      <span className="preview-site-rail-row-label">Assign custom domain</span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--premium" aria-label="Pro only - upgrade to unlock" tabIndex={0}>{crownIcon}</span>
                    </button>
                  </div>
                  <div className="preview-site-rail-section">
                    <div className="preview-site-rail-section-label">Three JS</div>
                    <button type="button" className="preview-site-rail-row preview-site-rail-row--soon" disabled data-rail-action="3d">
                      <span className="preview-site-rail-row-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <span className="preview-site-rail-row-label">3D</span>
                      <span className="preview-site-rail-badge preview-site-rail-badge--soon">SOON</span>
                    </button>
                  </div>
                </div>
                <div className="preview-site-rail-editor" id="preview-site-rail-editor">
                  <div className="rail-editor-header">
                    <div className="rail-editor-thumb" id="rail-editor-thumb"></div>
                    <div className="rail-editor-label">
                      <div className="rail-editor-label-title" id="rail-editor-label-title">
                        {railMode === 'cms' ? 'Content' : railMode === 'commerce' ? 'Medusa commerce' : 'Export'}
                      </div>
                      <div className="rail-editor-label-sub" id="rail-editor-label-sub">
                        {generationView?.session.status.replaceAll('_', ' ') ?? 'loading'}
                      </div>
                    </div>
                  </div>
                  <div className="rail-editor-breadcrumb" id="rail-editor-breadcrumb">
                    <button type="button" className="rail-editor-breadcrumb-chip" data-active="true" onClick={() => setRailMode('tools')}>tools</button>
                    <span className="rail-editor-breadcrumb-sep">/</span>
                    <span className="rail-editor-breadcrumb-chip" data-active="true">{railMode}</span>
                  </div>
                  <div className="rail-editor-main">
                    <div className="rail-editor-tabs" id="rail-editor-tabs">
                      <button type="button" className="rail-editor-tabs-btn is-active" data-active="true" aria-label={railMode}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7h16M4 12h16M4 17h10" />
                        </svg>
                      </button>
                    </div>
                    <div className="rail-editor-body" id="rail-editor-body">
                      {railMode === 'cms' ? (
                        <div className="preview-chat-cms-form">
                          <p className="preview-chat-cms-note">Content controls are bound to this Convex session and render against the live generated module.</p>
                          <label className="preview-chat-cms-label">Homepage title override<input type="text" defaultValue="" /></label>
                          <label className="preview-chat-cms-label">Generation prompt<textarea rows={5} defaultValue={generationView?.session.prompt ?? ''} /></label>
                        </div>
                      ) : railMode === 'commerce' ? (
                        <div className="preview-chat-cms-form">
                          <p className="preview-chat-cms-note">Medusa config is read from Convex for this session.</p>
                          <label className="preview-chat-cms-label">Status<input type="text" readOnly value={commerceConfig?.status ?? 'not configured'} /></label>
                          <label className="preview-chat-cms-label">Backend URL<input type="url" readOnly value={commerceConfig?.backendUrl ?? ''} /></label>
                          <label className="preview-chat-cms-label">Admin URL<input type="url" readOnly value={commerceConfig?.adminUrl ?? ''} /></label>
                        </div>
                      ) : (
                        <div className="preview-chat-cms-form">
                          <p className="preview-chat-cms-note">Export will use the Convex generated module source for this session.</p>
                          <label className="preview-chat-cms-label">Module<input type="text" readOnly value={homeModule?.moduleKey ?? 'home'} /></label>
                          <label className="preview-chat-cms-label">Source bytes<input type="text" readOnly value={String(homeModule?.source?.length ?? 0)} /></label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rail-editor-footer">
                    <button type="button" className="rail-editor-btn rail-editor-btn--ghost" id="rail-editor-cancel" onClick={() => setRailMode('tools')}>Cancel</button>
                    <button type="button" className="rail-editor-btn rail-editor-btn--primary" id="rail-editor-done" onClick={() => setRailMode('tools')}>Done</button>
                  </div>
                </div>
                <div className="preview-site-rail-status" id="preview-site-rail-status">
                  <span className="preview-site-rail-status-icon" aria-hidden="true">
                    <span className="preview-site-rail-status-dot" id="status-dot"></span>
                  </span>
                  <span className="preview-site-rail-status-label" id="status-text">
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
