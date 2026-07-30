import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type BundleAsset = {
  bytes: number
  name: string
  path: string
}

type AssetRule = {
  maxBytes: number
  pattern: RegExp
  requiredAbsentText?: string[]
}

type ForbiddenAssetRule = {
  pattern: RegExp
  reason: string
}

function mib(value: number) {
  return value * 1024 * 1024
}

const publicRules: AssetRule[] = [
  {
    pattern: /^-generate-dashboard-route-.+\.js$/,
    maxBytes: mib(0.25),
    requiredAbsentText: [
      'defineComponent',
      'reactExportSources',
      'component-spec',
      'react-export-sources',
    ],
  },
  { pattern: /^index-.+\.js$/, maxBytes: mib(0.9) },
  { pattern: /^OpenUIViewer-.+\.js$/, maxBytes: mib(0.25) },
  // The browser runtime intentionally owns the renderer/provider dependency
  // graph. Component implementations remain response-scoped chunks, while
  // the shared runtime has a measured 0.4 MiB ceiling.
  { pattern: /^openui-runtime-core-.+\.js$/, maxBytes: mib(0.4) },
  { pattern: /^openui-primitive-layout-.+\.js$/, maxBytes: mib(0.03) },
]

const serverRules: AssetRule[] = [
  {
    pattern: /^-generate-dashboard-route-.+\.mjs$/,
    maxBytes: mib(0.25),
    requiredAbsentText: [
      'defineComponent',
      'reactExportSources',
      'component-spec',
      'react-export-sources',
    ],
  },
  {
    pattern: /^router-.+\.mjs$/,
    maxBytes: mib(0.45),
    requiredAbsentText: [
      'reactExportSourcesBase64',
      'brotliDecompressSync',
      'require_typescript',
    ],
  },
  {
    pattern: /^openui-html-export-builder-.+\.mjs$/,
    maxBytes: mib(0.2),
    requiredAbsentText: [
      'reactExportSourcesBase64',
      'brotliDecompressSync',
      'require_typescript',
    ],
  },
  { pattern: /^openui-export-builder-.+\.mjs$/, maxBytes: mib(4) },
  { pattern: /^openui-runtime-core-.+\.mjs$/, maxBytes: mib(9) },
]

const anonymousChunkRules: AssetRule[] = [
  { pattern: /^src-.+\.(?:js|mjs)$/, maxBytes: mib(2) },
]

const optionalNamedChunkRules: AssetRule[] = [
  {
    pattern: /^openui-generated-metadata-.+\.(?:js|mjs)$/,
    maxBytes: mib(5.25),
  },
  { pattern: /^openui-prompt-spec-.+\.mjs$/, maxBytes: mib(2) },
  { pattern: /^openui-primitive-.+\.(?:js|mjs)$/, maxBytes: mib(0.2) },
  { pattern: /^openui-section-.+\.(?:js|mjs)$/, maxBytes: mib(0.25) },
  { pattern: /^openui-capsule-(?!index-).+\.(?:js|mjs)$/, maxBytes: mib(0.25) },
  // `runtime-library` keeps a server/test fallback for environments without
  // `import.meta.glob`. It can emit this lazy chunk, but it must stay within
  // the catalog budget. Presence alone cannot establish an eager import.
  { pattern: /^openui-capsule-index-.+\.(?:js|mjs)$/, maxBytes: mib(18) },
]

const forbiddenPublicAssetRules: ForbiddenAssetRule[] = [
  {
    pattern: /^openui-runtime-(?:capsules|sections|primitives).+\.js$/,
    reason: 'browser OpenUI runtime must keep on-demand chunks narrow',
  },
  {
    pattern: /^openui-(?:primitive|section|capsule)-.*-test-.+\.js$/,
    reason:
      'test files must not be bundled into production — import.meta.glob must exclude *.test.tsx',
  },
]

const forbiddenServerAssetRules: ForbiddenAssetRule[] = [
  {
    pattern: /^openui-(?:primitive|section|capsule)-.*-test-.+\.mjs$/,
    reason:
      'test files must not be bundled into production — import.meta.glob must exclude *.test.tsx',
  },
]

export function listAssets(dir: string): BundleAsset[] {
  if (!existsSync(dir)) {
    throw new Error(`Build asset directory does not exist: ${dir}`)
  }

  return readdirSync(dir)
    .filter((name) => /\.(m?js|css)$/.test(name))
    .map((name) => {
      const path = join(dir, name)
      return { bytes: statSync(path).size, name, path }
    })
}

export function verifyAssetRules(
  assets: BundleAsset[],
  rules: AssetRule[],
): string[] {
  const failures: string[] = []

  for (const rule of rules) {
    const matches = assets.filter((asset) => rule.pattern.test(asset.name))
    if (matches.length === 0) {
      failures.push(`Missing build asset matching ${rule.pattern}`)
      continue
    }

    for (const asset of matches) {
      if (asset.bytes > rule.maxBytes) {
        failures.push(
          `${asset.name} is ${asset.bytes} bytes; limit is ${rule.maxBytes}`,
        )
      }

      if (!rule.requiredAbsentText?.length) continue
      const source = readFileSync(asset.path, 'utf8')
      for (const token of rule.requiredAbsentText) {
        if (source.includes(token)) {
          failures.push(`${asset.name} contains forbidden token ${token}`)
        }
      }
    }
  }

  return failures
}

export function verifyOptionalAssetRules(
  assets: BundleAsset[],
  rules: AssetRule[],
): string[] {
  const failures: string[] = []

  for (const rule of rules) {
    const matches = assets.filter((asset) => rule.pattern.test(asset.name))
    for (const asset of matches) {
      if (asset.bytes <= rule.maxBytes) continue
      failures.push(
        `${asset.name} is ${asset.bytes} bytes; limit is ${rule.maxBytes}`,
      )
    }
  }

  return failures
}

export function verifyForbiddenAssetRules(
  assets: BundleAsset[],
  rules: ForbiddenAssetRule[],
): string[] {
  const failures: string[] = []

  for (const rule of rules) {
    for (const asset of assets) {
      if (rule.pattern.test(asset.name)) {
        failures.push(`${asset.name} is forbidden: ${rule.reason}`)
      }
    }
  }

  return failures
}

export function verifyBuildBundles(root = process.cwd()): void {
  const publicAssets = listAssets(join(root, '.output/public/assets'))
  const serverAssets = listAssets(join(root, '.output/server/_ssr'))
  const failures = [
    ...verifyAssetRules(publicAssets, publicRules),
    ...verifyAssetRules(serverAssets, serverRules),
    ...verifyOptionalAssetRules(publicAssets, anonymousChunkRules),
    ...verifyOptionalAssetRules(serverAssets, anonymousChunkRules),
    ...verifyOptionalAssetRules(publicAssets, optionalNamedChunkRules),
    ...verifyOptionalAssetRules(serverAssets, optionalNamedChunkRules),
    ...verifyForbiddenAssetRules(publicAssets, forbiddenPublicAssetRules),
    ...verifyForbiddenAssetRules(serverAssets, forbiddenServerAssetRules),
  ]

  if (failures.length > 0) {
    throw new Error(
      `Bundle boundary verification failed:\n- ${failures.join('\n- ')}`,
    )
  }

  console.log('Bundle boundary verification passed')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyBuildBundles()
}
