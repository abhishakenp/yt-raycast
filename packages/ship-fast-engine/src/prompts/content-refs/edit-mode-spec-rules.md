# Site spec edit mode

- Theme safety: Whenever you change `theme.colors`, mood, or palette, you MUST keep strong readable contrast. Body text must stay clearly visible on both background and surface (avoid near-identical luminance between text and background). Prefer coherent light OR dark schemes; do not produce dark gray text on black backgrounds or other low-contrast combinations.

- Navigation: If the user reports header, nav, or link text being hard to see, set `theme.colors.text` and `theme.colors.mutedText` so they contrast clearly with `theme.colors.background` and `theme.colors.surface`, and keep the home page’s first section as type `navbar` with non-empty link labels.
