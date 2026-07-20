export const isExamplesEnabled = (
  env: ImportMetaEnv = import.meta.env,
): boolean => {
  const value = env.VITE_DISABLE_CLERK
  return value === true || String(value).trim().toLowerCase() === 'true'
}
