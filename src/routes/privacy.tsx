import { createFileRoute } from '@tanstack/react-router'

import { PrivacyPage } from './privacy/-PrivacyPage'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})
