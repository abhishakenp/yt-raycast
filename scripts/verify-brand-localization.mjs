#!/usr/bin/env node

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=')]
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 10000)

if (!Number.isFinite(timeoutMs) || timeoutMs < 1) {
  throw new Error('--timeout-ms must be a positive number')
}

const brandMissing = await requestJson('/api/brand-profile')
assert(
  brandMissing.status === 422,
  `brand missing query returned ${brandMissing.status}`,
)
assert(
  brandMissing.json.ok === false,
  'brand missing query did not return ok=false',
)

const brand = await requestJson(
  '/api/brand-profile?domain=https://linear.app/customers',
)
assert(
  brand.status === 200 ||
    brand.status === 401 ||
    brand.status === 403 ||
    brand.status === 404 ||
    brand.status === 502,
  `brand profile returned unexpected status ${brand.status}`,
)
assert(
  typeof brand.json.ok === 'boolean',
  'brand profile did not return a JSON ok flag',
)
if (brand.status === 200) {
  assert(
    brand.json.query === 'linear.app',
    'brand profile did not normalize domain input',
  )
  assert('match' in brand.json, 'brand profile success did not include match')
  assert('logo' in brand.json, 'brand profile success did not include logo')
  assert(
    'palette' in brand.json,
    'brand profile success did not include palette',
  )
} else {
  assert(
    brand.json.ok === false,
    'brand profile provider failure did not return ok=false',
  )
  assert(
    typeof brand.json.error === 'string',
    'brand profile provider failure lacked an error',
  )
}

const pexels = await requestRedirect(
  '/api/pexels?query=modern%20office&w=640&h=360&seed=brand-localization',
)
assert(pexels.status === 302, `pexels returned ${pexels.status}`)
const location = pexels.headers.get('location') ?? ''
assert(
  /^https:\/\/(images\.pexels\.com|images\.pexels\.com\/photos|picsum\.photos)\//.test(
    location,
  ) || /^https:\/\/picsum\.photos\//.test(location),
  `pexels redirect did not point at a usable image provider: ${location}`,
)

const english = await requestJson('/api/translate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ text: 'Start now', locale: 'en' }),
})
assert(english.status === 200, `english translate returned ${english.status}`)
assert(
  english.json.translation === 'Start now',
  'english translate changed source text',
)
assert(english.json.translated === false, 'english translate should skip model')
assert(
  english.json.skipped === 'english',
  'english translate did not report english skip',
)

const unsupported = await requestJson('/api/translate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ text: 'Start now', locale: 'xx-test' }),
})
assert(
  unsupported.status === 200,
  `unsupported translate returned ${unsupported.status}`,
)
assert(
  unsupported.json.translation === 'Start now',
  'unsupported locale changed source text',
)
assert(
  unsupported.json.translated === false,
  'unsupported locale should not translate',
)
assert(
  unsupported.json.skipped === 'unsupported-locale',
  'unsupported locale skip reason was wrong',
)

const hindi = await requestJson('/api/translate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ text: 'Apply now', locale: 'hi' }),
})
assert(
  hindi.status === 200 || hindi.status === 502,
  `Hindi translate returned ${hindi.status}`,
)
assert(hindi.json.locale === 'hi', 'Hindi translate did not preserve locale')
assert(
  typeof hindi.json.translation === 'string',
  'Hindi translate did not return fallback/source text',
)
if (hindi.status === 200) {
  assert(
    hindi.json.translation.length > 0,
    'Hindi translate returned an empty translation',
  )
} else {
  assert(
    hindi.json.translated === false,
    'Hindi provider failure should not report translated=true',
  )
  assert(
    typeof hindi.json.error === 'string',
    'Hindi provider failure lacked an error',
  )
}

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      brand: {
        status: brand.status,
        ok: brand.json.ok,
        providerBacked: brand.status === 200,
      },
      media: {
        status: pexels.status,
        location,
      },
      localization: {
        english: english.json,
        unsupported: unsupported.json,
        hindi: {
          status: hindi.status,
          translated: hindi.json.translated,
          hasError: typeof hindi.json.error === 'string',
        },
      },
    },
    null,
    2,
  ),
)

async function requestJson(path, init) {
  const response = await request(path, init)
  const body = await response.text()
  try {
    return {
      response,
      status: response.status,
      headers: response.headers,
      json: JSON.parse(body),
    }
  } catch (error) {
    throw new Error(
      `Unable to parse JSON from ${path}: ${error instanceof Error ? error.message : String(error)}\n${body.slice(0, 500)}`,
    )
  }
}

async function requestRedirect(path) {
  const response = await request(path, { redirect: 'manual' })
  return {
    response,
    status: response.status,
    headers: response.headers,
  }
}

async function request(path, init) {
  const url = `${baseUrl}${path}`
  return await fetch(url, {
    headers: { accept: 'application/json,*/*', ...init?.headers },
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${url}. Start the app first, or pass --base-url. ${error instanceof Error ? error.message : String(error)}`,
    )
  })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
