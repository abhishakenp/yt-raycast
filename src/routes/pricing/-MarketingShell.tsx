import { glassPillAnchorHtml, glassPillButtonHtml, glassPillSvgDefs } from '@/lib/glass-pill-html'
import { useEffect } from 'react'
import styles from './MarketingShell.module.css'

const topActionsRightHtml = `<div class="top-actions-right">
      ${glassPillAnchorHtml({ className: 'pill--top-actions', href: '/pricing', html: 'Pricing' })}
      <div class="top-actions-auth-slot">
        ${glassPillButtonHtml({ className: 'pill--top-actions', id: 'signin-btn', html: 'Sign in' })}
        ${glassPillButtonHtml({
          className: 'pill--top-actions',
          id: 'signout-btn',
          html: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign out',
        })}
      </div>
    </div>`

export const MarketingShell = ({
  children,
  footer = false,
}: {
  children: React.ReactNode
  footer?: boolean
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    document.body.classList.add('sf-marketing-page')

    void import('@/scripts/launch-backdrop').catch(() => {
      // Non-critical page atmosphere.
    })

    const scriptId = 'sf-marketing-top-actions-auth'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.type = 'module'
      script.src = '/scripts/top-actions-auth.js'
      document.head.appendChild(script)
    }

    return () => {
      document.body.classList.remove('sf-marketing-page')
    }
  }, [])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: glassPillSvgDefs() }} />
      <div className="global-launch-backdrop" aria-hidden="true">
        <canvas className="global-launch-backdrop__canvas" />
      </div>
      <nav className="top-actions" aria-label="Primary" dangerouslySetInnerHTML={{ __html: topActionsRightHtml }} />
      <div className={styles.logoBlock}>
        <a href="/" className={styles.logo} aria-label="SHIP FAST home">
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z" fill="url(#sfMarketingHomeBoltG1)" />
              <path d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z" stroke="url(#sfMarketingHomeBoltG2)" strokeWidth="2.2" strokeLinejoin="round" />
              <defs>
                <linearGradient id="sfMarketingHomeBoltG1" x1="11" y1="5" x2="42" y2="47" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#69f8ff" />
                  <stop offset="0.54" stopColor="#1ab8ff" />
                  <stop offset="1" stopColor="#6b3cff" />
                </linearGradient>
                <linearGradient id="sfMarketingHomeBoltG2" x1="8" y1="3" x2="44" y2="49" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#dffcff" />
                  <stop offset="1" stopColor="#31dfff" stopOpacity="0.15" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>SHIP FAST</span>
        </a>
      </div>

      {children}

      {footer && (
        <footer className="site-footer">
          <span className="footer-brand">SHIP FAST © {new Date().getFullYear()}</span>
          <nav className="footer-nav" aria-label="Footer links">
            <a href="/">Home</a>
            <a href="/pricing">Pricing</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
        </footer>
      )}
    </>
  )
}
