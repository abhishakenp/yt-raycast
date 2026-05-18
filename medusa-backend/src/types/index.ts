// Placeholder so tsc has at least one input (otherwise the Medusa build fails
// with TS18003 "No inputs were found"). Custom Medusa modules/api/workflows
// for this project's tenants would land in sibling src/ directories.
export type TenantContext = {
  sessionId: string
  publishableKey: string
}
