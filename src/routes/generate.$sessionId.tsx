import { createFileRoute } from '@tanstack/react-router'

import { WorkspacePage } from '@/features/workspace/components/WorkspacePage'

const GenerateRoute = () => {
  const { sessionId } = Route.useParams()

  return <WorkspacePage sessionId={sessionId} />
}

export const Route = createFileRoute('/generate/$sessionId')({
  component: GenerateRoute,
})
