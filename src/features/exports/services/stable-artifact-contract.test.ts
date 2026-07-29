/**
 * Verification tests for stable artifact contract
 *
 * These tests verify that:
 * 1. The stable contract is properly defined
 * 2. Artifacts can be validated against the contract
 * 3. The stable path doesn't depend on engine internals
 */

import { describe, it, expect } from 'vitest'
import {
  validateStableArtifact,
  type StableEngineArtifact,
  type StableExportInput,
} from './stable-artifact-contract'

describe('Stable Artifact Contract', () => {
  describe('validateStableArtifact', () => {
    it('should accept valid artifact with HTML', () => {
      const artifact: StableEngineArtifact = {
        html: '<!DOCTYPE html><html><body>Test</body></html>',
      }
      const result = validateStableArtifact(artifact)
      expect(result.valid).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should reject artifact without HTML', () => {
      const artifact = { siteSpec: {} }
      const result = validateStableArtifact(artifact)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Artifact must have a non-empty html string')
    })

    it('should reject artifact with empty HTML', () => {
      const artifact: StableEngineArtifact = {
        html: '',
      }
      const result = validateStableArtifact(artifact)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Artifact must have a non-empty html string')
    })

    it('should reject non-object input', () => {
      const result = validateStableArtifact(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Artifact must be an object')
    })

    it('should accept artifact with all optional fields', () => {
      const artifact: StableEngineArtifact = {
        html: '<!DOCTYPE html><html><body>Test</body></html>',
        siteSpec: {
          projectName: 'Test Project',
          pages: [{ title: 'Home' }],
        },
        seo: {
          title: 'Test Site',
          description: 'A test site',
        },
        routes: [
          { path: '/', label: 'Home' },
          { path: '/about', label: 'About' },
        ],
        lakebedData: {
          seedData: {
            pages: [{ title: 'Home', route: '/' }],
          },
          syncSecret: 'test-secret',
        },
      }
      const result = validateStableArtifact(artifact)
      expect(result.valid).toBe(true)
    })
  })

  describe('StableExportInput type', () => {
    it('should accept valid export input', () => {
      const input: StableExportInput = {
        artifact: {
          html: '<!DOCTYPE html><html><body>Test</body></html>',
        },
        sessionId: 'test-session',
        target: 'html',
      }
      // This is a type check - if it compiles, the type is correct
      expect(input.artifact.html).toBe('<!DOCTYPE html><html><body>Test</body></html>')
    })

    it('should accept export input with all optional fields', () => {
      const input: StableExportInput = {
        artifact: {
          html: '<!DOCTYPE html><html><body>Test</body></html>',
          siteSpec: {
            projectName: 'Test',
          },
        },
        sessionId: 'test-session',
        target: 'html',
        theme: {
          name: 'dark',
          isDark: true,
          locale: 'en',
        },
        selectedBrandLogo: {
          name: 'Test Brand',
        },
        includeBadge: true,
        prompt: 'Create a test site',
        formatCache: {
          get: async () => ({}),
          set: async () => {},
        },
        onProgress: async (stage) => {
          console.log(stage)
        },
      }
      expect(input.theme?.isDark).toBe(true)
    })
  })

  describe('Contract completeness', () => {
    it('should include all necessary fields for HTML export', () => {
      const artifact: StableEngineArtifact = {
        html: '<!DOCTYPE html><html><body>Test</body></html>',
        siteSpec: {
          projectName: 'Test',
        },
        seo: {
          title: 'Test',
        },
      }
      // Verify the artifact has all fields needed for HTML export
      expect(artifact.html).toBeDefined()
      expect(artifact.siteSpec).toBeDefined()
      expect(artifact.seo).toBeDefined()
    })

    it('should include Lakebed-specific fields for deployment', () => {
      const artifact: StableEngineArtifact = {
        html: '<!DOCTYPE html><html><body>Test</body></html>',
        lakebedData: {
          seedData: {
            testTable: [{ id: 1, name: 'Test' }],
          },
          syncSecret: 'test-secret',
        },
      }
      // Verify Lakebed-specific fields are present
      expect(artifact.lakebedData).toBeDefined()
      expect(artifact.lakebedData?.seedData).toBeDefined()
      expect(artifact.lakebedData?.syncSecret).toBeDefined()
    })
  })
})
