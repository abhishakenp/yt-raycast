import { createFileRoute } from '@tanstack/react-router'

import { MinePage } from '@/features/gallery/components/MinePage'

export const Route = createFileRoute('/mine')({
  component: MinePage,
})
