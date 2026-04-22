'use client'

import { dashboardBodyHtml } from './dashboard-body-html'

export function DashboardClient() {
  return <div dangerouslySetInnerHTML={{ __html: dashboardBodyHtml }} suppressHydrationWarning />
}
