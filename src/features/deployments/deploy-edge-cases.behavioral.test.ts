import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { JSDOM } from 'jsdom'

import {
  AnonymousCompilerError,
  sha256,
  validateAnonymousDeployPayload,
} from 'lakebed/anonymous'
import { LAKEBED_DEPLOY_API_URL } from 'lakebed/release'

// Wrap the real esbuild.build so we can assert on the bundling configuration
// (platform / jsx) while still performing a real bundle. Recording via
// globalThis avoids the vi.mock hoisting TDZ for local bindings.
vi.mock('esbuild', async () => {
  const actual = await vi.importActual<typeof import('esbuild')>('esbuild')
  return {
    ...actual,
    build: async (options: import('esbuild').BuildOptions) => {
      ;(
        globalThis as { __esbuildBuildCalls?: import('esbuild').BuildOptions[] }
      ).__esbuildBuildCalls ??= []
      ;(
        globalThis as { __esbuildBuildCalls?: import('esbuild').BuildOptions[] }
      ).__esbuildBuildCalls!.push(options)
      return actual.build(options)
    },
  }
})

import {
  buildLakebedAnonymousDeployRequest,
  deployLakebedProjectFiles,
} from './server/lakebed-deploy-service'
import { build } from 'esbuild'
import { buildStaticLakebedProjectFiles } from './server/lakebed-static-project-builder'
import { createLakebedPublishResponse } from './server/lakebed-publish-response'
import * as github from '../../../convex/github'

const esbuildCalls = () =>
  (globalThis as { __esbuildBuildCalls?: import('esbuild').BuildOptions[] })
    .__esbuildBuildCalls ?? []

const lakebedRoot = () => join(process.cwd(), '.lakebed')

const writeProjectFiles = async (
  directory: string,
  files: Record<string, string>,
) => {
  for (const [path, source] of Object.entries(files)) {
    const absolutePath = join(directory, path)
    await mkdir(join(absolutePath, '..'), { recursive: true })
    await writeFile(absolutePath, source)
  }
}

const renderStaticProjectClient = async (files: Record<string, string>) => {
  const directory = await mkdtemp(join(tmpdir(), 'static-lakebed-client-'))

  try {
    await writeProjectFiles(directory, files)
    const entryPath = join(directory, 'render-static-client.tsx')
    await writeFile(
      entryPath,
      `import { h, render } from "preact";
import { App } from "./client/index";

render(h(App, {}), document.getElementById("app"));
`,
    )
    const bundled = await build({
      bundle: true,
      entryPoints: [entryPath],
      format: 'iife',
      jsx: 'automatic',
      jsxImportSource: 'preact',
      logLevel: 'silent',
      nodePaths: [join(process.cwd(), 'node_modules')],
      platform: 'browser',
      write: false,
    })
    const dom = new JSDOM('<div id="app"></div>', {
      runScripts: 'outside-only',
      url: 'https://example.test/',
    })
    const errors: unknown[] = []
    dom.window.addEventListener('error', (event: ErrorEvent) => {
      errors.push(event.error ?? event.message)
    })
    dom.window.eval(bundled.outputFiles[0]?.text ?? '')
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    return {
      errors,
      iframe: dom.window.document.querySelector('iframe'),
    }
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
}

const loadAnonymousDeployServerCapsule = async (
  files: Record<string, string>,
) => {
  const deployRequest = await buildLakebedAnonymousDeployRequest(files)
  const payload = JSON.parse(deployRequest.requestBody) as {
    artifact?: {
      server?: {
        source?: {
          bundle?: string
        }
      }
    }
  }
  const bundle = payload.artifact?.server?.source?.bundle
  expect(typeof bundle).toBe('string')
  const mod = (await import(`data:text/javascript;base64,${bundle}`)) as {
    default?: {
      name?: string
      endpoints?: Record<
        string,
        {
          handler?: () => unknown
          method?: string
          path?: string
        }
      >
    }
  }
  return mod.default
}

// ---------------------------------------------------------------------------
// Shared source fixtures
// ---------------------------------------------------------------------------

const validServerSource = `import { capsule, query, string, boolean, table } from "lakebed/server";

const schema = {
  notes: table({
    title: string(),
    active: boolean(),
  }),
};

export default capsule({
  name: "Edge Case Test",
  schema,
  queries: {
    list: query((ctx) => ctx.db.notes.all()),
  },
  mutations: {},
});
`

const validClientSource = `export function App() {
  return <main><h1>Edge Case</h1></main>;
}
`

const validSharedSource = `export const title = "Edge Case";
`

const validFiles = (): Record<string, string> => ({
  'server/index.ts': validServerSource,
  'client/index.tsx': validClientSource,
  'shared/content.ts': validSharedSource,
})

// Server source that embeds a forbidden token inside an uncalled function so
// esbuild can still bundle it (the token is present in source for the scanner).
const serverWithForbidden = (token: string): string =>
  `import { capsule, query, string, table } from "lakebed/server";

function __forbiddenEdgeCase() {
  ${token}
}

export default capsule({
  name: "Forbidden Edge",
  schema: { notes: table({ title: string() }) },
  queries: { list: query((ctx) => ctx.db.notes.all()) },
  mutations: {},
});
`

// ---------------------------------------------------------------------------
// Lakebed deploy service
// ---------------------------------------------------------------------------

describe('Lakebed deploy service', () => {
  beforeEach(async () => {
    ;(
      globalThis as { __esbuildBuildCalls?: import('esbuild').BuildOptions[] }
    ).__esbuildBuildCalls = []
    await rm(lakebedRoot(), { recursive: true, force: true })
  })
  afterEach(async () => {
    ;(
      globalThis as { __esbuildBuildCalls?: import('esbuild').BuildOptions[] }
    ).__esbuildBuildCalls = undefined
    await rm(lakebedRoot(), { recursive: true, force: true })
  })

  describe('esbuild bundling configuration', () => {
    it('client bundle targets the Browser platform with Preact automatic JSX', async () => {
      await buildLakebedAnonymousDeployRequest(validFiles())
      const calls = esbuildCalls()
      const clientCall = calls.find((c) => c.platform === 'browser')
      expect(clientCall).toBeDefined()
      expect(clientCall!.platform).toBe('browser')
      expect(clientCall!.jsx).toBe('automatic')
      expect(clientCall!.jsxImportSource).toBe('preact')
      expect(clientCall!.entryPoints).toEqual(['__lakebed/client-entry.tsx'])
      expect(clientCall!.format).toBe('esm')
      expect(clientCall!.minify).toBe(true)
      expect(clientCall!.write).toBe(false)
    })

    it('server bundle targets the Node platform with Preact automatic JSX', async () => {
      await buildLakebedAnonymousDeployRequest(validFiles())
      const calls = esbuildCalls()
      const serverCall = calls.find((c) => c.platform === 'node')
      expect(serverCall).toBeDefined()
      expect(serverCall!.platform).toBe('node')
      expect(serverCall!.jsx).toBe('automatic')
      expect(serverCall!.jsxImportSource).toBe('preact')
      expect(serverCall!.entryPoints).toEqual(['server/index.ts'])
      expect(serverCall!.format).toBe('esm')
      expect(serverCall!.minify).toBe(true)
      expect(serverCall!.write).toBe(false)
    })
  })

  describe('forbidden source validation', () => {
    it('rejects source containing eval()', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': serverWithForbidden('eval("1 + 2");'),
        }),
      ).rejects.toThrow()
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': serverWithForbidden('eval("1 + 2");'),
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects source containing fetch', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': serverWithForbidden(
            'fetch("https://example.test");',
          ),
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects source containing a while loop', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': serverWithForbidden('while (true) { break; }'),
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects source referencing process', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': serverWithForbidden('return process.env.SECRET;'),
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects source containing async handlers', async () => {
      // EXPECTED behavior: async server handlers are not part of the anonymous
      // IR and MUST be rejected. If the deploy service allows async, that is a
      // BUG — this test MUST fail until the service stops passing allowAsync.
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, query, string, table } from "lakebed/server";

const schema = { notes: table({ title: string() }) };

async function __asyncEdge() {
  return 42;
}

export default capsule({
  name: "Async Rejected",
  schema,
  queries: { list: query((ctx) => ctx.db.notes.all()) },
  mutations: {},
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects forbidden tokens in shared/ files, not only server/', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'shared/content.ts': `export const x = () => { while (true) { break; } };\nexport const title = "Edge";\n`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })
  })

  describe('schema serialization', () => {
    it('serializes string and boolean fields', async () => {
      const result = await buildLakebedAnonymousDeployRequest(validFiles())
      expect(result.artifact.server.schema).toMatchObject({
        notes: {
          kind: 'table',
          fields: {
            title: { kind: 'string', defaultValue: undefined },
            active: { kind: 'boolean', defaultValue: undefined },
          },
        },
      })
    })

    it('rejects a number field kind', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, query, table } from "lakebed/server";

export default capsule({
  name: "Bad Number",
  schema: { notes: { kind: "table", fields: { count: { kind: "number" } } } },
  queries: {},
  mutations: {},
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects an unknown field kind', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, table } from "lakebed/server";

export default capsule({
  name: "Bad Unknown",
  schema: { notes: { kind: "table", fields: { data: { kind: "json" } } } },
  queries: {},
  mutations: {},
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects a schema entry that is not a table()', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule } from "lakebed/server";

export default capsule({
  name: "Bad Table",
  schema: { notes: { kind: "view", fields: {} } },
  queries: {},
  mutations: {},
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })
  })

  describe('endpoint validation', () => {
    it('accepts a valid method and path', async () => {
      const result = await buildLakebedAnonymousDeployRequest({
        ...validFiles(),
        'server/index.ts': `import { capsule, query, string, table, endpoint, text } from "lakebed/server";

export default capsule({
  name: "Valid Endpoint",
  schema: { notes: table({ title: string() }) },
  queries: { list: query((ctx) => ctx.db.notes.all()) },
  mutations: {},
  endpoints: {
    stripe: endpoint({ method: "POST", path: "/webhooks/stripe" }, () => text("ok")),
  },
});
`,
      })
      expect(result.artifact.server.endpoints).toMatchObject({
        stripe: { method: 'POST', op: 'source', path: '/webhooks/stripe' },
      })
    })

    it('rejects an invalid HTTP method', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, string, table, endpoint, text } from "lakebed/server";

export default capsule({
  name: "Bad Method",
  schema: { notes: table({ title: string() }) },
  queries: {},
  mutations: {},
  endpoints: {
    bad: endpoint({ method: "INVALID METHOD", path: "/ok" }, () => text("ok")),
  },
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects a reserved Lakebed path (/auth/callback)', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, string, table, endpoint, text } from "lakebed/server";

export default capsule({
  name: "Reserved Path",
  schema: { notes: table({ title: string() }) },
  queries: {},
  mutations: {},
  endpoints: {
    cb: endpoint({ method: "GET", path: "/auth/callback" }, () => text("ok")),
  },
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects the reserved admin path /admin', async () => {
      // EXPECTED behavior: /admin is a reserved Lakebed path and MUST be
      // rejected for user-defined endpoints. If /admin is not reserved, that
      // is a BUG — this test MUST fail until isReservedEndpointPath covers it.
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, string, table, endpoint, text } from "lakebed/server";

export default capsule({
  name: "Admin Reserved",
  schema: { notes: table({ title: string() }) },
  queries: {},
  mutations: {},
  endpoints: {
    admin: endpoint({ method: "GET", path: "/admin" }, () => text("ok")),
  },
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })

    it('rejects a path that does not start with /', async () => {
      await expect(
        buildLakebedAnonymousDeployRequest({
          ...validFiles(),
          'server/index.ts': `import { capsule, string, table, endpoint, text } from "lakebed/server";

export default capsule({
  name: "Bad Path",
  schema: { notes: table({ title: string() }) },
  queries: {},
  mutations: {},
  endpoints: {
    bad: endpoint({ method: "GET", path: "relative" }, () => text("ok")),
  },
});
`,
        }),
      ).rejects.toBeInstanceOf(AnonymousCompilerError)
    })
  })

  describe('source file hashing', () => {
    it('produces the same hash for identical content', () => {
      const content = 'export const x = 1;\n'
      expect(sha256(content)).toBe(sha256(content))
    })

    it('produces different hashes for different content', () => {
      expect(sha256('export const x = 1;\n')).not.toBe(
        sha256('export const x = 2;\n'),
      )
    })

    it('hashes a Buffer identically to the same string bytes', () => {
      const content = 'hello lakebed'
      expect(sha256(Buffer.from(content))).toBe(sha256(content))
    })
  })

  describe('anonymous deploy payload validation', () => {
    it('accepts a valid payload produced by the build pipeline', async () => {
      const built = await buildLakebedAnonymousDeployRequest(validFiles())
      const payload = JSON.parse(built.requestBody)
      const validated = validateAnonymousDeployPayload(payload)
      expect(validated.artifact.deployTarget).toBe('anonymous-source')
      expect(validated.clientBundleHash).toBe(built.clientBundleHash)
      expect(validated.artifactHash).toBe(built.artifactHash)
    })

    it('rejects a null payload', () => {
      expect(() => validateAnonymousDeployPayload(null)).toThrow()
    })

    it('rejects a payload missing the artifact', () => {
      expect(() => validateAnonymousDeployPayload({})).toThrow()
    })

    it('rejects a payload with a mismatched client bundle hash', async () => {
      const built = await buildLakebedAnonymousDeployRequest(validFiles())
      const payload = JSON.parse(built.requestBody) as Record<string, unknown>
      const artifact = payload.artifact as Record<
        string,
        Record<string, unknown>
      >
      artifact.client = { ...artifact.client, bundleHash: 'tampered' }
      expect(() => validateAnonymousDeployPayload(payload)).toThrow()
    })
  })

  describe('Lakebed API URL resolution', () => {
    it('builds the deploy URL from a custom HTTPS origin', async () => {
      const requests: Array<{ url: string }> = []
      const fetchImpl = (async (url: RequestInfo | URL) => {
        requests.push({ url: String(url) })
        return new Response(
          JSON.stringify({ deployId: 'd1', url: 'https://site.lakebed.app' }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }) as typeof fetch

      await deployLakebedProjectFiles({
        api: 'https://deploy.example.test',
        fetchImpl,
        files: validFiles(),
      })

      expect(requests[0]?.url).toBe(
        'https://deploy.example.test/v1/anonymous-deploys',
      )
    })

    it('rewrites the canonical api.lakebed.app origin to the release deploy URL', async () => {
      const requests: Array<{ url: string }> = []
      const fetchImpl = (async (url: RequestInfo | URL) => {
        requests.push({ url: String(url) })
        return new Response(
          JSON.stringify({ deployId: 'd2', url: 'https://site.lakebed.app' }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }) as typeof fetch

      await deployLakebedProjectFiles({
        api: 'https://api.lakebed.app',
        fetchImpl,
        files: validFiles(),
      })

      expect(requests[0]?.url).toBe(
        `${LAKEBED_DEPLOY_API_URL}/v1/anonymous-deploys`,
      )
      expect(LAKEBED_DEPLOY_API_URL).not.toBe('https://api.lakebed.app')
    })

    it('rejects an API origin with credentials or a path', async () => {
      await expect(
        deployLakebedProjectFiles({
          api: 'https://user:pass@api.lakebed.app/path',
          fetchImpl: (async () => new Response('{}')) as typeof fetch,
          files: validFiles(),
        }),
      ).rejects.toThrow(/Invalid Lakebed API origin/)
    })
  })
})

// ---------------------------------------------------------------------------
// Lakebed static project builder
// ---------------------------------------------------------------------------

describe('Lakebed static project builder', () => {
  describe('preview image rewrite', () => {
    it('rewrites a Pexels preview image API URL to a Picsum fallback URL', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Images</title></head><body><img alt="Max the dog" src="/api/pexels?query=max-the-dog&w=800&h=600"></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).toContain('https://picsum.photos/seed/')
      expect(preview).not.toContain('/api/pexels')
    })

    it('preserves width and height from the original URL', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Img</title></head><body><img src="/api/images?alt=hero&w=1200&h=900"></body></html>',
      })
      expect(project.files['client/preview.ts']).toContain('/1200/900')
    })

    it('rewrites poster attributes and CSS url() references', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Media</title><style>.hero{background:url(/api/image?seed=bg&w=400&h=300)}</style></head><body><video poster="/api/pexels?query=cover&w=200&h=100"></video></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).toContain('https://picsum.photos/seed/')
      expect(preview).not.toContain('/api/pexels')
      expect(preview).not.toContain('/api/image?')
    })
  })

  describe('Tailwind CDN injection', () => {
    it('adds the Tailwind CDN script when no local runtime is present', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Styled</title></head><body class="bg-background text-foreground"><div class="border-border">Hi</div></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).toContain('https://cdn.tailwindcss.com')
    })

    it('replaces the ShipFast-local Tailwind runtime with the CDN script', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Styled</title><script src="/scripts/tailwind-browser.js"></script></head><body class="bg-background"><div class="border-border">Styled</div></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).toContain('https://cdn.tailwindcss.com')
      expect(preview).not.toContain('/scripts/tailwind-browser.js')
    })
  })

  describe('OpenUI metadata stripping', () => {
    it('removes the ship-fast-openui-source script tag', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Strip</title><script id="ship-fast-openui-source">window.__openui = {};</script></head><body><h1>Hi</h1></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).not.toContain('ship-fast-openui-source')
      expect(preview).not.toContain('window.__openui')
    })

    it('rewrites the "Generated OpenUI source" status text', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Text</title></head><body><p>Generated OpenUI source is ready.</p></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).toContain('Generated site is ready.')
      expect(preview).not.toContain('Generated OpenUI source is ready.')
    })

    it('strips data-openui-* attributes from element tags', async () => {
      // EXPECTED behavior: all data-openui-* metadata attributes MUST be
      // removed from the exported HTML. If only the script tag is stripped but
      // data-openui-* attributes survive, that is a BUG — this test MUST fail
      // until stripShipFastOpenUIMetadata removes the attributes too.
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Attrs</title></head><body><div data-openui-source="trace" data-openui-version="1.0">Content</div></body></html>',
      })
      const preview = project.files['client/preview.ts']
      expect(preview).not.toContain('data-openui-source')
      expect(preview).not.toContain('data-openui-version')
      expect(preview).not.toMatch(/data-openui-[a-z]+/)
    })
  })

  describe('client index', () => {
    it('renders the generated static preview in a full-viewport iframe', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Wrap</title></head><body><h1>Wrap</h1></body></html>',
      })
      const rendered = await renderStaticProjectClient(project.files)

      expect(rendered.errors).toEqual([])
      expect(rendered.iframe).not.toBeNull()
      expect(rendered.iframe?.title).toBe('Generated preview')
      expect(rendered.iframe?.getAttribute('srcdoc')).toContain('<h1>Wrap</h1>')
      expect(rendered.iframe?.getAttribute('style')).toContain('height: 100vh')
      expect(rendered.iframe?.getAttribute('style')).toContain('width: 100vw')
    })
  })

  describe('server index', () => {
    it('serves a GET /api/status endpoint from the compiled anonymous deploy artifact', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Status</title></head><body><h1>Status</h1></body></html>',
        siteSpecJson: '{"projectName":"Status App"}',
      })
      const serverCapsule = await loadAnonymousDeployServerCapsule(
        project.files,
      )
      const response = serverCapsule?.endpoints?.status?.handler?.()

      expect(serverCapsule?.name).toBe('status-app')
      expect(serverCapsule?.endpoints?.status).toMatchObject({
        method: 'GET',
        path: '/api/status',
      })
      expect(response).toMatchObject({
        body: 'ok',
        kind: 'response',
        status: 200,
      })
    })
  })

  describe('AGENTS.md / CLAUDE.md', () => {
    it('generates both files with correct Lakebed instructions', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Docs</title></head><body><h1>Docs</h1></body></html>',
        siteSpecJson: '{"projectName":"Docs App"}',
      })
      const agents = project.files['AGENTS.md']
      const claude = project.files['CLAUDE.md']
      expect(agents).toContain('Lakebed App Instructions')
      expect(agents).toContain('npx lakebed <command>')
      expect(agents).toContain('client/index.tsx')
      expect(agents).toContain('server/index.ts')
      expect(claude).toBe(agents)
    })

    it('generates a README with the project name and ShipFast attribution', async () => {
      const project = await buildStaticLakebedProjectFiles({
        source:
          '<!doctype html><html><head><title>Readme</title></head><body><h1>Readme</h1></body></html>',
        siteSpecJson: '{"projectName":"Readme App"}',
      })
      const readme = project.files['README.md']
      expect(readme).toContain('# Readme App')
      expect(readme).toContain('npx lakebed dev')
      expect(readme).toContain(
        'Generated with [ShipFast](https://ship-fast.io)',
      )
    })
  })

  describe('forbidden token assertion', () => {
    it('rejects a project whose output contains an OpenUI trace token', async () => {
      // The OpenUI token survives into client/preview.ts, triggering
      // assertNoOpenUITrace inside the builder.
      await expect(
        buildStaticLakebedProjectFiles({
          source:
            '<!doctype html><html><head><title>Trace</title></head><body><div data-openui-source="@openuidev/trace">OpenUI leak</div></body></html>',
        }),
      ).rejects.toThrow(/Static Lakebed project contains/)
    })

    it('rejects a project containing the defineCapsule token', async () => {
      await expect(
        buildStaticLakebedProjectFiles({
          source:
            '<!doctype html><html><head><title>Trace</title></head><body><script>function defineCapsule() {}</script></body></html>',
        }),
      ).rejects.toThrow(/Static Lakebed project contains/)
    })
  })
})

// ---------------------------------------------------------------------------
// Lakebed publish response
// ---------------------------------------------------------------------------

describe('Lakebed publish response', () => {
  const requestFor = (body: unknown = {}, auth = 'Bearer app-token') =>
    new Request(
      'https://ship-fast.test/api/sessions/session_edge/deploy/lakebed',
      {
        body: JSON.stringify(body),
        headers: { authorization: auth, 'content-type': 'application/json' },
        method: 'POST',
      },
    )

  it('returns an existing ready deployment without re-deploying', async () => {
    const client = {
      query: vi.fn(async () => ({
        provider: 'lakebed',
        status: 'ready',
        url: 'https://existing.lakebed.app',
      })),
      action: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor(),
      'session_edge',
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('app-token')
    expect(client.action).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      provider: 'lakebed',
      status: 'ready',
      url: 'https://existing.lakebed.app',
    })
  })

  it('returns a 202 error when the artifact is not ready', async () => {
    const client = {
      query: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ status: 'building', filesUrl: null }),
      action: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({ anonymousOwnerSecret: 'secret' }),
      'session_edge',
      client,
    )

    expect(response.status).toBe(202)
    expect(client.action).not.toHaveBeenCalled()
    const body = await response.json()
    expect(body).toMatchObject({
      status: 'building',
      error: 'Lakebed app is still being prepared.',
    })
  })

  it('returns a stable publish error when the owner secret is missing and the deploy action rejects', async () => {
    const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'
    const client = {
      query: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
        status: 'ready',
        filesUrl: 'https://storage.test/files.json',
      }),
      action: vi.fn(async () => {
        throw new Error('AUTH_REQUIRED: anonymous owner secret required')
      }),
      setAuth: vi.fn(),
    }

    // No anonymousOwnerSecret in the body.
    const response = await createLakebedPublishResponse(
      requestFor({}),
      realSessionId,
      client,
    )

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: 'Lakebed publish failed.' })
    expect(JSON.stringify(body)).not.toContain('anonymous owner secret')
    expect(JSON.stringify(body)).not.toContain(realSessionId)
  })

  it('returns a stable publish error when the bearer token is invalid', async () => {
    const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'
    const client = {
      query: vi.fn(async () => {
        throw new Error(`AUTH_REQUIRED: invalid token for ${realSessionId}`)
      }),
      action: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({}, 'Bearer invalid-token'),
      realSessionId,
      client,
    )

    expect(response.status).toBe(500)
    expect(client.setAuth).toHaveBeenCalledWith('invalid-token')
    const body = await response.json()
    expect(body).toEqual({ error: 'Lakebed publish failed.' })
    expect(JSON.stringify(body)).not.toContain('invalid token')
    expect(JSON.stringify(body)).not.toContain(realSessionId)
  })

  it('returns the deploy URL on a successful deploy', async () => {
    const client = {
      query: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
        status: 'ready',
        filesUrl: 'https://storage.test/files.json',
      }),
      action: vi.fn(async () => ({
        provider: 'lakebed',
        status: 'ready',
        url: 'https://deployed-edge.lakebed.app',
        deployId: 'edge_deploy_1',
      })),
      setAuth: vi.fn(),
    }

    const response = await createLakebedPublishResponse(
      requestFor({ anonymousOwnerSecret: 'owner-secret' }),
      'session_edge',
      client,
    )

    expect(response.status).toBe(200)
    expect(client.action).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_edge',
      anonymousOwnerSecret: 'owner-secret',
    })
    const body = await response.json()
    expect(body).toMatchObject({
      provider: 'lakebed',
      status: 'ready',
      url: 'https://deployed-edge.lakebed.app',
      deployId: 'edge_deploy_1',
    })
  })
})

// ---------------------------------------------------------------------------
// GitHub OAuth (convex/github.ts)
// ---------------------------------------------------------------------------

type GithubRow = Record<string, unknown> & { _id: string }
type MockGithubState = {
  githubOAuthStates: GithubRow[]
  githubConnections: GithubRow[]
}

const createGithubMockCtx = (
  state: MockGithubState,
  identity: { tokenIdentifier: string; subject: string } | null,
) => {
  const deleted = new Set<string>()
  const tables: Record<string, GithubRow[]> = {
    githubOAuthStates: state.githubOAuthStates,
    githubConnections: state.githubConnections,
  }
  let idSeq = 0
  const query = (table: string): any => ({
    withIndex: (
      _index: string,
      fn: (q: any) => { field: string; value: unknown },
    ): any => {
      const filter = fn({
        eq: (field: string, value: unknown) => ({ field, value }),
      })
      const rows = tables[table].filter(
        (r) => !deleted.has(r._id) && r[filter.field] === filter.value,
      )
      return {
        collect: async () => rows,
        unique: async () => rows[0] ?? null,
        first: async () => rows[0] ?? null,
      }
    },
  })
  return {
    auth: {
      getUserIdentity: vi.fn(async () => identity),
    },
    db: {
      query: vi.fn(query),
      insert: vi.fn(async (table: string, doc: Record<string, unknown>) => {
        const id = `${table}_${++idSeq}`
        tables[table].push({ _id: id, ...doc })
        return id
      }),
      patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
        for (const rows of Object.values(tables)) {
          const row = rows.find((r) => r._id === id)
          if (row) Object.assign(row, patch)
        }
      }),
      delete: vi.fn(async (id: string) => {
        deleted.add(id)
      }),
    },
    _deleted: deleted,
  }
}

const handler = (fn: unknown): any =>
  (fn as any)._handler ?? (fn as any).handler ?? fn

const ISS = 'https://clerk.test'
const identity = (user: string) => ({
  tokenIdentifier: `${ISS}|${user}`,
  subject: user,
})

describe('GitHub OAuth', () => {
  describe('createOAuthState', () => {
    it('stores a unique state token for the authenticated user', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      await handler(github.createOAuthState)(ctx, {
        state: 'state-unique-1',
        returnTo: '/dashboard',
        expiresAt: Date.now() + 60_000,
      })

      expect(state.githubOAuthStates).toHaveLength(1)
      expect(state.githubOAuthStates[0]).toMatchObject({
        state: 'state-unique-1',
        clerkTokenIdentifier: `${ISS}|alice`,
        returnTo: '/dashboard',
      })
    })

    it('invalidates previous states for the same user before inserting a new one', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      await handler(github.createOAuthState)(ctx, {
        state: 'state-old',
        returnTo: '/',
        expiresAt: Date.now() + 60_000,
      })
      await handler(github.createOAuthState)(ctx, {
        state: 'state-new',
        returnTo: '/dashboard',
        expiresAt: Date.now() + 60_000,
      })

      // The old state was deleted; only the new one remains active.
      expect(ctx._deleted.size).toBe(1)
      const active = state.githubOAuthStates.filter(
        (r) => !ctx._deleted.has(r._id),
      )
      expect(active).toHaveLength(1)
      expect(active[0]?.state).toBe('state-new')
    })

    it('requires authentication', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, null)

      await expect(
        handler(github.createOAuthState)(ctx, {
          state: 'state-noauth',
          returnTo: '/',
          expiresAt: Date.now() + 60_000,
        }),
      ).rejects.toThrow('AUTH_REQUIRED')
    })
  })

  describe('cancelOAuthState', () => {
    it('invalidates the state and returns the original returnTo', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [
          {
            _id: 'state_row_1',
            state: 'state-cancel',
            clerkTokenIdentifier: `${ISS}|alice`,
            returnTo: '/profile',
            expiresAt: Date.now() + 60_000,
          },
        ],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      const result = await handler(github.cancelOAuthState)(ctx, {
        state: 'state-cancel',
      })

      expect(result).toEqual({ returnTo: '/profile' })
      expect(ctx._deleted.has('state_row_1')).toBe(true)
    })

    it('returns a default returnTo when the state does not exist', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      const result = await handler(github.cancelOAuthState)(ctx, {
        state: 'missing',
      })
      expect(result).toEqual({ returnTo: '/' })
    })
  })

  describe('completeOAuthConnection', () => {
    it('exchanges the state for a stored GitHub connection', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [
          {
            _id: 'state_row_complete',
            state: 'state-exchange',
            clerkTokenIdentifier: `${ISS}|alice`,
            clerkUserId: 'alice',
            returnTo: '/dashboard',
            sessionId: 'sess_1',
            target: 'lakebed',
            createdAt: Date.now(),
            expiresAt: Date.now() + 60_000,
          },
        ],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      const result = await handler(github.completeOAuthConnection)(ctx, {
        state: 'state-exchange',
        githubUserId: 12345,
        githubLogin: 'alice-gh',
        accessToken: 'gho_token',
        scopes: ['repo', 'user'],
      })

      expect(result).toMatchObject({
        returnTo: '/dashboard',
        sessionId: 'sess_1',
        target: 'lakebed',
        githubLogin: 'alice-gh',
        scopes: ['repo', 'user'],
      })
      expect(state.githubConnections).toHaveLength(1)
      expect(state.githubConnections[0]).toMatchObject({
        githubUserId: 12345,
        githubLogin: 'alice-gh',
        accessToken: 'gho_token',
        scopes: ['repo', 'user'],
      })
      // The OAuth state row is consumed.
      expect(ctx._deleted.has('state_row_complete')).toBe(true)
    })

    it('patches an existing connection instead of inserting a duplicate', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [
          {
            _id: 'state_row_reconnect',
            state: 'state-reconnect',
            clerkTokenIdentifier: `${ISS}|alice`,
            clerkUserId: 'alice',
            returnTo: '/',
            createdAt: Date.now(),
            expiresAt: Date.now() + 60_000,
          },
        ],
        githubConnections: [
          {
            _id: 'conn_1',
            clerkTokenIdentifier: `${ISS}|alice`,
            githubUserId: 999,
            githubLogin: 'old-login',
            accessToken: 'old-token',
            scopes: ['repo'],
          },
        ],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      await handler(github.completeOAuthConnection)(ctx, {
        state: 'state-reconnect',
        githubUserId: 12345,
        githubLogin: 'new-login',
        accessToken: 'new-token',
        scopes: ['repo', 'user'],
      })

      expect(ctx.db.insert).not.toHaveBeenCalled()
      expect(ctx.db.patch).toHaveBeenCalledWith(
        'conn_1',
        expect.objectContaining({
          githubLogin: 'new-login',
          accessToken: 'new-token',
          scopes: ['repo', 'user'],
        }),
      )
    })

    it('rejects an expired OAuth state', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [
          {
            _id: 'state_row_expired',
            state: 'state-expired',
            clerkTokenIdentifier: `${ISS}|bob`,
            clerkUserId: 'bob',
            returnTo: '/',
            expiresAt: Date.now() - 1_000,
          },
        ],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('bob'))

      await expect(
        handler(github.completeOAuthConnection)(ctx, {
          state: 'state-expired',
          githubUserId: 1,
          githubLogin: 'bob-gh',
          accessToken: 'gho',
          scopes: ['repo'],
        }),
      ).rejects.toThrow('OAUTH_STATE_INVALID')
    })
  })

  describe('getConnectionForCurrentUser', () => {
    it('returns the connection when one exists', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [
          {
            _id: 'conn_1',
            clerkTokenIdentifier: `${ISS}|alice`,
            githubUserId: 12345,
            githubLogin: 'alice-gh',
            accessToken: 'gho_token',
            scopes: ['repo', 'user'],
            connectedAt: 1000,
            updatedAt: 2000,
          },
        ],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      const connection = await handler(github.getConnectionForCurrentUser)(
        ctx,
        {},
      )

      expect(connection).toMatchObject({
        githubUserId: 12345,
        githubLogin: 'alice-gh',
        accessToken: 'gho_token',
        scopes: ['repo', 'user'],
        connectedAt: 1000,
        updatedAt: 2000,
      })
    })

    it('returns null when no connection exists', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('nobody'))

      const connection = await handler(github.getConnectionForCurrentUser)(
        ctx,
        {},
      )
      expect(connection).toBeNull()
    })

    it('requires authentication', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, null)

      await expect(
        handler(github.getConnectionForCurrentUser)(ctx, {}),
      ).rejects.toThrow('AUTH_REQUIRED')
    })
  })

  describe('scope normalization', () => {
    it('normalizes requested scopes to deduplicated, sorted, lowercase GitHub API scopes', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [
          {
            _id: 'state_row_scopes',
            state: 'state-scopes',
            clerkTokenIdentifier: `${ISS}|alice`,
            clerkUserId: 'alice',
            returnTo: '/',
            createdAt: Date.now(),
            expiresAt: Date.now() + 60_000,
          },
        ],
        githubConnections: [],
      }
      const ctx = createGithubMockCtx(state, identity('alice'))

      const result = await handler(github.completeOAuthConnection)(ctx, {
        state: 'state-scopes',
        githubUserId: 1,
        githubLogin: 'alice-gh',
        accessToken: 'gho',
        scopes: ['Repo', '  user  ', 'repo', 'USER', ''],
      })

      expect(result.scopes).toEqual(['repo', 'user'])
      expect(state.githubConnections[0]?.scopes).toEqual(['repo', 'user'])
    })
  })

  describe('OAuth state isolation', () => {
    it('keeps states for different users isolated', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [],
      }

      const ctxAlice = createGithubMockCtx(state, identity('alice'))
      await handler(github.createOAuthState)(ctxAlice, {
        state: 'state-alice-iso',
        returnTo: '/a',
        expiresAt: Date.now() + 60_000,
      })

      const ctxBob = createGithubMockCtx(state, identity('bob'))
      await handler(github.createOAuthState)(ctxBob, {
        state: 'state-bob-iso',
        returnTo: '/b',
        expiresAt: Date.now() + 60_000,
      })

      const aliceRow = state.githubOAuthStates.find(
        (r) => r.state === 'state-alice-iso',
      )
      const bobRow = state.githubOAuthStates.find(
        (r) => r.state === 'state-bob-iso',
      )
      expect(aliceRow?.clerkTokenIdentifier).toBe(`${ISS}|alice`)
      expect(bobRow?.clerkTokenIdentifier).toBe(`${ISS}|bob`)

      // Alice creating a new state does not delete Bob's state.
      expect(ctxAlice._deleted.has(bobRow!._id)).toBe(false)
    })

    it('does not leak a connection across identities', async () => {
      const state: MockGithubState = {
        githubOAuthStates: [],
        githubConnections: [
          {
            _id: 'conn_alice',
            clerkTokenIdentifier: `${ISS}|alice`,
            githubUserId: 1,
            githubLogin: 'alice-gh',
            accessToken: 'gho_alice',
            scopes: ['repo'],
          },
        ],
      }

      const ctxBob = createGithubMockCtx(state, identity('bob'))
      const connection = await handler(github.getConnectionForCurrentUser)(
        ctxBob,
        {},
      )
      expect(connection).toBeNull()
    })
  })
})
