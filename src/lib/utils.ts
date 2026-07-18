type ClassValue =
  | string
  | number
  | bigint
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>

function flattenClassValue(value: ClassValue): string[] {
  if (value == null || value === false) return []
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return [String(value)]
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenClassValue)
  }
  return Object.entries(value)
    .filter(([, v]) => v)
    .map(([k]) => k)
}

export function cn(...inputs: ClassValue[]) {
  return flattenClassValue(inputs).filter(Boolean).join(' ')
}
