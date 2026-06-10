import { createFileRoute } from '@tanstack/react-router'

import { Dashboard } from '@/features/dashboard/components/Dashboard'

const GenerateRoute = () => {
  const { sessionId } = Route.useParams()

  return <Dashboard sessionId={sessionId} />
}

export const Route = createFileRoute('/generate/$sessionId')({
  component: GenerateRoute,
})
