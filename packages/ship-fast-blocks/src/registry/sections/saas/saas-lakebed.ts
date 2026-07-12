import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type SaasPlanInput = {
  name: string
  price?: string
  period?: string
  summary?: string
}

export type SaasIntentInput = {
  label: string
  plan?: string
  source?: string
}

export type SaasAuthSessionInput = {
  displayName?: string
  email: string
  provider?: string
}

function normalizeLabel(label: string) {
  return label.trim() || 'Workspace'
}
function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

const saas = createLakebedDefinition({
  authSessions: {
    ...table({
      displayName: string().default(''),
      email: string(),
      provider: string().default('Shoo'),
      signedInAt: string(),
    }),
    seedFromProps: false,
  },
  intents: {
    ...table({
      label: string(),
      plan: string().default(''),
      source: string().default(''),
      type: string().default('trial'),
    }),
    seedFromProps: false,
  },
  plans: table({
    name: string(),
    period: string().default(''),
    price: string().default(''),
    summary: string().default(''),
  }),
})

export const saasLakebed = {
  dataKey: 'SoftwareWorkspace',
  schema: saas.schema,
  queries: {
    planCatalog: saas.query((_ctx) =>
      _ctx.db.plans.orderBy('updatedAt', 'desc').all(),
    ),
    conversionSummary: saas.query((_ctx) => {
      const intents = _ctx.db.intents.orderBy('createdAt').all()
      const current = intents.at(-1) ?? null

      return {
        current,
        currentLabel: current?.label ?? '',
        currentPlan: current?.plan ?? '',
        intents,
        total: intents.length,
      }
    }),
    authSessionSummary: saas.query((_ctx) => {
      const sessions = _ctx.db.authSessions.orderBy('signedInAt', 'desc').all()

      return {
        count: sessions.length,
        lastSession: sessions.at(0) ?? null,
        sessions,
      }
    }),
  },
  mutations: {
    clearAuthSessions: saas.mutation((_ctx) => {
      for (const session of _ctx.db.authSessions.all()) {
        _ctx.db.authSessions.delete(session.id)
      }

      return []
    }),
    recordAuthSession: saas.mutation((_ctx, input) => {
      const email = normalizeEmail(input.email)
      if (!email)
        return _ctx.db.authSessions.orderBy('signedInAt', 'desc').all()

      const provider = input.provider?.trim() || 'Shoo'
      const existing =
        _ctx.db.authSessions
          .all()
          .find(
            (session) =>
              session.email === email && session.provider === provider,
          ) ?? null
      const next = {
        displayName: input.displayName?.trim() ?? '',
        email,
        provider,
        signedInAt: new Date().toISOString(),
      }

      if (existing) {
        _ctx.db.authSessions.update(existing.id, next)
      } else {
        _ctx.db.authSessions.insert(next)
      }

      return _ctx.db.authSessions.orderBy('signedInAt', 'desc').all()
    }),
    requestDemo: saas.mutation((_ctx, input) => {
      const label = normalizeLabel(input.label)
      _ctx.db.intents.insert({
        label,
        plan: input.plan ?? '',
        source: input.source ?? '',
        type: 'demo',
      })

      return _ctx.db.intents.orderBy('createdAt').all()
    }),
    selectPlan: saas.mutation((_ctx, input) => {
      const label = normalizeLabel(input.label)
      _ctx.db.intents.insert({
        label,
        plan: input.plan ?? label,
        source: input.source ?? '',
        type: 'trial',
      })

      return _ctx.db.intents.orderBy('createdAt').all()
    }),
    syncPlans: saas.mutation((_ctx, input) => {
      for (const plan of input.plans) {
        const name = plan.name.trim()
        if (!name) continue

        const existing = _ctx.db.plans.where('name', name).all().at(0)
        const next = {
          name,
          period: plan.period ?? '',
          price: plan.price ?? '',
          summary: plan.summary ?? '',
        }

        if (existing) {
          _ctx.db.plans.update(existing.id, next)
        } else {
          _ctx.db.plans.insert(next)
        }
      }

      return _ctx.db.plans.orderBy('updatedAt', 'desc').all()
    }),
  },
}
