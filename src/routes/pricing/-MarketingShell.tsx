import { glassPillAnchorHtml, glassPillSvgDefs } from '@/lib/glass-pill-html'
import { useEffect } from 'react'
import { LaunchBackdrop } from '@/components/launch-backdrop'

const topActionsRightHtml = `<div class="pointer-events-auto ml-auto flex items-center gap-2">
      ${glassPillAnchorHtml({ className: 'min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[var(--text-primary,#f0f0f5)] [&>span:last-child]:gap-1.5', href: '/pricing', html: 'Pricing' })}
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

    return () => {
      document.body.classList.remove('sf-marketing-page')
    }
  }, [])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: glassPillSvgDefs() }} />
      <LaunchBackdrop />
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-[210] flex items-center justify-start gap-2 bg-transparent px-[var(--top-actions-inset-inline)] py-[var(--top-actions-inset-block)]" aria-label="Primary" dangerouslySetInnerHTML={{ __html: topActionsRightHtml }} />
      <div className="pointer-events-auto fixed top-[34px] left-[clamp(28px,4.5vw,72px)] z-[209] mb-0 w-auto items-start">
        <a href="/" className="flex items-center gap-[13px] text-inherit no-underline" aria-label="SHIP FAST home">
          <div className="size-[39px] text-[#26e7ff] drop-shadow-[0_0_18px_rgba(38,231,255,0.58)] [&_svg]:block [&_svg]:size-full">
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
          <span className="bg-[linear-gradient(135deg,#ffffff_0%,#dffbff_46%,#23e5ff_100%)] bg-[length:180%_180%] bg-clip-text font-sans text-[31px] font-extrabold tracking-[-0.055em] text-transparent [-webkit-text-fill-color:transparent]">SHIP FAST</span>
        </a>
      </div>

      {children}

      {footer && (
        <footer className="relative z-[1] mx-auto mt-[-56px] mb-8 flex w-[min(760px,calc(100%-48px))] flex-wrap items-center justify-between gap-5 rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-7 py-[22px] shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] max-[720px]:w-[min(100%,calc(100%-32px))] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
          <span className="font-mono text-[13px] tracking-[0.12em] text-[#97a0b0]">SHIP FAST © {new Date().getFullYear()}</span>
          <nav className="flex flex-wrap items-center gap-5 [&_a]:text-[13px] [&_a]:text-[#97a0b0] [&_a]:transition-colors hover:[&_a]:text-[#EDEDEF]" aria-label="Footer links">
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
