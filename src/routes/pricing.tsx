import { createFileRoute } from '@tanstack/react-router'

import { PricingPage } from './pricing/-PricingPage'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})
