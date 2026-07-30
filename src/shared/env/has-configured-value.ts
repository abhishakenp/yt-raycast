import isEmpty from 'lodash/isEmpty'

export function hasConfiguredValue(value: string | undefined): boolean {
  return !isEmpty(value?.trim())
}
