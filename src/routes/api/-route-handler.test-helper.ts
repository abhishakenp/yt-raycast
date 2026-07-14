type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function requireRecord(value: unknown, label: string): UnknownRecord {
  if (!isRecord(value)) throw new Error(`${label} must be an object`)
  return value
}

function isHandler(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

export async function callRouteHandler(
  route: unknown,
  method: string,
  args?: unknown,
): Promise<Response> {
  const routeRecord = requireRecord(route, 'route')
  const options = requireRecord(routeRecord.options, 'route options')
  const server = requireRecord(options.server, 'route server options')
  const handlers = requireRecord(server.handlers, 'route handlers')
  const handler = handlers[method]
  if (!isHandler(handler)) throw new Error(`${method} route handler is missing`)

  const result = args === undefined ? await handler() : await handler(args)
  if (!(result instanceof Response)) {
    throw new Error(`${method} route handler must return a Response`)
  }
  return result
}
