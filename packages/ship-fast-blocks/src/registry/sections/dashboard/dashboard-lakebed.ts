import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type DashboardOrderInput = {
  amount?: string
  customer?: string
  date?: string
  orderId?: string
  product?: string
  status?: string
  statusTone?: string
}

export type DashboardOrderTarget = {
  id: string
}

export type DashboardOrderStatusInput = DashboardOrderTarget & {
  status: string
  statusTone: string
}

const dashboard = createLakebedDefinition({
  orders: {
    ...table({
      amount: string().default(''),
      customer: string().default(''),
      date: string().default(''),
      orderId: string().default(''),
      product: string().default(''),
      status: string().default('Processing'),
      statusTone: string().default('sky'),
    }),
    seedFromProps: false,
  },
})

export const dashboardLakebed = {
  dataKey: 'DashboardWorkspace',
  schema: dashboard.schema,
  queries: {
    orders: dashboard.query((_ctx) =>
      _ctx.db.orders.orderBy('createdAt').all(),
    ),
    orderSummary: dashboard.query((_ctx) => {
      const orders = _ctx.db.orders.orderBy('createdAt').all()
      const current = orders.at(-1) ?? null

      return {
        count: orders.length,
        current,
        currentOrderId: current?.orderId ?? '',
      }
    }),
  },
  mutations: {
    addOrder: dashboard.mutation((_ctx, input: DashboardOrderInput) => {
      _ctx.db.orders.insert({
        amount: input.amount ?? '$0.00',
        customer: input.customer ?? 'New Customer',
        date: input.date ?? '',
        orderId: input.orderId ?? `#${Date.now()}`,
        product: input.product ?? 'Manual order',
        status: input.status ?? 'Processing',
        statusTone: input.statusTone ?? 'sky',
      })

      return _ctx.db.orders.orderBy('createdAt').all()
    }),
    removeOrder: dashboard.mutation((_ctx, input: DashboardOrderTarget) => {
      const order = _ctx.db.orders.get(input.id)
      if (order) _ctx.db.orders.delete(order.id)

      return _ctx.db.orders.orderBy('createdAt').all()
    }),
    setOrderStatus: dashboard.mutation(
      (_ctx, input: DashboardOrderStatusInput) => {
        const order = _ctx.db.orders.get(input.id)
        if (order) {
          _ctx.db.orders.update(order.id, {
            status: input.status,
            statusTone: input.statusTone,
          })
        }

        return _ctx.db.orders.orderBy('createdAt').all()
      },
    ),
  },
} as const
