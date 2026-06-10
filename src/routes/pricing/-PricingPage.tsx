import { useEffect } from 'react'
import { MarketingShell } from './-MarketingShell'
import { PRICING_PAGE_MAIN_HTML } from './-pricing-main-html'

export const PricingPage = () => {
  useEffect(() => {
    const tick = () => {
      const countdown = document.getElementById('countdown-text')
      if (countdown) countdown.textContent = 'Early adopter slots still open'
    }

    tick()
    const interval = window.setInterval(tick, 30000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <MarketingShell footer>
      <div dangerouslySetInnerHTML={{ __html: PRICING_PAGE_MAIN_HTML }} />
    </MarketingShell>
  )
}
