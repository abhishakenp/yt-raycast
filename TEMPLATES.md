# Template Generation System

Generate premium website templates using Kimi (via Groq) with predefined layout structures.

## Usage

### 1. Generate Single Template (CLI)

```bash
node scripts/generate-templates.js <site-type>
```

Example:
```bash
node scripts/generate-templates.js saas
```

**Output:** `templates/saas.html`

### 2. Generate All Templates (Parallel)

```bash
node scripts/generate-all-templates.js
```

Generates all 9 site types in parallel:
- saas
- landing
- portfolio
- ecommerce
- blog
- docs
- dashboard
- marketplace
- community

**Output:** `templates/*.html`

### 3. Generate via HTTP (cURL)

Start the server first:
```bash
npm start
```

Then request templates:
```bash
curl http://localhost:7420/api/templates/saas > templates/saas.html
curl http://localhost:7420/api/templates/landing > templates/landing.html
```

Or in a loop:
```bash
for type in saas landing portfolio ecommerce blog docs dashboard marketplace community; do
  curl -s http://localhost:7420/api/templates/$type > templates/$type.html
  echo "✅ Generated $type"
done
```

## Template Structure

Each template includes:

1. **Navigation** - Logo, 2-3 links, 1 CTA button
2. **Hero Section** - Badge + massive headline + subtitle + gradient CTA
3. **Content** - Features, metrics, or core offerings (depends on site type)
4. **Pricing** (optional) - 2-col grid with "Popular" badge
5. **Social Proof** - Logo cloud or highlight card
6. **CTA** - Final call-to-action with 2 buttons
7. **Footer** - Links and copyright

## Site Types & Layouts

### SaaS
- Typography-first, no images
- Features grid → Pricing → Highlight card → Logo cloud

### Landing
- Similar to SaaS
- Features → Social proof → Pricing → FAQ → CTA

### Dashboard
- KPI metrics in 2x2 grid
- Features → Integrations → Pricing

### E-commerce
- Product images via picsum
- Categories → Featured products → Deals banner → Newsletter

### Marketplace
- Search bar in hero
- Featured listings → How it works → Trust stats

### Blog
- Featured article in hero
- Article grid → Categories → Newsletter

### Docs
- Search bar + code block
- Topic cards → API reference

### Community
- Member count stats
- Trending topics → Member highlights → Activity

### Portfolio
- Project showcase with images
- About → Skills → Contact form

## Design System

All templates use:
- **Tailwind CSS** (CDN)
- **Google Fonts** (Inter or specified font)
- **Dark mode** - slate-950 background
- **Accent colors** - cyan-500 or project-specific
- **Inline SVG** - No icon CDNs, no emojis
- **2-col grids** - Never 3-col
- **Typography-first** - Minimal aesthetic

## How It Works

1. **SITE_TYPE_INSTRUCTIONS** in `src/config.js` defines layout patterns
2. **groqTemplate()** in `src/llm/groq.js` calls Kimi via chatjimmy.ai
3. Templates are saved to `templates/` directory
4. Can be used as starting points for actual homepages
5. Integrate with design system metadata for customization

## Next Steps

### Integrate into Ship Fast Pipeline

```javascript
// src/pipeline/phase-template.js
import { groqTemplate } from '../llm/groq.js'
import { writeFile } from './workspace.js'

export async function generateTemplate(siteType, workspace, log) {
  log(`  generating ${siteType} template...`)
  const result = await groqTemplate(siteType)

  if (result.content) {
    writeFile(workspace, `template-${siteType}.html`, result.content)
  }

  return result
}
```

### Use as Homepage Base

```javascript
// Instead of generating from scratch, use template as base
const template = await groqTemplate(siteType)
const customized = customizeTemplate(template, {
  name: projectName,
  features: features,
  designBrief: designBrief,
})
```

## API Endpoints

### GET `/api/templates/:siteType`

Returns generated HTML template.

**Parameters:**
- `siteType` (string) - One of: saas, landing, portfolio, ecommerce, blog, docs, dashboard, marketplace, community

**Response:**
- `200` - HTML content with `Content-Type: text/html`
- `400` - Invalid site type
- `500` - Generation error

**Example:**
```bash
curl http://localhost:7420/api/templates/saas -o template.html
```

## Performance

- **Kimi generation** - ~2-3 seconds per template
- **Parallel all** - ~3-5 seconds for all 9 templates
- **Output size** - 5-8KB per template (gzips well)

## Customization

To customize the design system used in templates, modify `src/prompts/template.js`:

```javascript
const designBlock = `
  Dark mode. Inter font.
  - Primary: #0ea5e9 (sky-500)
  - Surface: #0f172a (slate-950)
  - Accent: #f97316 (orange-500)
`

const result = await groqTemplate('saas', designBlock)
```
