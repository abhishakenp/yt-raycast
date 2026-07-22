import { capsuleCategories } from '@ship-fast/blocks/generated'

export type ExampleCategory = {
  category: string
  label: string
  capsuleCount: number
  functionalTypes: string[]
}

const labelFromSlug = (value: string): string =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const labelFromExampleSlug = labelFromSlug

export const getExampleCategories = (): ExampleCategory[] => {
  const groups = new Map<
    string,
    { capsuleCount: number; functionalTypes: Set<string> }
  >()

  for (const categoryInfo of Object.values(capsuleCategories)) {
    const current = groups.get(categoryInfo.category) ?? {
      capsuleCount: 0,
      functionalTypes: new Set<string>(),
    }
    current.capsuleCount += 1
    current.functionalTypes.add(categoryInfo.functionalType)
    groups.set(categoryInfo.category, current)
  }

  return [...groups.entries()]
    .map(([category, group]) => ({
      category,
      label: labelFromSlug(category),
      capsuleCount: group.capsuleCount,
      functionalTypes: [...group.functionalTypes].sort((left, right) =>
        left.localeCompare(right),
      ),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

export const getExampleCategory = (
  category: string,
): ExampleCategory | undefined =>
  getExampleCategories().find((item) => item.category === category)

export const hasExampleCategory = (category: string): boolean =>
  getExampleCategory(category) !== undefined
