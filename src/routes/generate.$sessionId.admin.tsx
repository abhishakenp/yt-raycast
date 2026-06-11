import { createFileRoute } from '@tanstack/react-router'

import { Dashboard } from '@/features/dashboard/components/Dashboard'

const GenerateAdminRoute = () => {
  const { sessionId } = Route.useParams()

  return <Dashboard sessionId={sessionId} initialAdminView />
}

export const Route = createFileRoute('/generate/$sessionId/admin')({
  component: GenerateAdminRoute,
})

