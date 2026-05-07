# PASS A — thin site spec (homepage only)

Output **only valid JSON**. Include **exactly one page** in `pages`: the homepage (`route` `/`). You may still set `navigation.global` / `footer` with **planned** labels and `href` targets for pages you will add in a later pass (use sensible paths like `/pricing`, `/about`).

Required top-level keys: `projectName`, `slug`, `siteType`, `userPrompt`, `generatedTimestamp`, `exportableFrameworks`, `version`, `planMeta`, `theme`, `navigation`, `pages` (length 1), `components`, `interactions`, `forms`, `assets`, `seo`, `businessProfile`, `backendFeatureHints`.

Use `version` and `planMeta.schemaRevision`: `{{SITE_SPEC_VERSION}}`. Set `planMeta.specPhase` to `"thin"`.

Homepage must include `pageRole`, `contentGoals`, and **rich `sections`** (navbar + hero + at least a few on-brand bands) with `contentBlocks` where helpful for implementation. For `siteType` ecommerce, include `ecommerce` with **at least six** `products` and categories so the homepage can render a real grid.

Do not invent legal entities. Follow the CONTENT PLAN REFERENCE for section checklist and tone.
