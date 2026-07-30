import { brotliCompressSync, constants } from 'node:zlib'
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'
import ts from 'typescript'
import { createGeneratedIndexSource } from '../../../scripts/generated-entrypoint-bootstrap.mjs'

const root = join(fileURLToPath(new URL('..', import.meta.url)))
const repoRoot = join(root, '..', '..')
const nodeModulesRoot = join(repoRoot, 'node_modules')
const registryRoot = join(root, 'src', 'registry')
const capsulesRoot = join(root, 'src', 'capsules')
const motifsRoot = join(root, 'src', 'motifs')
const primitivesRoot = join(root, 'src', 'primitives')
const blockSourceRoots = [
  join(root, 'src', 'components'),
  join(root, 'src', 'hooks'),
  join(root, 'src', 'lib'),
  join(root, 'src', 'section-kit'),
]
const helperSourceRoots = [
  registryRoot,
  capsulesRoot,
  motifsRoot,
  primitivesRoot,
]
const outFile = join(root, 'src', 'generated', 'react-export-sources.json')
const generatedIndexOutFile = join(root, 'src', 'generated', 'index.ts')
const compressedOutFile = join(
  root,
  'src',
  'generated',
  'react-export-sources.compressed.ts',
)
const compressedSourceFilesOutFile = join(
  root,
  'src',
  'generated',
  'block-source-files.compressed.ts',
)
const compressedVendorSourceFilesOutFile = join(
  root,
  'src',
  'generated',
  'vendor-source-files.compressed.ts',
)
const runtimeLoadersOutFile = join(
  root,
  'src',
  'generated',
  'runtime-component-loaders.ts',
)
const runtimeNamesOutFile = join(
  root,
  'src',
  'generated',
  'runtime-component-names.ts',
)
const runtimeSectionNamesOutFile = join(
  root,
  'src',
  'generated',
  'runtime-section-component-names.ts',
)
const capsuleCategoriesOutFile = join(
  root,
  'src',
  'generated',
  'capsule-categories.ts',
)
const provenanceOutFile = join(
  root,
  'src',
  'generated',
  'react-export-sources.provenance.json',
)
const runtimeLoadersDir = join(root, 'src', 'generated')
const isCheckMode = process.argv.includes('--check')
const generatorPath =
  'packages/ship-fast-blocks/scripts/generate-react-export-sources.mjs'

const pendingWrites = []

const queueWrite = (path, source) => {
  pendingWrites.push({ path, source })
}

const formatGeneratedSource = async (path, source) => {
  const config = await prettier.resolveConfig(path)
  return prettier.format(source, { ...config, filepath: path })
}

const flushWrites = async () => {
  const writes = await Promise.all(
    pendingWrites.map(async ({ path, source }) => ({
      path,
      source: await formatGeneratedSource(path, source),
    })),
  )

  if (isCheckMode) {
    const drifted = writes
      .filter(
        ({ path, source }) =>
          !existsSync(path) || readFileSync(path, 'utf8') !== source,
      )
      .map(({ path }) => relative(root, path))

    if (drifted.length > 0) {
      throw new Error(
        `Generated OpenUI artifacts are out of date. Run bun run generate:react-export-sources.\n- ${drifted.join('\n- ')}`,
      )
    }

    console.log('Generated OpenUI artifacts are current')
    return
  }

  for (const { path, source } of writes) {
    writeFileSync(path, source)
  }
}

const walk = (dir, files = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(path, files)
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(path)
    }
  }
  return files
}

const walkSourceFiles = (dir, files = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkSourceFiles(path, files)
    } else if (
      entry.isFile() &&
      /\.(?:css|tsx?|jsx?|json)$/.test(entry.name) &&
      !/\.(?:test|spec)\.(?:tsx?|jsx?)$/.test(entry.name)
    ) {
      files.push(path)
    }
  }
  return files
}

const toPosixPath = (value) => value.replaceAll('\\', '/')

const fileWithExtension = (base) => {
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
    join(base, 'index.js'),
    join(base, 'index.jsx'),
    join(base, 'index.mjs'),
    join(base, 'index.cjs'),
    join(base, 'package.json'),
  ]
  return (
    candidates.find((path) => {
      try {
        return statSync(path).isFile()
      } catch {
        return false
      }
    }) ?? null
  )
}

const readPublicPackageName = (specifier) => {
  if (specifier.startsWith('.') || specifier.startsWith('/')) return null
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/')
    return scope && name ? `${scope}/${name}` : null
  }
  return specifier.split('/')[0] ?? null
}

const packageSubpath = (specifier, packageName) =>
  specifier === packageName ? '.' : `.${specifier.slice(packageName.length)}`

const exportedPackagePath = (exportTarget, subpath = '.') => {
  if (typeof exportTarget === 'string') {
    if (exportTarget.includes('*') && subpath.startsWith('./')) {
      return exportTarget.replace('*', subpath.slice(2))
    }
    return exportTarget
  }
  if (!exportTarget || typeof exportTarget !== 'object') return null
  return (
    exportedPackagePath(exportTarget.import, subpath) ??
    exportedPackagePath(exportTarget.default, subpath) ??
    exportedPackagePath(exportTarget.browser, subpath) ??
    null
  )
}

const resolvePackageExportTarget = (exports, subpath) => {
  if (subpath === '.') {
    return typeof exports === 'object' ? exports['.'] : exports
  }
  if (!exports || typeof exports !== 'object') return null
  if (exports[subpath]) return exports[subpath]
  for (const [key, value] of Object.entries(exports)) {
    if (!key.includes('*')) continue
    const [prefix, suffix = ''] = key.split('*')
    if (subpath.startsWith(prefix) && subpath.endsWith(suffix)) return value
  }
  return null
}

const resolveBareImportFile = (specifier) => {
  const packageName = readPublicPackageName(specifier)
  if (!packageName) return null
  const packageJsonPath = join(nodeModulesRoot, packageName, 'package.json')
  if (!existsSync(packageJsonPath)) return null
  const packageRoot = dirname(packageJsonPath)
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const subpath = packageSubpath(specifier, packageName)
  const exportTarget = resolvePackageExportTarget(packageJson.exports, subpath)
  const exported = exportedPackagePath(exportTarget, subpath)
  const candidate =
    exported ??
    (subpath === '.' ? (packageJson.module ?? packageJson.main) : subpath)
  if (!candidate) return null
  const resolved = fileWithExtension(join(packageRoot, candidate))
  if (resolved && !resolved.endsWith('/package.json')) return resolved

  if (resolved?.endsWith('/package.json')) {
    storeVendorSourceFile(resolved)
    const nestedPackageJson = JSON.parse(readFileSync(resolved, 'utf8'))
    const nestedCandidate =
      nestedPackageJson.module ??
      nestedPackageJson['jsnext:main'] ??
      nestedPackageJson.main
    return nestedCandidate
      ? fileWithExtension(join(dirname(resolved), nestedCandidate))
      : null
  }

  const nestedPackageJsonPath = join(packageRoot, candidate, 'package.json')
  if (!existsSync(nestedPackageJsonPath)) return null
  storeVendorSourceFile(nestedPackageJsonPath)
  const nestedPackageJson = JSON.parse(
    readFileSync(nestedPackageJsonPath, 'utf8'),
  )
  const nestedCandidate =
    nestedPackageJson.module ??
    nestedPackageJson['jsnext:main'] ??
    nestedPackageJson.main
  return nestedCandidate
    ? fileWithExtension(join(dirname(nestedPackageJsonPath), nestedCandidate))
    : null
}

const allowedRuntimeBareImports = new Set([
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'preact',
  'preact/hooks',
  'preact/compat',
  'preact/jsx-runtime',
  'preact/jsx-dev-runtime',
])
const ignoredSourceBareImports = new Set([
  ...allowedRuntimeBareImports,
  '@openuidev/react-lang',
  'zod',
  'zod/v4',
  // Provided as a real npm dependency in exports (see dependencyVersions in
  // openui-export-builder.ts) and resolved by vite in the preview runtime —
  // never vendored as source.
  'framer-motion',
])

const vendorSourceManifest = {}
const seenVendorSourceFiles = new Set()
const storedVendorSourceFiles = new Set()

const parseSourceFile = (path, source) =>
  ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    /\.(tsx|jsx)$/.test(path) ? ts.ScriptKind.TSX : ts.ScriptKind.JS,
  )

const importRequestsFromSource = (path, source) => {
  const sourceFile = parseSourceFile(path, source)
  const requests = []

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const specifier = statement.moduleSpecifier
      if (!ts.isStringLiteral(specifier)) continue
      const clause = statement.importClause
      const namedBindings = clause?.namedBindings
      const named =
        namedBindings && ts.isNamedImports(namedBindings)
          ? namedBindings.elements.map(
              (element) => (element.propertyName ?? element.name).text,
            )
          : null
      requests.push({
        moduleName: specifier.text,
        names: clause?.name || !named ? null : named,
      })
      continue
    }

    if (ts.isExportDeclaration(statement)) {
      const specifier = statement.moduleSpecifier
      if (!specifier || !ts.isStringLiteral(specifier)) continue
      const exportClause = statement.exportClause
      const names =
        exportClause && ts.isNamedExports(exportClause)
          ? exportClause.elements.map(
              (element) => (element.propertyName ?? element.name).text,
            )
          : null
      requests.push({ moduleName: specifier.text, names })
    }
  }

  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require'
    ) {
      const [argument] = node.arguments
      if (argument && ts.isStringLiteral(argument)) {
        requests.push({ moduleName: argument.text, names: null })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  return requests
}

const resolveRelativeVendorFile = (sourcePath, moduleName) =>
  fileWithExtension(join(dirname(sourcePath), moduleName))

const storeVendorSourceFile = (file) => {
  const sourcePath = fileWithExtension(file) ?? file
  if (!existsSync(sourcePath)) return null
  const rel = toPosixPath(relative(nodeModulesRoot, sourcePath))
  if (rel.startsWith('..')) return null
  if (!storedVendorSourceFiles.has(rel)) {
    vendorSourceManifest[rel] = readFileSync(sourcePath, 'utf8')
    storedVendorSourceFiles.add(rel)
  }
  return { rel, sourcePath }
}

const includeVendorImport = (specifier, names = null) => {
  const packageName = readPublicPackageName(specifier)
  if (!packageName) return
  const packageJsonPath = join(nodeModulesRoot, packageName, 'package.json')
  if (existsSync(packageJsonPath)) includeVendorSourceFile(packageJsonPath)
  const entry = resolveBareImportFile(specifier)
  if (!entry) return

  if (!names || names.length === 0) {
    includeVendorSourceFile(entry)
    return
  }

  storeVendorSourceFile(entry)
  if (!includeVendorNamedExports(entry, new Set(names))) {
    includeVendorSourceFile(entry)
  }
}

const includeVendorSourceFile = (file) => {
  const stored = storeVendorSourceFile(file)
  if (!stored || seenVendorSourceFiles.has(stored.rel)) return
  const { rel, sourcePath } = stored
  seenVendorSourceFiles.add(rel)

  const source = vendorSourceManifest[rel]
  if (!/\.(?:cjs|mjs|js|jsx|ts|tsx)$/.test(rel)) return

  for (const { moduleName, names } of importRequestsFromSource(rel, source)) {
    if (allowedRuntimeBareImports.has(moduleName)) continue
    if (moduleName.startsWith('.')) {
      const target = resolveRelativeVendorFile(sourcePath, moduleName)
      if (target) includeVendorSourceFile(target)
      continue
    }
    includeVendorImport(moduleName, names)
  }
}

const includeVendorNamedExports = (entry, requestedNames, seen = new Set()) => {
  const sourcePath = fileWithExtension(entry)
  if (!sourcePath || seen.has(sourcePath)) return false
  seen.add(sourcePath)

  const source = readFileSync(sourcePath, 'utf8')
  const sourceFile = parseSourceFile(sourcePath, source)
  const namespaceImports = new Map()
  const unresolved = new Set(requestedNames)

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    const bindings = statement.importClause?.namedBindings
    if (
      !ts.isStringLiteral(specifier) ||
      !bindings ||
      !ts.isNamespaceImport(bindings)
    ) {
      continue
    }
    namespaceImports.set(bindings.name.text, specifier.text)
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) continue
    const exportClause = statement.exportClause

    if (
      !exportClause &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const moduleName = statement.moduleSpecifier.text
      const target = moduleName.startsWith('.')
        ? resolveRelativeVendorFile(sourcePath, moduleName)
        : resolveBareImportFile(moduleName)
      if (target && includeVendorNamedExports(target, unresolved, seen)) {
        unresolved.clear()
        break
      }
      continue
    }

    if (!exportClause || !ts.isNamedExports(exportClause)) continue

    for (const element of exportClause.elements) {
      const exportedName = element.name.text
      if (!unresolved.has(exportedName)) continue
      const localName = (element.propertyName ?? element.name).text
      const moduleSpecifier = statement.moduleSpecifier

      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const moduleName = moduleSpecifier.text
        const target = moduleName.startsWith('.')
          ? resolveRelativeVendorFile(sourcePath, moduleName)
          : resolveBareImportFile(moduleName)
        if (target) includeVendorSourceFile(target)
        unresolved.delete(exportedName)
        continue
      }

      const namespaceModule = namespaceImports.get(localName)
      if (namespaceModule) {
        includeVendorImport(namespaceModule)
        unresolved.delete(exportedName)
      }
    }
  }
  return unresolved.size === 0
}

const componentRe =
  /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*defineCapsule\s*\(/g
const manifest = {}
const loaderEntries = []

const hasExportedComponentFactory = (source) => {
  componentRe.lastIndex = 0
  return componentRe.test(source)
}

for (const sourceRoot of [
  registryRoot,
  capsulesRoot,
  motifsRoot,
  primitivesRoot,
]) {
  for (const file of walk(sourceRoot)) {
    const source = readFileSync(file, 'utf8')
    componentRe.lastIndex = 0
    for (const match of source.matchAll(componentRe)) {
      const name = match[1]
      const sourceFile = relative(root, file).replaceAll('\\', '/')
      manifest[name] = {
        file: sourceFile,
        source,
      }
      loaderEntries.push({
        name,
        sourceFile: relative(runtimeLoadersDir, file).replaceAll('\\', '/'),
        isSection:
          toPosixPath(file).includes('/registry/sections/') ||
          toPosixPath(file).includes('/motifs/'),
      })
    }
  }
}

const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`
const compressedManifest = brotliCompressSync(Buffer.from(manifestJson), {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
}).toString('base64')
const sourceFileManifest = {}
const storeBlockSourceFile = (file) => {
  sourceFileManifest[relative(root, file).replaceAll('\\', '/')] = readFileSync(
    file,
    'utf8',
  )
}

for (const sourceRoot of blockSourceRoots) {
  for (const file of walkSourceFiles(sourceRoot)) {
    storeBlockSourceFile(file)
  }
}
for (const sourceRoot of helperSourceRoots) {
  for (const file of walkSourceFiles(sourceRoot)) {
    const source = readFileSync(file, 'utf8')
    if (hasExportedComponentFactory(source)) continue
    sourceFileManifest[relative(root, file).replaceAll('\\', '/')] = source
  }
}
const sourceFileManifestJson = `${JSON.stringify(sourceFileManifest, null, 2)}\n`
const compressedSourceFileManifest = brotliCompressSync(
  Buffer.from(sourceFileManifestJson),
  {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  },
).toString('base64')
const sourceManifestSources = [
  ...Object.values(manifest).map((entry) => entry.source),
  ...Object.values(sourceFileManifest),
]

for (const source of sourceManifestSources) {
  for (const { moduleName, names } of importRequestsFromSource(
    'ship-fast-source.tsx',
    source,
  )) {
    if (
      moduleName.startsWith('.') ||
      moduleName.startsWith('#/') ||
      ignoredSourceBareImports.has(moduleName)
    ) {
      continue
    }
    includeVendorImport(moduleName, names)
  }
}

const vendorSourceFileManifestJson = `${JSON.stringify(vendorSourceManifest, null, 2)}\n`
const compressedVendorSourceFileManifest = brotliCompressSync(
  Buffer.from(vendorSourceFileManifestJson),
  {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  },
).toString('base64')

queueWrite(outFile, manifestJson)
queueWrite(generatedIndexOutFile, createGeneratedIndexSource())
queueWrite(
  compressedOutFile,
  `// This file is generated by ${generatorPath}.\nexport const reactExportSourcesEncoding = 'br+base64' as const\nexport const reactExportSourcesBase64 = '${compressedManifest}' as const\n`,
)
queueWrite(
  compressedSourceFilesOutFile,
  `// This file is generated by ${generatorPath}.\nexport const blockSourceFilesEncoding = 'br+base64' as const\nexport const blockSourceFilesBase64 = '${compressedSourceFileManifest}' as const\n`,
)
queueWrite(
  compressedVendorSourceFilesOutFile,
  `// This file is generated by ${generatorPath}.\nexport const vendorSourceFilesEncoding = 'br+base64' as const\nexport const vendorSourceFilesBase64 = '${compressedVendorSourceFileManifest}' as const\n`,
)
const runtimeEntries = loaderEntries.sort((a, b) =>
  a.name.localeCompare(b.name),
)
const sectionEntries = runtimeEntries.filter((entry) => entry.isSection)
const generatedOutputs = [
  relative(root, outFile),
  relative(root, generatedIndexOutFile),
  relative(root, compressedOutFile),
  relative(root, compressedSourceFilesOutFile),
  relative(root, compressedVendorSourceFilesOutFile),
  relative(root, runtimeLoadersOutFile),
  relative(root, runtimeNamesOutFile),
  relative(root, runtimeSectionNamesOutFile),
  relative(root, capsuleCategoriesOutFile),
  relative(root, provenanceOutFile),
].map((path) => path.replaceAll('\\', '/'))
const provenance = {
  generatorVersion: 1,
  generatedBy: generatorPath,
  sourceRoots: [
    relative(root, registryRoot).replaceAll('\\', '/'),
    relative(root, capsulesRoot).replaceAll('\\', '/'),
    relative(root, motifsRoot).replaceAll('\\', '/'),
    relative(root, primitivesRoot).replaceAll('\\', '/'),
  ],
  outputs: generatedOutputs,
  componentCount: runtimeEntries.length,
  sectionComponentCount: sectionEntries.length,
  components: runtimeEntries.map(({ name, sourceFile }) => ({
    name,
    sourceFile: join('src', 'generated', sourceFile).replaceAll('\\', '/'),
  })),
}
const runtimeNamesSource = [
  `// This file is generated by ${generatorPath}.`,
  'export const runtimeComponentNames = [',
  ...runtimeEntries.map(({ name }) => `  ${JSON.stringify(name)},`),
  '] as const',
  '',
  'export type RuntimeComponentName = typeof runtimeComponentNames[number]',
  '',
].join('\n')
const runtimeSectionNamesSource = [
  `// This file is generated by ${generatorPath}.`,
  '// Names of static section capsules (registry/sections/**). These are wrapped',
  '// at runtime-library build time to become realtime + admin-editable without',
  '// modifying the section components themselves.',
  'export const runtimeSectionComponentNames = [',
  ...sectionEntries.map(({ name }) => `  ${JSON.stringify(name)},`),
  '] as const',
  '',
  'export const runtimeSectionComponentNameSet: ReadonlySet<string> = new Set(',
  '  runtimeSectionComponentNames,',
  ')',
  '',
  'export type RuntimeSectionComponentName =',
  '  typeof runtimeSectionComponentNames[number]',
  '',
].join('\n')
const runtimeLoadersSource = [
  `// This file is generated by ${generatorPath}.`,
  "import type { ShipFastCapsule } from '../capsules/openui.ts'",
  "import { isCapsule } from '../capsules/openui.ts'",
  "import { runtimeComponentNames, type RuntimeComponentName } from './runtime-component-names.ts'",
  "export { runtimeComponentNames, type RuntimeComponentName } from './runtime-component-names.ts'",
  '',
  'type RuntimeComponentModule = Record<string, unknown>',
  'type RuntimeComponentLoader = () => Promise<ShipFastCapsule>',
  '',
  'const runtimeComponentModules = import.meta.glob<RuntimeComponentModule>([',
  "  '../registry/primitives/**/*.tsx',",
  "  '!../registry/primitives/**/*.test.tsx',",
  "  '../registry/sections/**/*.tsx',",
  "  '!../registry/sections/**/*.test.tsx',",
  "  '../motifs/**/*.tsx',",
  "  '!../motifs/**/*.test.tsx',",
  "  '../primitives/**/*.tsx',",
  "  '!../primitives/**/*.test.tsx',",
  '])',
  '',
  'const toCapsule = (module: RuntimeComponentModule, name: string): ShipFastCapsule => {',
  '  const exported = module[name]',
  '  if (isCapsule(exported)) return exported',
  '  throw new Error(`Runtime component "${name}" must be exported with defineCapsule`)',
  '}',
  '',
  'const runtimeComponentModulePaths = {',
  ...runtimeEntries.map(
    ({ name, sourceFile }) =>
      `  ${JSON.stringify(name)}: ${JSON.stringify(sourceFile.startsWith('.') ? sourceFile : `./${sourceFile}`)},`,
  ),
  '} as const satisfies Record<RuntimeComponentName, string>',
  '',
  'const loadRuntimeComponentModule = (',
  '  name: RuntimeComponentName,',
  '): Promise<ShipFastCapsule> => {',
  '  const sourceFile = runtimeComponentModulePaths[name]',
  '  const loadModule = runtimeComponentModules[sourceFile]',
  '  if (!loadModule) {',
  '    return Promise.reject(',
  '      new Error(`Runtime component "${name}" has no module loader for ${sourceFile}`),',
  '    )',
  '  }',
  '  return loadModule().then((module) => toCapsule(module, name))',
  '}',
  '',
  'export const runtimeComponentLoaders = Object.fromEntries(',
  '  runtimeComponentNames.map((name) => [',
  '    name,',
  '    (() => loadRuntimeComponentModule(name)) satisfies RuntimeComponentLoader,',
  '  ]),',
  ') as Record<RuntimeComponentName, RuntimeComponentLoader>',
  '',
].join('\n')
// Extract category (directory under sections/) + functional type (suffix from name)
// for each capsule. Used by the AI section edit flow to find similar capsules.
const extractCategory = (file, name) => {
  const parts = toPosixPath(file).split('/')
  const sectionsIdx = parts.indexOf('sections')
  if (sectionsIdx >= 0 && parts[sectionsIdx + 1]) {
    return parts[sectionsIdx + 1]
  }
  // Primitives or capsules root — use 'primitives' or 'core'
  if (parts.includes('primitives')) return 'primitives'
  return 'core'
}

const extractFunctionalType = (name) => {
  // Try to match known suffixes from the capsule name
  const knownTypes = [
    'Navbar',
    'Hero',
    'Footer',
    'Pricing',
    'Features',
    'Testimonials',
    'FAQ',
    'Contact',
    'About',
    'Stats',
    'CTA',
    'Gallery',
    'Team',
    'Blog',
    'Shop',
    'Cart',
    'Checkout',
    'Login',
    'Signup',
    'Subscribe',
    'Newsletter',
    'Steps',
    'Process',
    'Logos',
    'Story',
    'Services',
    'Products',
    'Menu',
    'Content',
    'Section',
    'Grid',
    'List',
    'Card',
    'Banner',
    'Promo',
    'Social',
    'Links',
    'Brand',
    'Main',
    'Body',
    'Sidebar',
    'Header',
    'Nav',
    'Page',
    'Layout',
    'Wrapper',
    'Container',
    'Panel',
    'Modal',
    'Dialog',
    'Sheet',
    'Tab',
    'Accordion',
    'Table',
    'Form',
    'Input',
    'Button',
    'Badge',
    'Avatar',
    'Alert',
    'Toast',
    'Tooltip',
    'Popover',
    'Command',
    'Calendar',
    'Carousel',
    'Chart',
    'Map',
    'Video',
    'Audio',
    'Image',
    'Icon',
    'Text',
    'Heading',
    'Spacer',
    'Divider',
    'Separator',
    'Progress',
    'Skeleton',
    'Spinner',
    'Loader',
    'Toggle',
    'Switch',
    'Checkbox',
    'Radio',
    'Select',
    'Slider',
    'DatePicker',
    'AspectRatio',
    'ScrollArea',
  ]
  for (const type of knownTypes) {
    if (name.endsWith(type)) return type
  }
  return 'Generic'
}

const capsuleCategories = {}
for (const [name, entry] of Object.entries(manifest)) {
  const category = extractCategory(entry.file, name)
  // `primitives` are the generation engine's raw building blocks (Button, Card,
  // Stack, Dialog…). They stay in component-spec.json for the engine, but are
  // NOT a browsable example site — omit them from the capsule category catalog
  // so they never surface as an examples category or similar-capsule target.
  if (category === 'primitives') continue
  capsuleCategories[name] = {
    category,
    functionalType: extractFunctionalType(name),
  }
}

const capsuleCategoriesSource = [
  `// This file is generated by ${generatorPath}.`,
  '// Maps each capsule to its directory category + functional type.',
  '// Used by the AI section edit flow to find similar capsules.',
  'export const capsuleCategories: Record<string, { category: string; functionalType: string }> = {',
  ...Object.entries(capsuleCategories).map(
    ([name, info]) =>
      `  ${JSON.stringify(name)}: { category: ${JSON.stringify(info.category)}, functionalType: ${JSON.stringify(info.functionalType)} },`,
  ),
  '}',
  '',
  '/** Find similar capsule names by directory category + functional type. */',
  'export const findSimilarCapsules = (',
  '  capsuleName: string,',
  '  limit = 8,',
  '): string[] => {',
  '  const info = capsuleCategories[capsuleName]',
  '  if (!info) return []',
  '  const sameCategory = Object.entries(capsuleCategories)',
  '    .filter(([name, cat]) => name !== capsuleName && cat.category === info.category)',
  '    .map(([name]) => name)',
  '  const sameType = Object.entries(capsuleCategories)',
  '    .filter(([name, cat]) => name !== capsuleName && cat.functionalType === info.functionalType)',
  '    .map(([name]) => name)',
  '  // Deduplicate: category matches first, then type matches',
  '  const seen = new Set<string>()',
  '  const result: string[] = []',
  '  for (const name of [...sameCategory, ...sameType]) {',
  '    if (!seen.has(name)) {',
  '      seen.add(name)',
  '      result.push(name)',
  '      if (result.length >= limit) break',
  '    }',
  '  }',
  '  return result',
  '}',
  '',
].join('\n')

queueWrite(provenanceOutFile, `${JSON.stringify(provenance, null, 2)}\n`)
queueWrite(runtimeNamesOutFile, runtimeNamesSource)
queueWrite(runtimeSectionNamesOutFile, runtimeSectionNamesSource)
queueWrite(runtimeLoadersOutFile, runtimeLoadersSource)
queueWrite(capsuleCategoriesOutFile, capsuleCategoriesSource)
await flushWrites()

if (!isCheckMode) {
  console.log(
    `Wrote ${Object.keys(manifest).length} component sources to ${relative(root, outFile)}`,
  )
  console.log(
    `Wrote generated package entrypoint to ${relative(root, generatedIndexOutFile)}`,
  )
  console.log(
    `Wrote compressed component sources to ${relative(root, compressedOutFile)}`,
  )
  console.log(
    `Wrote compressed block source files to ${relative(root, compressedSourceFilesOutFile)}`,
  )
  console.log(
    `Wrote compressed vendor source files to ${relative(root, compressedVendorSourceFilesOutFile)}`,
  )
  console.log(
    `Wrote runtime component names to ${relative(root, runtimeNamesOutFile)}`,
  )
  console.log(
    `Wrote runtime component loaders to ${relative(root, runtimeLoadersOutFile)}`,
  )
  console.log(
    `Wrote generated artifact provenance to ${relative(root, provenanceOutFile)}`,
  )
}
