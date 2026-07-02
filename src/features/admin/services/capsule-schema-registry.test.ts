import { describe, expect, it } from 'vitest'

import { buildCapsuleSchemaRegistry } from './capsule-schema-registry'
import type { CapsuleSchemaRegistry } from './lakebed-admin-model'

describe('buildCapsuleSchemaRegistry', () => {
  it('returns a registry mapping capsule component names to their schemas', () => {
    const registry = buildCapsuleSchemaRegistry()

    expect(typeof registry).toBe('object')
    expect(Object.keys(registry).length).toBeGreaterThan(0)
  })

  it('includes schemas for fullstack capsules that have lakebed definitions', () => {
    const registry = buildCapsuleSchemaRegistry()

    // At least some capsules should have schemas with table definitions
    const capsulesWithSchemas = Object.entries(registry).filter(
      ([, schema]) => Object.keys(schema).length > 0,
    )
    expect(capsulesWithSchemas.length).toBeGreaterThan(0)

    // Each schema entry should have at least one table with fields
    for (const [, schema] of capsulesWithSchemas) {
      for (const tableDef of Object.values(schema)) {
        expect(tableDef.kind).toBe('table')
        expect(typeof tableDef.fields).toBe('object')
        expect(Object.keys(tableDef.fields).length).toBeGreaterThan(0)
      }
    }
  })

  it('produces schemas where field kinds are string, number, or boolean', () => {
    const registry = buildCapsuleSchemaRegistry()

    const validKinds = new Set(['string', 'number', 'boolean'])
    for (const schema of Object.values(registry)) {
      for (const tableDef of Object.values(schema)) {
        for (const field of Object.values(tableDef.fields)) {
          expect(validKinds.has(field.kind)).toBe(true)
        }
      }
    }
  })

  it('returns a registry that is compatible with CapsuleSchemaRegistry type', () => {
    const registry: CapsuleSchemaRegistry = buildCapsuleSchemaRegistry()

    // Type assertion passes at compile time; verify runtime shape
    for (const [componentName, schema] of Object.entries(registry)) {
      expect(typeof componentName).toBe('string')
      expect(typeof schema).toBe('object')
    }
  })

  it('includes the restaurant capsule schema with expected tables', () => {
    const registry = buildCapsuleSchemaRegistry()

    // Find a capsule that has a 'catalog' or 'orderItems' table (restaurant)
    const hasRestaurantSchema = Object.values(registry).some(
      (schema) => 'catalog' in schema || 'orderItems' in schema,
    )
    expect(hasRestaurantSchema).toBe(true)
  })

  it('includes the publication capsule schema with articles table', () => {
    const registry = buildCapsuleSchemaRegistry()

    const hasPublicationSchema = Object.values(registry).some(
      (schema) => 'articles' in schema,
    )
    expect(hasPublicationSchema).toBe(true)
  })
})
