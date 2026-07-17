import { useReferralCapture } from '@/features/referrals/hooks/useReferralCapture'
import { useDubAttributionCapture } from '@/features/partners/hooks/useDubAttributionCapture'

export function useAcquisitionCapture(): void {
  useReferralCapture()
  useDubAttributionCapture()
}
