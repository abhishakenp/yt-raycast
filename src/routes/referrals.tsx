import { createFileRoute } from '@tanstack/react-router'

import { ReferralDashboard } from '@/features/referrals/components/ReferralDashboard'

const ReferralsPage = () => (
  <main className="min-h-screen bg-[#06070d] text-white">
    <ReferralDashboard />
  </main>
)

export const Route = createFileRoute('/referrals')({
  component: ReferralsPage,
})
