function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildOpenUiHandoffHtml({
  source,
  locale,
  brand,
  prompt,
}: {
  source: string
  locale: string
  brand: string
  prompt: string
}): string {
  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(brand || 'Generated Site')}</title>
  <script src="/scripts/tailwind-browser.js"></script>
</head>
<body class="min-h-screen bg-background text-foreground">
  <main id="openui-root" data-openui-ready="source" class="min-h-screen p-6">
    <section class="mx-auto max-w-4xl rounded-lg border border-border bg-card p-6 text-card-foreground">
      <p class="text-sm font-semibold text-muted-foreground">Generated OpenUI source is ready.</p>
      <h1 class="mt-3 text-3xl font-bold">${escapeHtml(brand || 'Generated Site')}</h1>
      <p class="mt-3 text-base text-muted-foreground">${escapeHtml(prompt)}</p>
    </section>
  </main>
  <script type="application/json" id="ship-fast-openui-source">${escapeHtml(JSON.stringify(source))}</script>
</body>
</html>`
}
