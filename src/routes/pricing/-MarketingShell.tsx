import { useEffect } from 'react'
import { LaunchBackdrop } from '@/components/launch-backdrop'
import { TopActions } from '@/components/TopActions'
import { GlassDefs } from '@/features/home/components/HomePage'
import styles from './MarketingShell.module.css'

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

    return () => {
      document.body.classList.remove('sf-marketing-page')
    }
  }, [])

  return (
    <>
      <GlassDefs />
      <LaunchBackdrop />
      <TopActions />
      <div className={styles.logoBlock}>
        <a href="/" className={styles.logo} aria-label="SHIP FAST home">
          <div className={styles.logoIcon}>
            <img
              src="/assets/logo-transparent.png"
              alt="Ship Fast Logo"
              aria-hidden="true"
            />
          </div>
          <span className={styles.logoText}>SHIP FAST</span>
        </a>
      </div>

      {children}

      {footer && (
        <footer className="site-footer">
          <span className="footer-brand">
            SHIP FAST © {new Date().getFullYear()}
          </span>
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
