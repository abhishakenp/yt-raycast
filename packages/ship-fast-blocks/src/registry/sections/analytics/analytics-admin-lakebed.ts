import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type AnalyticsNotificationInput = {
  message: string
  read?: string
  type?: string
}

export type AnalyticsNotificationTarget = {
  id: string
}

export type AnalyticsActionInput = {
  label: string
  query?: string
  source?: string
}

const analyticsAdmin = createLakebedDefinition({
  actions: {
    ...table({
      label: string(),
      query: string().default(''),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  notifications: {
    ...table({
      message: string(),
      read: string().default('false'),
      type: string().default('info'),
    }),
    seedFromProps: false,
  },
})

export const analyticsAdminLakebed = {
  dataKey: 'AnalyticsAdminWorkspace',
  schema: analyticsAdmin.schema,
  queries: {
    actionSummary: analyticsAdmin.query((_ctx) => {
      const actions = _ctx.db.actions.orderBy('createdAt').all()
      const current = actions.at(-1) ?? null

      return {
        actions,
        current,
        currentLabel: current?.label ?? '',
        currentQuery: current?.query ?? '',
        total: actions.length,
      }
    }),
    notifications: analyticsAdmin.query((_ctx) =>
      _ctx.db.notifications.orderBy('createdAt').all(),
    ),
    unreadNotificationCount: analyticsAdmin.query(
      (_ctx) => _ctx.db.notifications.where('read', 'false').all().length,
    ),
  },
  mutations: {
    clearAllNotifications: analyticsAdmin.mutation((_ctx) => {
      for (const item of _ctx.db.notifications.all()) {
        _ctx.db.notifications.delete(item.id)
      }

      return []
    }),
    markNotificationRead: analyticsAdmin.mutation((_ctx, input: AnalyticsNotificationTarget) => {
      const notification = _ctx.db.notifications.get(input.id)
      if (notification) {
        _ctx.db.notifications.update(notification.id, { read: 'true' })
      }

      return _ctx.db.notifications.orderBy('createdAt').all()
    }),
    recordAction: analyticsAdmin.mutation((_ctx, input: AnalyticsActionInput) => {
      _ctx.db.actions.insert({
        label: input.label,
        query: input.query ?? '',
        source: input.source ?? '',
      })

      return _ctx.db.actions.orderBy('createdAt').all()
    }),
    syncNotifications: analyticsAdmin.mutation((_ctx, input: { notifications: AnalyticsNotificationInput[] }) => {
      for (const notification of input.notifications) {
        const message = notification.message.trim()
        if (!message) continue

        const existing = _ctx.db.notifications
          .where('message', message)
          .all()
          .at(0)
        const next = {
          message,
          read: notification.read ?? 'false',
          type: notification.type ?? 'info',
        }

        if (existing) {
          _ctx.db.notifications.update(existing.id, next)
        } else {
          _ctx.db.notifications.insert(next)
        }
      }

      return _ctx.db.notifications.orderBy('createdAt').all()
    }),
  },
} as const

export type AnalyticsNotificationRecord = {
  createdAt: string
  id: string
  message: string
  read: string
  type: string
}
