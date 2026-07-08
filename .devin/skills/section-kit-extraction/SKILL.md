# section-kit Component Extraction & Adoption

## When to use

- Extracting a reusable component from inlined capsule patterns into `packages/ship-fast-blocks/src/section-kit/`
- Adopting (refactoring) existing capsules to use extracted section-kit components
- Adding new compound components to section-kit
- Reviewing section-kit components for shadcn/radix compliance

## The philosophy: shadcn/radix compound components

section-kit components follow the **same design philosophy** as shadcn/ui components (`components/ui/button.tsx`, `components/ui/card.tsx`). This is non-negotiable. Every extracted component MUST comply.

### 1. Compound components, NOT prop-bags

❌ **Wrong** — single component with dozens of props:

```tsx
export function ProductCard(props: {
  image?: ReactNode
  badge?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  price?: ReactNode
  actions?: ReactNode
  bodyClassName?: string
  // ...growing forever
})
```

✅ **Right** — compound sub-components, each a thin styled wrapper:

```tsx
<ProductCard>
  <ProductCardImage>
    <ProductCardBadge>Sale</ProductCardBadge>
    <ProductCardActions>
      <button>Add</button>
    </ProductCardActions>
  </ProductCardImage>
  <ProductCardContent>
    <ProductCardTitle>Chair</ProductCardTitle>
    <ProductCardSubtitle>Oak</ProductCardSubtitle>
    <ProductCardPrice>$99</ProductCardPrice>
  </ProductCardContent>
</ProductCard>
```

Each sub-component is independently usable. Callers compose only what they need. No prop explosion.

### 2. `React.ComponentProps<'tag'>` for every sub-component

Every sub-component extends native HTML props — no custom prop interfaces for standard attributes.

```tsx
const ProductCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      data-slot="product-card-title"
      className={cn('font-medium', className)}
      ref={ref}
      {...props}
    />
  )
})
```

### 3. `data-slot` attribute on every sub-component

Every sub-component gets `data-slot="component-name-sub"`. This is how shadcn identifies parts for styling and testing.

```tsx
data-slot="product-card"
data-slot="product-card-image"
data-slot="product-card-badge"
```

### 4. `asChild` via Radix Slot on every sub-component

Every sub-component accepts `asChild` and uses `@radix-ui/react-slot`'s `Slot` to render as its child's tag. This eliminates wrapper nesting.

```tsx
const Comp = asChild ? Slot : 'article'
```

**Why this matters:**

- `<ProductCard asChild><CommerceAddItemButton></ProductCard>` → renders as `<button>`, not `<article><button>`
- `<ProductCardTitle asChild><button></ProductCardTitle>` → renders as `<button>`, not `<h3><button>` (invalid HTML)
- Without `asChild`, you get extra DOM wrappers or invalid nesting

**Slot constraint:** `asChild` requires exactly ONE child element. Don't use `asChild` when the component has multiple children (e.g., an image container with both a button and badge as children).

### 5. CVA `variant` — only for multi-class bundles

Use `class-variance-authority` (cva) with a single `variant` prop — same as shadcn `Button`, `Badge`, `Alert`.

❌ **Wrong** — separate CVA variants for single utilities:

```tsx
const productCardVariants = cva('group flex flex-col', {
  variants: {
    surface: { none: '', elevated: '...', outlined: '...' },
    rounded: { none: '', xl: 'rounded-xl', '2xl': 'rounded-2xl' }, // single class
    shadow: { none: '', sm: 'shadow-sm', md: 'shadow-md' }, // single class
  },
})
```

✅ **Right** — `variant` encapsulates a full visual treatment; rounded/shadow compose via className:

```tsx
const productCardVariants = cva('group flex flex-col', {
  variants: {
    variant: {
      none: '',
      elevated: 'overflow-hidden rounded-xl bg-card text-card-foreground',
      outlined:
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
    },
  },
  defaultVariants: { variant: 'outlined' },
})
```

**Rule:** A CVA variant key should bundle multiple classes that form a visual treatment. Single utility classes (rounded, shadow, padding) compose fine via `className` + twMerge — they don't need to be CVA variants.

### 6. `VariantProps<typeof variants>` — derive types from CVA

Never manually type the variant union. Derive it from the CVA definition so they can't drift.

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const ProductCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> &
    VariantProps<typeof productCardVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => { ... })
```

### 7. `React.forwardRef` + `displayName` on every sub-component

```tsx
const ProductCard = React.forwardRef<HTMLElement, Props>(({ ... }, ref) => { ... })
ProductCard.displayName = 'ProductCard'
```

Every sub-component gets both. `displayName` shows in React DevTools. `forwardRef` lets consumers access the DOM node.

### 8. Export variants alongside components

```tsx
export { ProductCard, ProductCardImage, ..., productCardVariants }
```

Consumers can reuse the CVA function for related styling (e.g., a `Link` that should match `Button` styling).

### 9. `className` + `cn()` (twMerge) for all overrides

All sub-components accept `className` and merge via `cn()` (clsx + tailwind-merge). twMerge handles conflict resolution — later classes win.

```tsx
className={cn('font-medium text-foreground', className)}  // className overrides
```

## Adoption pattern: refactoring capsules to use section-kit

### Step 1: Audit the inlined pattern

Find all capsules that inline the pattern you're extracting. Document the count.

### Step 2: Identify structural variants

Group capsules by how they use the pattern:

- Same structure → direct replacement
- Different root element → use `asChild`
- Different body content → use compound sub-components selectively
- Completely custom body → use `ProductCardContent` with raw children

### Step 3: Extract with compound components

Build the section-kit component following all 9 rules above.

### Step 4: Adopt — replace inlined JSX with compound components

For each capsule:

1. Replace the inlined pattern with the compound sub-components
2. Use `asChild` where the capsule needs a different root tag (e.g., button instead of article)
3. Use `className` overrides for per-capsule styling differences
4. Use `variant` prop for surface treatment differences
5. **Styles must remain identical** — trace the final twMerge output to verify no leaked classes

### Step 5: Verify

1. `bunx tsc --noEmit --project packages/ship-fast-blocks/tsconfig.json` — 0 errors
2. `bunx vitest run --config vitest.config.ts <changed-dirs>` — all tests pass
3. Trace rendered classes — no extra classes that weren't in the original
4. Write behavioral tests for the new component (render, compose, asChild, variant, className merge)

## Reference files

- **Extracted component:** `packages/ship-fast-blocks/src/section-kit/ProductCard.tsx` — canonical example
- **shadcn reference:** `packages/ship-fast-blocks/src/components/ui/button.tsx` — pattern source
- **shadcn reference:** `packages/ship-fast-blocks/src/components/ui/card.tsx` — compound pattern source
- **Behavioral tests:** `packages/ship-fast-blocks/src/section-kit/new-composites.behavioral.test.tsx`
- **Exports:** `packages/ship-fast-blocks/src/section-kit/index.ts`

## Anti-patterns to reject

| Anti-pattern                                         | Why it's wrong                                              |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| Prop-bag component (image, title, subtitle as props) | Props grow forever; callers can't compose freely            |
| Manual variant types (`variant?: 'a' \| 'b'`)        | Drifts from CVA definition                                  |
| No `asChild`                                         | Forces wrapper nesting; invalid HTML (`<h3><button>`)       |
| CVA variant for single utility class                 | Over-engineering; className + twMerge handles it            |
| No `forwardRef`                                      | Consumers can't access DOM node                             |
| No `data-slot`                                       | Breaks shadcn styling/testing conventions                   |
| "Structure too different" excuse                     | Compound components handle any structure — that's the point |
