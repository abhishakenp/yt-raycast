import { useEffect, useRef } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { TopActions } from '@/components/TopActions'
import { GlassDefs } from '@/features/home/components/GlassPill'
import { isPartnerProgramClientEnabled } from '@/features/partners/lib/partner-config'
import styles from './MarketingShell.module.css'

const MARKETING_SHELL_PREWARM_DELAY_MS = 700
const MARKETING_SHELL_PREWARM_IDLE_TIMEOUT_MS = 1400

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

export function MarketingShell({
  children,
  footer = false,
}: {
  children: React.ReactNode
  footer?: boolean
}) {
  const router = useRouter()
  const routerRef = useRef(router)
  const partnersEnabled = isPartnerProgramClientEnabled()

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.body.classList.add('sf-marketing-page')

    return () => {
      document.body.classList.remove('sf-marketing-page')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const idleWindow = window as IdleWindow
    let cancelled = false
    let didPrewarm = false
    let idleHandle: number | undefined
    let idleHandleUsesIdleCallback = false

    const prewarmInternalDestinations = () => {
      if (cancelled || didPrewarm) return
      didPrewarm = true

      void routerRef.current.preloadRoute({ to: '/' }).catch(() => undefined)
      void routerRef.current
        .preloadRoute({ to: '/pricing' })
        .catch(() => undefined)
      void import('@/routes/index')
      void import('@/features/home/components/HomePage')
      void import('@/features/gallery/components/PublicGallery')
      void import('@/routes/pricing')
      void import('@/routes/pricing/-PricingPage')
      void import('@/routes/pricing/-MarketingShell')

      const homeRocket = new Image()
      homeRocket.decoding = 'async'
      homeRocket.src = '/assets/rocket-transparent.png'

      if ('fonts' in document) {
        void document.fonts.ready.then(() =>
          Promise.all([
            document.fonts.load('1em Archivo Black'),
            document.fonts.load('1em JetBrains Mono'),
          ]),
        )
      }
    }

    const delayHandle = window.setTimeout(() => {
      if (cancelled) return
      if (idleWindow.requestIdleCallback) {
        idleHandleUsesIdleCallback = true
        idleHandle = idleWindow.requestIdleCallback(
          prewarmInternalDestinations,
          {
            timeout: MARKETING_SHELL_PREWARM_IDLE_TIMEOUT_MS,
          },
        )
        return
      }

      idleHandleUsesIdleCallback = false
      idleHandle = window.setTimeout(
        prewarmInternalDestinations,
        MARKETING_SHELL_PREWARM_IDLE_TIMEOUT_MS,
      )
    }, MARKETING_SHELL_PREWARM_DELAY_MS)

    return () => {
      cancelled = true
      window.clearTimeout(delayHandle)
      if (idleHandle === undefined) return
      if (idleHandleUsesIdleCallback && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle)
      } else {
        window.clearTimeout(idleHandle)
      }
    }
  }, [])

  return (
    <>
      <GlassDefs />
      <TopActions />
      <div className={styles.logoBlock}>
        <Link
          to="/"
          preload="intent"
          className={styles.logo}
          aria-label="SHIP FAST home"
        >
          <div className={styles.logoIcon}>
            <img
              src="/assets/logo-transparent.png"
              alt="Ship Fast Logo"
              aria-hidden="true"
            />
          </div>
          <span className={styles.logoText}>SHIP FAST</span>
        </Link>
      </div>

      {children}

      {footer && (
        <footer className="site-footer">
          <span className="footer-brand">
            SHIP FAST © {new Date().getFullYear()}
          </span>
          <nav className="footer-nav" aria-label="Footer links">
            <Link to="/" preload="intent">
              Home
            </Link>
            <Link to="/pricing" preload="intent">
              Pricing
            </Link>
            <Link to="/referrals" preload="intent">
              Referrals
            </Link>
            {partnersEnabled ? (
              <Link to="/partners" preload="intent">
                Partners
              </Link>
            ) : null}
            <Link to="/privacy" preload="intent">
              Privacy
            </Link>
            <Link to="/terms" preload="intent">
              Terms
            </Link>
          </nav>
        </footer>
      )}
    </>
  )
}
