import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { chmodSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'
import {
  ANONYMOUS_ARTIFACT_FORMAT,
  ANONYMOUS_ARTIFACT_MEDIA_TYPE,
  AnonymousCompilerError,
  DEFAULT_ANONYMOUS_LIMITS,
  LAKEBED_CONFIG_FILE,
  LAKEBED_VERSION,
  SERVER_ENV_FILE,
  byteLength,
  sha256,
  stableStringify,
  validateAnonymousDeployPayload,
} from 'lakebed/anonymous'
import { LAKEBED_DEPLOY_API_URL } from 'lakebed/release'
import {
  MemorySourceStore,
  sourcePathDirname,
  sourcePathJoin,
} from 'lakebed/source-store'

const packageDir = join(process.cwd(), 'node_modules', 'lakebed')
const packageNodeModules = join(packageDir, 'node_modules')
const sourceNamespace = 'lakebed-source'
const lakebedServerNamespace = 'lakebed-server'
const endpointMethodPattern = /^[A-Z0-9!#$%&'*+.^_`|~-]+$/
const require = createRequire(import.meta.url)

const lakebedServerModuleSource = `
export function capsule(definition) {
  return definition;
}
export function query(handler) {
  return handler;
}
export function mutation(handler) {
  return handler;
}
export function endpoint(route, handler) {
  return {
    handler,
    kind: "endpoint",
    method: String(route?.method ?? "").toUpperCase(),
    path: String(route?.path ?? "")
  };
}
function response(body, { headers = {}, status = 200 } = {}) {
  return { body, headers, kind: "response", status };
}
export function json(value, options = {}) {
  return response(JSON.stringify(value ?? null), {
    ...options,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(options.headers ?? {}) }
  });
}
export function text(value, options = {}) {
  return response(String(value ?? ""), {
    ...options,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...(options.headers ?? {}) }
  });
}
export function empty(options = {}) {
  return response("", { status: 204, ...options });
}
export function redirect(url, options = {}) {
  return response("", {
    status: 302,
    ...options,
    headers: { Location: String(url), ...(options.headers ?? {}) }
  });
}
function field(kind) {
  return {
    kind,
    defaultValue: undefined,
    default(value) {
      return { ...this, defaultValue: value };
    }
  };
}
export function table(fields) {
  return { kind: "table", fields };
}
export function string() {
  return field("string");
}
export function boolean() {
  return field("boolean");
}
`

type JsonRecord = Record<string, any>
type Diagnostic = { file: string; message: string }
type LakebedDeployLogger = (
  message: string,
  details?: Record<string, unknown>,
) => void
type SourceFile = {
  bytes: number
  contents: string
  hash: string
  path: string
}
type FetchLike = typeof fetch

export type LakebedDeployInput = {
  files: Record<string, string>
  api?: string
  fetchImpl?: FetchLike
  inspectPolicy?: 'public'
  log?: LakebedDeployLogger
}

export type LakebedBuildResult = {
  app: JsonRecord
  artifact: JsonRecord
  artifactHash: string
  clientBundle: string
  clientBundleBytes: number
  clientBundleHash: string
  requestBody: string
  requestBodyBytes: number
  serverBundleBytes: number
  serverBundleHash: string
  sourceFileCount: number
  sourceStore: MemorySourceStore
}

export type LakebedDeployResult = {
  deployId: string
  url: string
  updatedAt?: string
  expiresAt?: string
  claimUrl?: string
  claimed?: boolean
  inspectPolicy?: string
  limits?: Record<string, unknown>
  artifactHash: string
  clientBundleHash: string
  clientBundleBytes: number
  requestBodyBytes: number
  serverBundleBytes: number
  sourceFileCount: number
}

const isBareSpecifier = (path: string): boolean =>
  !path.startsWith('.') && !path.startsWith('/') && !/^[a-zA-Z]:/.test(path)

const isPlainObject = (value: unknown): value is JsonRecord =>
  Boolean(value) &&
  typeof value === 'object' &&
  Object.getPrototypeOf(value) === Object.prototype

const diagnostic = (file: string, message: string): Diagnostic => ({
  file,
  message,
})

const normalizeDeployApiOrigin = (value: string): string => {
  const url = new URL(value)
  const isLocal =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '::1' ||
    url.hostname.endsWith('.localhost')

  if (
    url.username ||
    url.password ||
    (url.pathname && url.pathname !== '/') ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal))
  ) {
    throw new Error(
      `Invalid Lakebed API origin: ${value}. Use an HTTPS origin without credentials, a path, a query, or a fragment.`,
    )
  }

  return url.origin === 'https://api.lakebed.app'
    ? LAKEBED_DEPLOY_API_URL
    : url.origin
}

const resolveDeployApiUrl = (api?: string): string =>
  normalizeDeployApiOrigin(
    api ??
      process.env.LAKEBED_DEPLOY_API ??
      process.env.SPAN_DEPLOY_API ??
      LAKEBED_DEPLOY_API_URL,
  )

const createSourceStore = (files: Record<string, string>): MemorySourceStore =>
  new MemorySourceStore(new Map(Object.entries(files)))

const esbuildPackageForCurrentPlatform = (): string | null => {
  const platform = process.platform
  const arch = process.arch
  if (platform === 'linux' && arch === 'arm64') return '@esbuild/linux-arm64'
  if (platform === 'linux' && arch === 'x64') return '@esbuild/linux-x64'
  if (platform === 'darwin' && arch === 'arm64') return '@esbuild/darwin-arm64'
  if (platform === 'darwin' && arch === 'x64') return '@esbuild/darwin-x64'
  return null
}

const ensureEsbuildBinaryExecutable = (log?: LakebedDeployLogger) => {
  const packageName = esbuildPackageForCurrentPlatform()
  if (packageName === null) return
  try {
    const binaryPath = require.resolve(`${packageName}/bin/esbuild`)
    chmodSync(binaryPath, 0o755)
    const version = execFileSync(binaryPath, ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
    }).trim()
    log?.('bundle:esbuild-binary:ready', {
      arch: process.arch,
      binaryPath,
      platform: process.platform,
      version,
    })
  } catch (error) {
    log?.('bundle:esbuild-binary:check-failed', {
      arch: process.arch,
      error: error instanceof Error ? error.message : String(error),
      packageName,
      platform: process.platform,
    })
    // esbuild will surface the underlying resolution or spawn error.
  }
}

const summarizeFiles = (files: Record<string, string>) => {
  const entries = Object.entries(files)
  const totalBytes = entries.reduce(
    (sum, [, contents]) => sum + byteLength(contents),
    0,
  )
  return {
    fileCount: entries.length,
    sampleFiles: entries.slice(0, 12).map(([path]) => path),
    totalBytes,
  }
}

const resolveSourceFile = async (
  sourceStore: MemorySourceStore,
  requestedPath: string,
): Promise<string> => {
  const normalized = sourcePathJoin(requestedPath)
  const candidates = [
    normalized,
    `${normalized}.ts`,
    `${normalized}.tsx`,
    `${normalized}.js`,
    `${normalized}.jsx`,
    `${normalized}.mjs`,
    `${normalized}.json`,
    sourcePathJoin(normalized, 'index.ts'),
    sourcePathJoin(normalized, 'index.tsx'),
    sourcePathJoin(normalized, 'index.js'),
    sourcePathJoin(normalized, 'index.jsx'),
    sourcePathJoin(normalized, 'index.mjs'),
  ]

  for (const candidate of candidates) {
    if (sourceStore.hasFile(candidate)) return candidate
  }

  throw new Error(`Unable to resolve source import: ${requestedPath}`)
}

const loaderForPath = (path: string): esbuild.Loader => {
  if (path.endsWith('.tsx')) return 'tsx'
  if (path.endsWith('.ts')) return 'ts'
  if (path.endsWith('.jsx')) return 'jsx'
  if (path.endsWith('.json')) return 'json'
  return 'js'
}

const createSourcePlugin = (
  sourceStore: MemorySourceStore,
  target: 'server' | 'client',
): esbuild.Plugin => {
  const allowedBare = new Set(
    target === 'server'
      ? ['lakebed/server']
      : [
          'lakebed/client',
          'preact',
          'preact/hooks',
          'preact/jsx-runtime',
          'preact/jsx-dev-runtime',
        ],
  )

  return {
    name: 'ship-fast-lakebed-source-store',
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (args.kind === 'entry-point') {
          return {
            path: await resolveSourceFile(sourceStore, args.path),
            namespace: sourceNamespace,
          }
        }

        if (args.namespace !== sourceNamespace) return undefined

        if (args.path.startsWith('node:')) {
          return {
            errors: [
              {
                text: `Node built-ins are not available inside Lakebed ${target} modules: ${args.path}`,
              },
            ],
          }
        }

        if (isBareSpecifier(args.path)) {
          if (
            allowedBare.has(args.path) ||
            (target === 'client' && args.path.startsWith('preact/'))
          ) {
            if (target === 'server' && args.path === 'lakebed/server') {
              return { path: args.path, namespace: lakebedServerNamespace }
            }

            if (target === 'server') return { path: args.path, external: true }

            return { path: require.resolve(args.path) }
          }

          return {
            errors: [
              {
                text: `External packages are not supported in Lakebed v0: ${args.path}. Use relative files or Lakebed built-ins.`,
              },
            ],
          }
        }

        const basePath = args.path.startsWith('/')
          ? ''
          : sourcePathDirname(args.importer)
        return {
          path: await resolveSourceFile(
            sourceStore,
            sourcePathJoin(basePath, args.path),
          ),
          namespace: sourceNamespace,
        }
      })

      build.onLoad({ filter: /.*/, namespace: sourceNamespace }, async (args) => ({
        contents: await sourceStore.readFile(args.path),
        loader: loaderForPath(args.path),
        resolveDir: sourcePathDirname(args.path),
      }))

      build.onLoad(
        { filter: /.*/, namespace: lakebedServerNamespace },
        async () => ({
          contents: lakebedServerModuleSource,
          loader: 'js',
        }),
      )
    },
  }
}

const readSourceFiles = async (
  sourceStore: MemorySourceStore,
): Promise<SourceFile[]> => {
  const paths = (await sourceStore.listFiles()).filter(
    (path) =>
      !path.startsWith('__lakebed/') &&
      path !== LAKEBED_CONFIG_FILE &&
      path !== SERVER_ENV_FILE,
  )
  const files: SourceFile[] = []

  for (const path of paths) {
    const contents = await sourceStore.readFile(path)
    files.push({
      bytes: byteLength(contents),
      contents,
      hash: sha256(contents),
      path,
    })
  }

  return files.sort((left, right) => left.path.localeCompare(right.path))
}

const forbiddenSourceDiagnostics = (
  files: SourceFile[],
  { allowAsync = false } = {},
): Diagnostic[] => {
  const checks: Array<[RegExp, string]> = [
    [/\beval\s*\(/, 'eval is not available in anonymous server code.'],
    [
      /\bFunction\s*\(/,
      'Function constructors are not available in anonymous server code.',
    ],
    [/\bimport\s*\(/, 'Dynamic import is not available in anonymous server code.'],
    [/\bfetch\b/, 'Outbound fetch is disabled for anonymous deploys.'],
    ...(allowAsync
      ? []
      : ([
          [
            /\basync\b/,
            'Async server handlers are not part of the anonymous IR yet. Use synchronous Lakebed database operations.',
          ],
        ] as Array<[RegExp, string]>)),
    [/\bwhile\s*\(/, 'while loops are not available in anonymous server code.'],
    [/\bfor\s*\(\s*;/, 'Unbounded for loops are not available in anonymous server code.'],
    [/\bprocess\b/, 'process is not available in anonymous server code.'],
    [/\bglobalThis\b/, 'globalThis is not available in anonymous server code.'],
    [/\bsetTimeout\s*\(/, 'Timers are not available in anonymous server code.'],
    [/\bsetInterval\s*\(/, 'Timers are not available in anonymous server code.'],
    [/from\s+["']node:/, 'Node built-ins are not available in anonymous server code.'],
  ]
  const diagnostics: Diagnostic[] = []

  for (const file of files.filter(
    (candidate) =>
      candidate.path.startsWith('server/') ||
      candidate.path.startsWith('shared/'),
  )) {
    for (const [pattern, message] of checks) {
      if (pattern.test(file.contents)) diagnostics.push(diagnostic(file.path, message))
    }
  }

  return diagnostics
}

const serializeSchema = (
  schema: JsonRecord | undefined,
): { diagnostics: Diagnostic[]; schema: JsonRecord } => {
  const cleanSchema: JsonRecord = {}
  const diagnostics: Diagnostic[] = []

  for (const [tableName, table] of Object.entries(schema ?? {})) {
    if (
      !isPlainObject(table) ||
      table.kind !== 'table' ||
      !isPlainObject(table.fields)
    ) {
      diagnostics.push(
        diagnostic(
          'server/index.ts',
          `Anonymous deploys only support Lakebed table() schema entries. Check schema.${tableName}.`,
        ),
      )
      continue
    }

    const fields: JsonRecord = {}
    for (const [fieldName, field] of Object.entries(table.fields)) {
      if (
        !isPlainObject(field) ||
        (field.kind !== 'string' && field.kind !== 'boolean')
      ) {
        diagnostics.push(
          diagnostic(
            'server/index.ts',
            `Anonymous deploys only support string() and boolean() fields. Check ${tableName}.${fieldName}.`,
          ),
        )
        continue
      }

      if (typeof field.defaultValue === 'function') {
        diagnostics.push(
          diagnostic(
            'server/index.ts',
            `Anonymous deploys do not support function defaults yet. Check ${tableName}.${fieldName}.`,
          ),
        )
        continue
      }

      fields[fieldName] = {
        defaultValue: field.defaultValue,
        kind: field.kind,
      }
    }

    cleanSchema[tableName] = { kind: 'table', fields }
  }

  return { diagnostics, schema: cleanSchema }
}

const isReservedEndpointPath = (path: string): boolean =>
  path === '/' ||
  path === '/index.html' ||
  path === '/client.js' ||
  path === '/auth/callback' ||
  path.startsWith('/auth/') ||
  path === '/__lakebed' ||
  path.startsWith('/__lakebed/') ||
  path === '/__span' ||
  path.startsWith('/__span/')

const validateEndpointRoute = (
  { method, path }: { method: string; path: string },
  diagnosticPath: string,
  diagnostics: Diagnostic[],
) => {
  if (!endpointMethodPattern.test(method)) {
    diagnostics.push(
      diagnostic(diagnosticPath, 'Endpoint method must be a valid uppercase HTTP method.'),
    )
  }

  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    path.includes('?') ||
    path.includes('#')
  ) {
    diagnostics.push(
      diagnostic(
        diagnosticPath,
        'Endpoint path must be an absolute app path like /webhooks/stripe.',
      ),
    )
    return
  }

  if (isReservedEndpointPath(path)) {
    diagnostics.push(
      diagnostic(diagnosticPath, `Endpoint path ${path} is reserved by Lakebed.`),
    )
  }
}

const serializeEndpoints = (
  endpoints: JsonRecord | undefined,
): { diagnostics: Diagnostic[]; endpoints: JsonRecord } => {
  const diagnostics: Diagnostic[] = []
  const cleanEndpoints: JsonRecord = {}
  const seenRoutes = new Map<string, string>()

  for (const [name, endpoint] of Object.entries(endpoints ?? {})) {
    const diagnosticPath = `server.index.endpoints.${name}`
    if (
      !isPlainObject(endpoint) ||
      endpoint.kind !== 'endpoint' ||
      typeof endpoint.handler !== 'function'
    ) {
      diagnostics.push(
        diagnostic(
          'server/index.ts',
          `Endpoint ${name} must be defined with endpoint({ method, path }, handler).`,
        ),
      )
      continue
    }

    const method = String(endpoint.method ?? '').toUpperCase()
    const path = String(endpoint.path ?? '')
    validateEndpointRoute({ method, path }, diagnosticPath, diagnostics)

    const routeKey = `${method} ${path}`
    const existing = seenRoutes.get(routeKey)
    if (existing !== undefined) {
      diagnostics.push(
        diagnostic(
          'server/index.ts',
          `Endpoint ${name} duplicates ${existing} at ${routeKey}.`,
        ),
      )
      continue
    }

    seenRoutes.set(routeKey, name)
    cleanEndpoints[name] = { method, op: 'source', path }
  }

  return { diagnostics, endpoints: cleanEndpoints }
}

const buildBundles = async (
  sourceStore: MemorySourceStore,
  log?: LakebedDeployLogger,
): Promise<{ app: JsonRecord; clientBundle: Buffer; serverBundle: Buffer }> => {
  const workingStore = sourceStore.clone()
  const sourcePaths = await sourceStore.listFiles()
  log?.('bundle:source-store:ready', {
    sourceFileCount: sourcePaths.length,
    sampleFiles: sourcePaths.slice(0, 12),
  })
  const serverEntry = workingStore.hasFile('server/index.ts')
    ? 'server/index.ts'
    : 'server/index.js'

  log?.('bundle:entrypoints:check', {
    hasClientEntry: workingStore.hasFile('client/index.tsx'),
    serverEntry,
  })

  if (!workingStore.hasFile(serverEntry)) {
    throw new Error('Missing Lakebed server entry: server/index.ts')
  }

  if (!workingStore.hasFile('client/index.tsx')) {
    throw new Error('Missing Lakebed client entry: client/index.tsx')
  }

  await workingStore.writeFile(
    '__lakebed/client-entry.tsx',
    `import { createElement, render } from "preact/compat";
import { App } from "../client/index.tsx";

render(createElement(App, {}), document.getElementById("app"));
`,
  )

  const serverBuildStartedAt = Date.now()
  log?.('bundle:server:start', { entryPoint: serverEntry })
  ensureEsbuildBinaryExecutable(log)
  const serverResult = await esbuild.build({
    bundle: true,
    entryPoints: [serverEntry],
    format: 'esm',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    minify: true,
    platform: 'node',
    plugins: [createSourcePlugin(workingStore, 'server')],
    sourcemap: false,
    write: false,
  })
  log?.('bundle:server:complete', {
    elapsedMs: Date.now() - serverBuildStartedAt,
    outputBytes: serverResult.outputFiles[0]?.contents.byteLength ?? 0,
  })

  const clientBuildStartedAt = Date.now()
  log?.('bundle:client:start', { entryPoint: '__lakebed/client-entry.tsx' })
  ensureEsbuildBinaryExecutable(log)
  const clientResult = await esbuild.build({
    bundle: true,
    entryPoints: ['__lakebed/client-entry.tsx'],
    format: 'esm',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    minify: true,
    nodePaths: [packageNodeModules],
    platform: 'browser',
    plugins: [createSourcePlugin(workingStore, 'client')],
    sourcemap: false,
    write: false,
  })
  log?.('bundle:client:complete', {
    elapsedMs: Date.now() - clientBuildStartedAt,
    outputBytes: clientResult.outputFiles[0]?.contents.byteLength ?? 0,
  })

  const serverBundle = Buffer.from(serverResult.outputFiles[0]?.contents ?? [])
  const clientBundle = Buffer.from(clientResult.outputFiles[0]?.contents ?? [])
  const importStartedAt = Date.now()
  log?.('bundle:server-module-import:start', {
    serverBundleBytes: serverBundle.byteLength,
  })
  const serverModulePath = join(
    tmpdir(),
    `ship-fast-lakebed-server-${process.pid}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.mjs`,
  )
  writeFileSync(serverModulePath, serverBundle)
  let serverModule: { default?: JsonRecord }
  try {
    serverModule = (await import(
      `${pathToFileURL(serverModulePath).href}?t=${Date.now()}`
    )) as { default?: JsonRecord }
  } finally {
    rmSync(serverModulePath, { force: true })
  }
  log?.('bundle:server-module-import:complete', {
    elapsedMs: Date.now() - importStartedAt,
    appKeys: Object.keys((serverModule.default ?? {}) as JsonRecord),
  })

  return {
    app: serverModule.default as JsonRecord,
    clientBundle,
    serverBundle,
  }
}

export const buildLakebedAnonymousDeployRequest = async (
  files: Record<string, string>,
  options: { inspectPolicy?: 'public'; log?: LakebedDeployLogger } = {},
): Promise<LakebedBuildResult> => {
  options.log?.('anonymous-request:source-store:create', summarizeFiles(files))
  const sourceStore = createSourceStore(files)
  const bundleStartedAt = Date.now()
  const { app, clientBundle, serverBundle } = await buildBundles(
    sourceStore,
    options.log,
  )
  options.log?.('anonymous-request:bundle:complete', {
    clientBundleBytes: clientBundle.byteLength,
    elapsedMs: Date.now() - bundleStartedAt,
    serverBundleBytes: serverBundle.byteLength,
  })
  const sourceScanStartedAt = Date.now()
  options.log?.('anonymous-request:source-files:start')
  const sourceFiles = await readSourceFiles(sourceStore)
  options.log?.('anonymous-request:source-files:complete', {
    elapsedMs: Date.now() - sourceScanStartedAt,
    sourceFileCount: sourceFiles.length,
    sourceFilesBytes: sourceFiles.reduce((sum, file) => sum + file.bytes, 0),
  })
  options.log?.('anonymous-request:diagnostics:start')
  const diagnostics = forbiddenSourceDiagnostics(sourceFiles, { allowAsync: true })
  const { diagnostics: schemaDiagnostics, schema } = serializeSchema(app.schema)
  const { diagnostics: endpointDiagnostics, endpoints } = serializeEndpoints(
    app.endpoints,
  )

  diagnostics.push(...schemaDiagnostics, ...endpointDiagnostics)
  options.log?.('anonymous-request:diagnostics:complete', {
    endpointDiagnosticCount: endpointDiagnostics.length,
    schemaDiagnosticCount: schemaDiagnostics.length,
    sourceDiagnosticCount: diagnostics.length,
  })
  if (diagnostics.length > 0) {
    options.log?.('anonymous-request:diagnostics:failed', {
      diagnostics,
    })
    throw new AnonymousCompilerError(diagnostics)
  }

  const encodeStartedAt = Date.now()
  options.log?.('anonymous-request:encode:start')
  const clientBundleBase64 = clientBundle.toString('base64')
  const clientBundleHash = sha256(clientBundle)
  const serverBundleBase64 = serverBundle.toString('base64')
  const serverBundleHash = sha256(serverBundle)
  const sourceManifest = sourceFiles.map(({ bytes, hash, path }) => ({
    bytes,
    hash,
    path,
  }))
  const sourceSnapshotHash = sha256(stableStringify(sourceManifest) ?? '')
  const artifact: JsonRecord = {
    name: app.name ?? 'Lakebed Capsule',
    client: {
      bundleHash: clientBundleHash,
      bytes: clientBundle.byteLength,
      entry: '/client.js',
    },
    createdWith: {
      compiler: '0.1.0',
      lakebed: LAKEBED_VERSION,
    },
    deployTarget: 'anonymous-source',
    format: ANONYMOUS_ARTIFACT_FORMAT,
    limits: {
      instructionBudget: DEFAULT_ANONYMOUS_LIMITS.instructionBudget,
      maxRowsReturned: DEFAULT_ANONYMOUS_LIMITS.rowsReturned,
      maxValueBytes: DEFAULT_ANONYMOUS_LIMITS.maxValueBytes,
    },
    server: {
      endpoints,
      helpers: {},
      imports: ['lakebed/server'],
      mutations: Object.fromEntries(
        Object.keys(app.mutations ?? {}).map((name) => [name, { op: 'source' }]),
      ),
      queries: Object.fromEntries(
        Object.keys(app.queries ?? {}).map((name) => [name, { op: 'source' }]),
      ),
      schema,
      source: {
        bytes: serverBundle.byteLength,
        bundle: serverBundleBase64,
        bundleHash: serverBundleHash,
        entry: '/server.mjs',
      },
    },
    source: {
      files: sourceManifest,
      snapshotHash: sourceSnapshotHash,
    },
  }
  const artifactHash = sha256(stableStringify(artifact) ?? '')
  const body = {
    artifact,
    clientBundle: clientBundleBase64,
    clientVersion: LAKEBED_VERSION,
    ...(options.inspectPolicy === undefined
      ? {}
      : { inspectPolicy: options.inspectPolicy }),
  }

  options.log?.('anonymous-request:validate:start', {
    artifactHash,
    clientBundleBase64Bytes: byteLength(clientBundleBase64),
    serverBundleBase64Bytes: byteLength(serverBundleBase64),
  })
  validateAnonymousDeployPayload(body)
  options.log?.('anonymous-request:validate:complete', {
    elapsedMs: Date.now() - encodeStartedAt,
  })

  const stringifyStartedAt = Date.now()
  options.log?.('anonymous-request:stringify:start')
  const requestBody = JSON.stringify(body)
  options.log?.('anonymous-request:stringify:complete', {
    elapsedMs: Date.now() - stringifyStartedAt,
    requestBodyBytes: Buffer.byteLength(requestBody, 'utf8'),
  })
  return {
    app,
    artifact,
    artifactHash,
    clientBundle: clientBundleBase64,
    clientBundleBytes: clientBundle.byteLength,
    clientBundleHash,
    requestBody,
    requestBodyBytes: Buffer.byteLength(requestBody, 'utf8'),
    serverBundleBytes: serverBundle.byteLength,
    serverBundleHash,
    sourceFileCount: sourceManifest.length,
    sourceStore,
  }
}

const readResponseJson = async (response: Response): Promise<JsonRecord> => {
  const body = await response.text()
  if (!response.ok) throw new Error(body || `Request failed with ${response.status}`)
  return JSON.parse(body) as JsonRecord
}

export const deployLakebedProjectFiles = async ({
  api,
  fetchImpl = fetch,
  files,
  inspectPolicy,
  log,
}: LakebedDeployInput): Promise<LakebedDeployResult> => {
  const buildStartedAt = Date.now()
  log?.('anonymous-request:start', summarizeFiles(files))
  const built = await buildLakebedAnonymousDeployRequest(files, {
    inspectPolicy,
    log,
  })
  log?.('anonymous-request:complete', {
    clientBundleBytes: built.clientBundleBytes,
    requestBodyBytes: built.requestBodyBytes,
    serverBundleBytes: built.serverBundleBytes,
    sourceFileCount: built.sourceFileCount,
    elapsedMs: Date.now() - buildStartedAt,
  })
  const deployApi = resolveDeployApiUrl(api)
  const postStartedAt = Date.now()
  log?.('post:start', {
    requestBodyBytes: built.requestBodyBytes,
    url: `${deployApi}/v1/anonymous-deploys`,
  })
  const response = await fetchImpl(`${deployApi}/v1/anonymous-deploys`, {
    body: built.requestBody,
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  log?.('post:response', {
    elapsedMs: Date.now() - postStartedAt,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  })
  const responseParseStartedAt = Date.now()
  log?.('post:json:start')
  const deployed = await readResponseJson(response)
  log?.('post:json:complete', {
    elapsedMs: Date.now() - responseParseStartedAt,
    responseKeys: Object.keys(deployed),
  })
  log?.('post:complete', {
    deployId: deployed.deployId,
    status: response.status,
    url: deployed.url,
    elapsedMs: Date.now() - postStartedAt,
  })

  return {
    deployId: String(deployed.deployId ?? ''),
    url: String(deployed.url ?? ''),
    updatedAt:
      typeof deployed.updatedAt === 'string' ? deployed.updatedAt : undefined,
    expiresAt:
      typeof deployed.expiresAt === 'string' ? deployed.expiresAt : undefined,
    claimUrl: typeof deployed.claimUrl === 'string' ? deployed.claimUrl : undefined,
    claimed: typeof deployed.claimed === 'boolean' ? deployed.claimed : undefined,
    inspectPolicy:
      typeof deployed.inspectPolicy === 'string'
        ? deployed.inspectPolicy
        : undefined,
    limits: isPlainObject(deployed.limits) ? deployed.limits : undefined,
    artifactHash: built.artifactHash,
    clientBundleHash: built.clientBundleHash,
    clientBundleBytes: built.clientBundleBytes,
    requestBodyBytes: built.requestBodyBytes,
    serverBundleBytes: built.serverBundleBytes,
    sourceFileCount: built.sourceFileCount,
  }
}

export const lakebedArtifactMediaType = ANONYMOUS_ARTIFACT_MEDIA_TYPE
