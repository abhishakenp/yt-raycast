import type { LakebedField } from '../types'

/** Build a string lakebed field with default ''. */
export function strField(seedFromProps: boolean): LakebedField {
  return { type: 'string', default: '', seedFromProps }
}

/** Build a number lakebed field with given default. */
export function numField(
  defaultValue: number,
  seedFromProps: boolean,
): LakebedField {
  return { type: 'number', default: defaultValue, seedFromProps }
}

/** Fields that should be numeric. */
const NUMERIC_FIELDS = new Set(['quantity', 'rating'])

/** Build a field for a given name — quantity/rating → number, else string. */
export function fieldFor(name: string, seedFromProps: boolean): LakebedField {
  return NUMERIC_FIELDS.has(name)
    ? numField(name === 'quantity' ? 1 : 0, seedFromProps)
    : strField(seedFromProps)
}

/** Build a fields record from a list of field names. */
export function buildFields(
  names: string[],
  seedFromProps: boolean,
): Record<string, LakebedField> {
  const fields: Record<string, LakebedField> = {}
  for (const name of names) fields[name] = fieldFor(name, seedFromProps)
  return fields
}

/** Capitalize the first letter of a name (menuItems → MenuItems). */
export function pascalCase(name: string): string {
  if (!name) return name
  return name.charAt(0).toUpperCase() + name.slice(1)
}
