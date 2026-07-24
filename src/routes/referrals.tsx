import { createFileRoute, notFound } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'

import { ReferralDashboard } from '@/features/referrals/components/ReferralDashboard'
import { MarketingShell } from '@/routes/pricing/-MarketingShell'
import '@/styles/referrals-page.css'

const ReferralsPage = () => {
  const { isLoaded, isSignedIn } = useAuth()
  if (isLoaded && !isSignedIn) throw notFound()
  if (!isLoaded) return null

  return (
    <MarketingShell footer>
      <ReferralDashboard />
    </MarketingShell>
  )
}

export const Route = createFileRoute('/referrals')({
  component: ReferralsPage,
})
