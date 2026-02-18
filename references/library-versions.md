# Pinned Library Versions

## Core
- next: ^16.1.6
- react / react-dom: ^19.2.3
- typescript: ^5.9.3

## Styling
- tailwindcss: ^4.1.18
- @tailwindcss/postcss: ^4.1.18 (devDep, REQUIRED for TW4)

## UI
- framer-motion: ^12.34.0
- lucide-react: ^0.564.0

## Config files

postcss.config.mjs:
```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

globals.css (minimal):
```css
@import "tailwindcss";
html, body { height: 100%; }
body { background-color: #030712; color: #e2e8f0; }
```
