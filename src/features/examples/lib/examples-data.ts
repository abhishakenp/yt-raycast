import { allCapsules } from '@ship-fast/blocks'
import {
  createDefaultItem,
  introspectCapsuleSchema,
  type CapsuleSchemaInfo,
  type CollectionField,
  type CollectionProp,
  type VariantOption,
} from '@ship-fast/blocks/capsules'
import { capsuleCategories } from '@ship-fast/blocks/generated'

import {
  getExampleCategories,
  getExampleCategory,
  labelFromExampleSlug,
  type ExampleCategory,
} from './examples-categories'

type CapsuleClient = {
  name: string
  props: unknown
}

type CapsuleRecord = {
  category: string
  componentName: string
  functionalType: string
  propsSchema: unknown
}

export type ExampleCapsule = {
  category: string
  componentName: string
  functionalType: string
  label: string
  source: string
}

export type ExampleCategorySite = {
  category: string
  label: string
  capsuleCount: number
  imageContextTitle: string
  source: string
}

const COMMON_TEXT_PROPS = [
  'brand',
  'badge',
  'eyebrow',
  'heading',
  'headingTop',
  'headingBottom',
  'headingLead',
  'headingAccent',
  'headline',
  'highlight',
  'title',
  'subtitle',
  'subheading',
  'description',
  'intro',
  'copy',
  'note',
  'tagline',
  'primaryCta',
  'secondaryCta',
  'cta',
  'ctaLabel',
  'buttonLabel',
  'submit',
  'imageAlt',
  'portraitAlt',
  'coverAlt',
  'avatarAlt',
  'founderAvatarAlt',
] as const

const COMMON_LIST_PROPS = [
  'nav',
  'links',
  'names',
  'badges',
  'features',
  'legal',
  'socials',
  'engines',
] as const

const SKIPPED_PROP_KEYS = new Set([
  'className',
  'homeTarget',
  'primaryTarget',
  'secondaryTarget',
  'ctaTarget',
  'contactTarget',
  'eventsTarget',
  'menuTarget',
  'href',
  'target',
])

const labelFromComponentName = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')

const isCapsuleClient = (value: unknown): value is CapsuleClient =>
  value !== null &&
  typeof value === 'object' &&
  'name' in value &&
  typeof value.name === 'string' &&
  'props' in value

const capsuleRecords = (): CapsuleRecord[] =>
  (allCapsules as readonly unknown[])
    .flatMap((value) => {
      if (!value || typeof value !== 'object' || !('client' in value)) {
        return []
      }
      const client = value.client
      if (!isCapsuleClient(client)) return []
      const categoryInfo = capsuleCategories[client.name]
      if (!categoryInfo) return []
      return [
        {
          category: categoryInfo.category,
          componentName: client.name,
          functionalType: categoryInfo.functionalType,
          propsSchema: client.props,
        },
      ]
    })
    .sort((left, right) =>
      left.componentName.localeCompare(right.componentName),
    )

const demoLabel = (category: string): string => labelFromExampleSlug(category)

const stringValueForKey = (
  key: string,
  category: string,
  componentName: string,
): string => {
  const label = demoLabel(category)
  const componentLabel = labelFromComponentName(componentName)
  const lowerKey = key.toLowerCase()

  if (lowerKey.includes('alt')) {
    return `${label} ${componentLabel} editorial image`
  }
  if (lowerKey.includes('brand')) return `${label} Studio`
  if (lowerKey.includes('eyebrow') || lowerKey.includes('badge')) {
    return `${label} example`
  }
  if (lowerKey.includes('heading') || lowerKey.includes('headline')) {
    return `${componentLabel} for ${label}`
  }
  if (lowerKey.includes('title')) return `${label} ${componentLabel}`
  if (lowerKey.includes('subtitle') || lowerKey.includes('subheading')) {
    return `A generated ${label.toLowerCase()} block preview using local demo content.`
  }
  if (lowerKey.includes('description') || lowerKey.includes('intro')) {
    return `Deterministic example copy for reviewing ${componentLabel} layout, spacing, imagery, and responsive behavior.`
  }
  if (lowerKey.includes('cta') || lowerKey.includes('button')) {
    return 'View example'
  }
  if (lowerKey.includes('phone')) return '(555) 013-7420'
  if (lowerKey.includes('email')) return 'hello@example.test'
  if (lowerKey.includes('price')) return '$29'
  if (lowerKey.includes('date')) return 'Jul 19'
  if (lowerKey.includes('time') || lowerKey.includes('hours')) {
    return 'Mon-Fri, 9am-6pm'
  }
  if (lowerKey.includes('location') || lowerKey.includes('address')) {
    return '123 Market Street'
  }
  if (lowerKey.includes('name')) return `${label} Item`
  if (lowerKey.includes('role')) return 'Design Lead'
  if (lowerKey.includes('quote')) {
    return `The ${label.toLowerCase()} examples make weak blocks obvious before they ship.`
  }

  return `${label} ${key}`
}

const numberValueForKey = (key: string, index = 0): number => {
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('rating')) return 5
  if (lowerKey.includes('column')) return 3
  if (lowerKey.includes('count')) return index + 3
  return index + 1
}

const arrayValueForKey = (key: string, category: string): string[] => {
  const label = demoLabel(category)
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('nav') || lowerKey.includes('link')) {
    return ['Overview', 'Examples', 'Pricing', 'Contact']
  }
  if (lowerKey.includes('feature')) {
    return [`${label} workflow`, 'Reusable blocks', 'Local previews']
  }
  if (lowerKey.includes('engine')) return ['OpenUI', 'Capsules', 'Renderer']
  return [`${label} One`, `${label} Two`, `${label} Three`]
}

const createCollectionItem = (
  collection: CollectionProp,
  category: string,
  componentName: string,
  index: number,
): Record<string, unknown> => {
  const item = createDefaultItem(collection)
  for (const field of collection.itemFields) {
    item[field.key] = valueForField(field, category, componentName, index)
  }
  return item
}

const valueForField = (
  field: CollectionField,
  category: string,
  componentName: string,
  index: number,
): unknown => {
  if (field.type === 'string') {
    return stringValueForKey(field.key, category, componentName)
  }
  if (field.type === 'number') return numberValueForKey(field.key, index)
  if (field.type === 'boolean') return index % 2 === 0
  if (field.type === 'array-string')
    return arrayValueForKey(field.key, category)
  return undefined
}

const optionValue = (option: VariantOption): string | number | boolean =>
  option.value

const generatedPropsForCapsule = (
  capsule: CapsuleRecord,
): Record<string, unknown> => {
  const schemaInfo: CapsuleSchemaInfo = introspectCapsuleSchema(
    capsule.propsSchema,
  )
  const props: Record<string, unknown> = {}

  for (const key of COMMON_TEXT_PROPS) {
    props[key] = stringValueForKey(key, capsule.category, capsule.componentName)
  }
  for (const key of COMMON_LIST_PROPS) {
    props[key] = arrayValueForKey(key, capsule.category)
  }
  for (const scalar of schemaInfo.scalars) {
    if (SKIPPED_PROP_KEYS.has(scalar.key)) continue
    props[scalar.key] =
      scalar.type === 'number'
        ? numberValueForKey(scalar.key)
        : stringValueForKey(scalar.key, capsule.category, capsule.componentName)
  }
  for (const variant of schemaInfo.variants) {
    if (SKIPPED_PROP_KEYS.has(variant.key)) continue
    const first = variant.options[0]
    if (first) props[variant.key] = optionValue(first)
  }
  for (const collection of schemaInfo.collections) {
    if (SKIPPED_PROP_KEYS.has(collection.key)) continue
    props[collection.key] = Array.from({ length: 3 }, (_, index) =>
      createCollectionItem(
        collection,
        capsule.category,
        capsule.componentName,
        index,
      ),
    )
  }

  return props
}

const variableNameForCapsule = (componentName: string): string =>
  componentName
    .replace(/[^A-Za-z0-9_$]/g, '_')
    .replace(/^([^A-Za-z_$])/, '_$1')
    .replace(/[A-Z]/g, (match, offset) =>
      offset === 0 ? match.toLowerCase() : `_${match.toLowerCase()}`,
    )

const anchorIdForCapsule = (category: string, componentName: string): string =>
  `${category}_${componentName}`
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const capsuleOrderRank = ({ functionalType }: CapsuleRecord): number => {
  const normalized = functionalType.toLowerCase()
  if (normalized === 'navbar') return 0
  if (normalized === 'header') return 1
  if (normalized === 'hero') return 2
  if (normalized === 'footer') return 100
  if (normalized.includes('cta')) return 90
  return 50
}

const sortCapsulesForSite = (capsules: CapsuleRecord[]): CapsuleRecord[] =>
  [...capsules].sort((left, right) => {
    const rankDelta = capsuleOrderRank(left) - capsuleOrderRank(right)
    return rankDelta === 0
      ? left.componentName.localeCompare(right.componentName)
      : rankDelta
  })

export const buildExampleOpenUISource = (
  capsule: Pick<
    CapsuleRecord,
    'category' | 'componentName' | 'functionalType' | 'propsSchema'
  >,
): string => {
  const variableName = variableNameForCapsule(capsule.componentName)
  const props = JSON.stringify(generatedPropsForCapsule(capsule))
  return `${variableName} = ${capsule.componentName}(${props})\nroot = Stack([${variableName}])`
}

export const buildExampleCategoryOpenUISource = (category: string): string => {
  const capsules = sortCapsulesForSite(
    capsuleRecords().filter((capsule) => capsule.category === category),
  )
  const statements: string[] = []
  const anchorNames: string[] = []

  for (const capsule of capsules) {
    const variableName = variableNameForCapsule(capsule.componentName)
    const anchorName = `${variableName}_anchor`
    const props = JSON.stringify(generatedPropsForCapsule(capsule))
    statements.push(`${variableName} = ${capsule.componentName}(${props})`)
    statements.push(
      `${anchorName} = SectionAnchor("${anchorIdForCapsule(category, capsule.componentName)}", ${variableName}, "scroll-mt-28")`,
    )
    anchorNames.push(anchorName)
  }

  statements.push(`home = Stack([${anchorNames.join(', ')}])`)
  statements.push('root = PageSwitch(["Home"], [home], "", {})')

  return statements.join('\n')
}

export const getExampleCategorySite = (
  category: string,
): ExampleCategorySite | undefined => {
  const categoryInfo = getExampleCategory(category)
  if (!categoryInfo) return undefined

  return {
    category,
    label: categoryInfo.label,
    capsuleCount: categoryInfo.capsuleCount,
    imageContextTitle: `${categoryInfo.label} examples`,
    source: buildExampleCategoryOpenUISource(category),
  }
}

export { getExampleCategories, getExampleCategory }
export type { ExampleCategory }

export const getExampleCapsules = (category: string): ExampleCapsule[] =>
  capsuleRecords()
    .filter((capsule) => capsule.category === category)
    .map((capsule) => ({
      category: capsule.category,
      componentName: capsule.componentName,
      functionalType: capsule.functionalType,
      label: labelFromComponentName(capsule.componentName),
      source: buildExampleOpenUISource(capsule),
    }))
