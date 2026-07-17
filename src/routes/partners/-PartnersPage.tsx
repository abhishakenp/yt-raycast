import { PartnerPortal } from '@/features/partners/components/PartnerPortal'
import { MarketingShell } from '@/routes/pricing/-MarketingShell'

export function PartnersPage(): React.ReactNode {
  return (
    <MarketingShell footer>
      <PartnerPortal />
    </MarketingShell>
  )
}
