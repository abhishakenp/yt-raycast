function stripStringLiterals(value) {
  return String(value || '').replace(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    '""',
  )
}

/**
 * @param {string} source
 */
export function validateOpenUISource(source) {
  const text = String(source || '').trim()
  const codeText = stripStringLiterals(text)
  if (!text || text.length < 32) {
    return {
      ok: false,
      errors: [{ message: 'OpenUI source too short' }],
      hasRoot: false,
    }
  }
  if (!/\broot\s*=/.test(text)) {
    return {
      ok: false,
      errors: [{ message: 'Missing root assignment' }],
      hasRoot: false,
    }
  }
  const rootAssignments = text.match(/^\s*root\s*=/gm) || []
  if (rootAssignments.length !== 1) {
    return {
      ok: false,
      errors: [
        {
          message: `Expected exactly one root assignment, found ${rootAssignments.length}`,
        },
      ],
      hasRoot: rootAssignments.length > 0,
    }
  }
  const definitions = new Set(
    [...text.matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=/gm)].map(
      (match) => match[1],
    ),
  )
  const rootChildren = text.match(/^\s*root\s*=\s*Stack\s*\(\s*\[([^\]]*)\]/m)
  if (!rootChildren) {
    return {
      ok: false,
      errors: [{ message: 'Root must be Stack([childRefs], ...)' }],
      hasRoot: true,
    }
  }
  const childRefs = rootChildren[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (childRefs.length === 0) {
    return {
      ok: false,
      errors: [{ message: 'Root must reference at least one child' }],
      hasRoot: true,
    }
  }
  if (/\b[A-Z][A-Za-z0-9_]*\s+with\b/i.test(codeText)) {
    return {
      ok: false,
      errors: [
        {
          message:
            'Output contains prose placeholders instead of component calls',
        },
      ],
      hasRoot: true,
    }
  }
  if (/\b[A-Z][A-Za-z0-9_]*\s*\(\s*\{/.test(codeText)) {
    return {
      ok: false,
      errors: [
        {
          message:
            'Component calls must not start with an object literal argument',
        },
      ],
      hasRoot: true,
    }
  }
  const componentCalls = [...text.matchAll(/\b([A-Z][A-Za-z0-9_]*)\s*\(/g)]
    .map((match) => match[1])
    .filter((name) => name !== 'Stack')
  if (componentCalls.length === 0) {
    return {
      ok: false,
      errors: [
        {
          message:
            'Root must include real child component calls or references to defined components',
        },
      ],
      hasRoot: true,
    }
  }
  if (!rootChildren[1].includes('(')) {
    const missingChild = childRefs.find((ref) => !definitions.has(ref))
    if (missingChild) {
      return {
        ok: false,
        errors: [{ message: `Root child "${missingChild}" is not defined` }],
        hasRoot: true,
      }
    }
  }
  return { ok: true, errors: [], hasRoot: true }
}
