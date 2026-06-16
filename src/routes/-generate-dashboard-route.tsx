import { getRouteApi } from '@tanstack/react-router'

import { Dashboard } from '@/features/dashboard/components/Dashboard'

const generateRouteApi = getRouteApi('/generate/$sessionId')
const generateAdminRouteApi = getRouteApi('/generate/$sessionId/admin')

export const GenerateRoute = () => {
  const { sessionId } = generateRouteApi.useParams()

  return <Dashboard sessionId={sessionId} />
}

export const GenerateAdminRoute = () => {
  const { sessionId } = generateAdminRouteApi.useParams()

  return <Dashboard sessionId={sessionId} initialAdminView />
}
