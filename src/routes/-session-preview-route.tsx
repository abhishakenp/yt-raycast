import { getRouteApi } from '@tanstack/react-router'

import { SessionPreviewPage } from '@/features/dashboard/components/SessionPreviewPage'

const previewRouteApi = getRouteApi('/preview/$slug')

export const PreviewRoute = () => {
  const { slug } = previewRouteApi.useParams()

  return <SessionPreviewPage sessionId={slug} />
}
