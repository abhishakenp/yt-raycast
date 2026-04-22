'use client'

import { dashboardBody } from './dashboard-body'

export function DashboardClient() {
  return <div dangerouslySetInnerHTML={{ __html: dashboardBody }} suppressHydrationWarning />
}
