import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createGuestAuthContext,
  toDisplayName,
  toGuestName,
  withAuthUser,
} from './auth-shared.ts'
import {
  boolean,
  createLakebedDefinition,
  createLakebedHandlerContext,
  endpoint,
  json,
  number,
  string,
  table,
} from './server.ts'

type MemoryStorage = Storage & {
  entries: Map<string, string>
}

function createMemoryStorage(): MemoryStorage {
  const entries = new Map<string, string>()
  return {
    entries,
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key) => entries.delete(key),
    setItem: (key, value) => entries.set(key, String(value)),
  } as MemoryStorage
}

function installBrowser(url = 'https://app.example.com/dashboard') {
  const parsed = new URL(url)
  const localStorage = createMemoryStorage()
  const sessionStorage = createMemoryStorage()
  const assign = vi.fn()
  const location = {
    assign,
    hash: parsed.hash,
    href: parsed.toString(),
    origin: parsed.origin,
    pathname: parsed.pathname,
    replace: vi.fn(),
    search: parsed.search,
  }
  vi.stubGlobal('window', {
    __LAKEBED_AUTH__: { shooBaseUrl: 'https://shoo.example.com' },
    __LAKEBED_BASE_PATH__: '',
    history: { replaceState: vi.fn() },
    localStorage,
    location,
    sessionStorage,
  })
  return { assign, localStorage, sessionStorage }
}

async function importAuth() {
  vi.resetModules()
  return import('./auth.tsx')
}

async function expectedPkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )
  return Buffer.from(new Uint8Array(digest))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

describe('lakebed behavioral', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('createLakebedDefinition', () => {
    it('creates a definition carrying schema, query and mutation builders', () => {
      const def = createLakebedDefinition({
        todos: table({
          text: string().default('untitled'),
          done: boolean().default(false),
          priority: number().default(0),
        }),
      })

      expect(def.schema).toBeDefined()
      expect(def.schema!.todos.kind).toBe('table')
      expect(def.schema!.todos.fields.text.kind).toBe('string')
      expect(def.schema!.todos.fields.done.kind).toBe('boolean')
      expect(def.schema!.todos.fields.priority.kind).toBe('number')
      expect(typeof def.query).toBe('function')
      expect(typeof def.mutation).toBe('function')

      const queryHandler = def.query(({ db }) => db.todos.all())
      expect(typeof queryHandler).toBe('function')
    })

    it('runs a query through a handler context and reads seeded rows', async () => {
      const def = createLakebedDefinition({
        todos: table({
          text: string(),
          done: boolean().default(false),
        }),
      })
      const handler = def.query(({ db }) => db.todos.where('done', false).all())
      const { context } = createLakebedHandlerContext({
        data: {
          todos: [
            {
              id: 't1',
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
              text: 'ship',
              done: false,
            },
          ],
        },
        props: {},
        schema: def.schema,
      })

      const rows = handler(context)
      expect(rows).toHaveLength(1)
      expect(rows[0].text).toBe('ship')
    })

    it('inserts a row through a writable mutation context and validates field types', async () => {
      const def = createLakebedDefinition({
        todos: table({
          text: string(),
          done: boolean().default(false),
          priority: number().default(0),
        }),
      })
      const handler = def.mutation(async (ctx, text) => {
        return ctx.db.todos.insert({ text, done: false, priority: 1 })
      })
      const { context } = createLakebedHandlerContext({
        data: { todos: [] },
        props: {},
        schema: def.schema,
        writable: true,
        setData: async () => ({ todos: [] }),
      })

      const row = await handler(context, 'write tests')
      expect(row.text).toBe('write tests')
      expect(row.priority).toBe(1)
      expect(row.id).toBeTruthy()

      await expect(handler(context, 123 as unknown as string)).rejects.toThrow(
        /Expected todos.text to be a string/,
      )
    })
  })

  describe('endpoint definitions', () => {
    it('endpoint() uppercases the method and keeps the path', () => {
      const ep = endpoint({ method: 'post', path: '/webhooks/stripe' }, () =>
        json({ ok: true }),
      )
      expect(ep.kind).toBe('endpoint')
      expect(ep.method).toBe('POST')
      expect(ep.path).toBe('/webhooks/stripe')
      expect(typeof ep.handler).toBe('function')
    })

    it('endpoint() handler returns a json response with the right content type', async () => {
      const ctx = {
        auth: createGuestAuthContext('local'),
        db: {},
        env: {},
        log: { error() {}, info() {}, warn() {} },
      }
      const ep = endpoint({ method: 'GET', path: '/health' }, () =>
        json({ status: 'ok' }),
      )
      const res = await ep.handler(ctx, {} as never)
      expect(res.kind).toBe('response')
      expect(res.status).toBe(200)
      expect(res.headers['Content-Type']).toContain('application/json')
      expect(JSON.parse(res.body)).toEqual({ status: 'ok' })
    })

    it('rejects invalid HTTP methods via the anonymous compiler diagnostics', async () => {
      const { createAnonymousArtifact } = await import('lakebed/anonymous')
      const tmp = await import('node:fs/promises')
      const path = await import('node:path')
      const os = await import('node:os')
      const clientFile = path.join(
        os.tmpdir(),
        `lakebed-client-${Date.now()}.js`,
      )
      await tmp.writeFile(clientFile, 'export default () => null;')
      const emptyStore = {
        listFiles: async () => [],
        readFile: async () => {
          throw new Error('no source files')
        },
      }

      const bad = endpoint({ method: 'invalid method', path: '/x' }, () =>
        json({}),
      )
      await expect(
        createAnonymousArtifact({
          app: { endpoints: { bad } },
          clientOut: clientFile,
          sourceStore: emptyStore,
        }),
      ).rejects.toMatchObject({
        name: 'AnonymousCompilerError',
        diagnostics: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('valid uppercase HTTP method'),
          }),
        ]),
      })
    })

    it('rejects reserved endpoint paths via the anonymous compiler diagnostics', async () => {
      const { createAnonymousArtifact } = await import('lakebed/anonymous')
      const tmp = await import('node:fs/promises')
      const path = await import('node:path')
      const os = await import('node:os')
      const clientFile = path.join(
        os.tmpdir(),
        `lakebed-client-${Date.now()}.js`,
      )
      await tmp.writeFile(clientFile, 'export default () => null;')
      const emptyStore = {
        listFiles: async () => [],
        readFile: async () => {
          throw new Error('no source files')
        },
      }

      const reserved = endpoint(
        { method: 'GET', path: '/__lakebed/internal' },
        () => json({}),
      )
      await expect(
        createAnonymousArtifact({
          app: { endpoints: { reserved } },
          clientOut: clientFile,
          sourceStore: emptyStore,
        }),
      ).rejects.toMatchObject({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('reserved by Lakebed'),
          }),
        ]),
      })
    })
  })

  describe('schema serialization', () => {
    it('string/boolean/number fields serialize with correct kinds and defaults', () => {
      const schema = {
        todos: table({
          text: string().default('untitled'),
          done: boolean().default(true),
          priority: number().default(5),
        }),
      }
      const def = createLakebedDefinition(schema)
      const fields = def.schema!.todos.fields

      expect(fields.text.kind).toBe('string')
      expect(fields.text.defaultValue).toBe('untitled')
      expect(fields.done.kind).toBe('boolean')
      expect(fields.done.defaultValue).toBe(true)
      expect(fields.priority.kind).toBe('number')
      expect(fields.priority.defaultValue).toBe(5)
    })

    it('insert applies field defaults for omitted fields', async () => {
      const def = createLakebedDefinition({
        todos: table({
          text: string().default('untitled'),
          done: boolean().default(false),
          priority: number().default(3),
        }),
      })
      const handler = def.mutation(async (ctx) => {
        return ctx.db.todos.insert({ text: 'x' })
      })
      const { context } = createLakebedHandlerContext({
        data: { todos: [] },
        props: {},
        schema: def.schema,
        writable: true,
      })
      const row = await handler(context)
      expect(row.text).toBe('x')
      expect(row.done).toBe(false)
      expect(row.priority).toBe(3)
    })

    it('updates and deletes rows inside writable mutation contexts', async () => {
      const def = createLakebedDefinition({
        todos: table({
          done: boolean().default(false),
          text: string(),
        }),
      })
      const handler = def.mutation(async (ctx, id: string) => {
        ctx.db.todos.update(id, { done: true })
        const updated = ctx.db.todos.get(id)
        ctx.db.todos.delete(id)
        return {
          remaining: ctx.db.todos.all(),
          updated,
        }
      })
      const { context } = createLakebedHandlerContext({
        data: {
          todos: [
            {
              createdAt: '2026-06-01T00:00:00.000Z',
              done: false,
              id: 'todo_1',
              text: 'publish',
              updatedAt: '2026-06-01T00:00:00.000Z',
            },
          ],
        },
        props: {},
        schema: def.schema,
        writable: true,
      })

      const result = await handler(context, 'todo_1')

      expect(result.updated).toMatchObject({
        done: true,
        id: 'todo_1',
        text: 'publish',
      })
      expect(result.updated?.updatedAt).not.toBe('2026-06-01T00:00:00.000Z')
      expect(result.remaining).toEqual([])
    })

    it('rejects table writes from read-only query contexts', () => {
      const def = createLakebedDefinition({
        todos: table({
          text: string(),
        }),
      })
      const handler = def.query((ctx) => {
        ctx.db.todos.insert({ text: 'mutated from query' })
      })
      const { context } = createLakebedHandlerContext({
        data: { todos: [] },
        props: {},
        schema: def.schema,
      })

      expect(() => handler(context)).toThrow(
        'Lakebed table "todos" cannot be changed from a query.',
      )
    })

    it('rejects unknown fields on insert', async () => {
      const def = createLakebedDefinition({
        todos: table({ text: string() }),
      })
      const handler = def.mutation(async (ctx) => {
        return ctx.db.todos.insert({
          text: 'x',
          bogus: 'nope',
        } as unknown as { text: string })
      })
      const { context } = createLakebedHandlerContext({
        data: { todos: [] },
        props: {},
        schema: def.schema,
        writable: true,
      })
      await expect(handler(context)).rejects.toThrow(
        /Unknown field for todos: bogus/,
      )
    })

    it('rejects direct setting of managed metadata fields', async () => {
      const def = createLakebedDefinition({
        todos: table({ text: string() }),
      })
      const handler = def.mutation(async (ctx) => {
        return ctx.db.todos.insert({
          text: 'x',
          id: 'hijack',
        } as unknown as { text: string })
      })
      const { context } = createLakebedHandlerContext({
        data: { todos: [] },
        props: {},
        schema: def.schema,
        writable: true,
      })
      await expect(handler(context)).rejects.toThrow(/Lakebed manages todos.id/)
    })
  })

  describe('PKCE flow', () => {
    it('signInWithGoogle generates a challenge that is the SHA-256 of the verifier', async () => {
      const { sessionStorage } = installBrowser()
      const auth = await importAuth()

      const { bundle, url } = await auth.signInWithGoogle({
        callbackPath: '/auth/callback',
        clientId: 'client-123',
        shooBaseUrl: 'https://shoo.example.com/',
      })

      expect(bundle.verifier).toMatch(/^[A-Za-z0-9-._~]{64}$/)
      expect(bundle.state).toMatch(/^[A-Za-z0-9-._~]{32}$/)
      expect(bundle.challenge).not.toBe(bundle.verifier)

      const expected = await expectedPkceChallenge(bundle.verifier)
      expect(bundle.challenge).toBe(expected)

      const parsed = new URL(url)
      expect(parsed.origin).toBe('https://shoo.example.com')
      expect(parsed.pathname).toBe('/authorize')
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256')
      expect(parsed.searchParams.get('code_challenge')).toBe(bundle.challenge)
      expect(parsed.searchParams.get('state')).toBe(bundle.state)
      expect(parsed.searchParams.get('client_id')).toBe('client-123')

      const stored = JSON.parse(
        sessionStorage.getItem('lakebed_google_pkce') ?? '{}',
      )
      expect(stored.verifier).toBe(bundle.verifier)
      expect(stored.state).toBe(bundle.state)
      expect(typeof stored.createdAt).toBe('number')
    })

    it('throws when called outside a browser environment', async () => {
      const auth = await importAuth()
      await expect(auth.signInWithGoogle()).rejects.toThrow(
        /requires a browser environment/,
      )
    })
  })

  describe('guest auth', () => {
    it('createGuestAuthContext builds a valid guest context with a normalized name', () => {
      const ctx = createGuestAuthContext('Preview User!!')
      expect(ctx.isGuest).toBe(true)
      expect(ctx.isAuthenticated).toBe(false)
      expect(ctx.provider).toBe('guest')
      expect(ctx.userId).toBe('guest:preview-user')
      expect(ctx.displayName).toBe('Preview User')
      expect(ctx.user.id).toBe('guest:preview-user')
      expect(ctx.user.isGuest).toBe(true)
    })

    it('toGuestName sanitizes and lowercases, falling back to "local"', () => {
      expect(toGuestName('guest: Ada Lovelace')).toBe('ada-lovelace')
      expect(toGuestName('Guest: Ada Lovelace')).toBe('guest-ada-lovelace')
      expect(toGuestName('   ')).toBe('local')
      expect(toGuestName(null)).toBe('local')
    })

    it('toDisplayName title-cases each sanitized part', () => {
      expect(toDisplayName('ada_grace')).toBe('Ada Grace')
      expect(toDisplayName('lloyd-wright')).toBe('Lloyd Wright')
    })

    it('withAuthUser attaches a user object mirroring auth fields', () => {
      const ctx = withAuthUser({
        displayName: 'Ada',
        isAuthenticated: true,
        isGuest: false,
        provider: 'google',
        userId: 'google:1',
        email: 'ada@example.com',
        emailVerified: true,
      })
      expect(ctx.user.userId).toBe('google:1')
      expect(ctx.user.email).toBe('ada@example.com')
      expect(ctx.user.provider).toBe('google')
      expect(ctx.user.displayName).toBe('Ada')
    })
  })
})
