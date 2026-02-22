# Template Generation - Quick Start

## ✅ What's Ready

### 1. Generate Templates

**Via CLI (single):**
```bash
node scripts/generate-templates.js saas
# → templates/saas.html
```

**Via CLI (all 9 types):**
```bash
node scripts/generate-all-templates.js
# → templates/{saas,landing,portfolio,ecommerce,blog,docs,dashboard,marketplace,community}.html
```

**Via cURL (requires server running):**
```bash
npm start  # In another terminal

curl http://localhost:7420/api/templates/saas > template.html
```

### 2. Pre-Generated Templates

All 9 templates already exist in `templates/`:
- 📄 saas.html (7.9 KB)
- 📄 landing.html (11 KB)
- 📄 portfolio.html (4.8 KB)
- 📄 ecommerce.html (6.9 KB)
- 📄 blog.html (7.8 KB)
- 📄 docs.html (3.2 KB)
- 📄 dashboard.html (10 KB)
- 📄 marketplace.html (6.4 KB)
- 📄 community.html (5.4 KB)

### 3. API Endpoint

```
GET /api/templates/:siteType
```

Valid site types:
- saas, landing, portfolio, ecommerce
- blog, docs, dashboard, marketplace, community

## 🎯 Use Cases

### Use Case 1: Quick Template Export
```bash
# Get a template to edit manually
node scripts/generate-templates.js ecommerce
open templates/ecommerce.html
```

### Use Case 2: Template via API
```bash
# From another app/service
curl http://localhost:7420/api/templates/landing -o my-page.html
```

### Use Case 3: Integrate into Leama (Claude)

Instead of Leama inventing designs:
1. It receives a site type
2. Loads the pre-generated template (or generates new)
3. Customizes with prompt content
4. Returns final HTML

**Next step:** Build `customizeTemplate()` function to fill in real content.

## 📚 Documentation

- **TEMPLATES.md** - Full guide with all features
- **IMPLEMENTATION_GUIDE.md** - Integration patterns
- **QUICKSTART.md** - This file

## 🚀 Next Steps

### Option 1: Customize Templates in Pipeline
```javascript
// Create src/llm/customize-template.js
// Modify phase-homepage.js to:
// 1. Load template
// 2. Customize with content
// 3. Return final HTML
```

### Option 2: Test Templates Visually
```bash
# Open any template in browser
open templates/saas.html
open templates/landing.html
open templates/ecommerce.html
```

### Option 3: Iterate Template Generation
```bash
# If templates need changes, edit SITE_TYPE_INSTRUCTIONS in config.js
# Then regenerate:
node scripts/generate-all-templates.js
```

## 💡 How It Works

```
User prompt
    ↓
[Detect site type] → saas, landing, ecommerce, etc.
    ↓
[Load/Generate template] → HTML with structure
    ↓
[Customize with content] → Add real features, pricing, etc.
    ↓
[Final homepage]
```

Previously: Leama invented design + layout from scratch
Now: Leama uses proven template, customizes with content
Result: Faster ⚡ + More consistent 🎯

## 📝 Code Locations

- **LLM function:** `src/llm/groq.js` → `groqTemplate()`
- **CLI scripts:** `scripts/generate-*.js`
- **HTTP endpoint:** `src/server/index.js` → `GET /api/templates/:siteType`
- **Pipeline phase:** `src/pipeline/phase-template.js`
- **Config:** `src/config.js` → `SITE_TYPE_INSTRUCTIONS`
- **Generated templates:** `templates/*.html`

## 🔧 Customization

Edit `src/config.js` → `SITE_TYPE_INSTRUCTIONS` to change layout patterns.

Example:
```javascript
SITE_TYPE_INSTRUCTIONS = {
  saas: '...your custom layout...',
  // ...
}
```

Then regenerate:
```bash
node scripts/generate-all-templates.js
```

## Questions?

See TEMPLATES.md for detailed documentation.
