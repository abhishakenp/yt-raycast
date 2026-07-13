/**
 * section-kit — shared, generic, prop-driven React composites that vertical
 * section capsules compose. Write repeated UI (mobile drawer nav, footers,
 * headings, star ratings, card grids) ONCE here, not re-inlined per family.
 *
 * Single source of truth for the action contract is `./types.ts` (KitAction).
 */

export { SiteNav } from './SiteNav.tsx'
export { SiteFooter } from './SiteFooter.tsx'
export {
  BrandLogoProvider,
  Logo,
  getBrandLogoImageSrc,
  useBrandLogo,
  type BrandLogoSelection,
} from './Logo.tsx'
export { SectionHeading } from './SectionHeading.tsx'
export { CtaBand } from './CtaBand.tsx'
export { StarRating } from './StarRating.tsx'
export { StatGrid } from './StatGrid.tsx'
export { FeatureGrid } from './FeatureGrid.tsx'
export { PricingGrid } from './PricingGrid.tsx'
export { TestimonialGrid } from './TestimonialGrid.tsx'
export { GalleryGrid } from './GalleryGrid.tsx'
export {
  CommandSearch,
  CommandSearchTrigger,
  CommandSearchContent,
  CommandSearchInput,
  CommandSearchList,
  CommandSearchEmpty,
  CommandSearchGroup,
} from './CommandSearch.tsx'
export {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownItem,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
} from './AccountDropdown.tsx'
export {
  FilterChip,
  chipVariants,
  type FilterChipProps,
} from './FilterChip.tsx'
export {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardContent,
  ProductCardTitle,
  ProductCardSubtitle,
  ProductCardPrice,
  productCardVariants,
} from './ProductCard.tsx'
export {
  PersonCard,
  PersonCardAvatar,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
  personCardVariants,
  type PersonCardProps,
} from './PersonCard.tsx'
export { Card, surfaceCard, type CardProps } from './Card.tsx'
export {
  Container,
  containerVariants,
  type ContainerProps,
} from './Container.tsx'
export { Eyebrow, eyebrowVariants, type EyebrowProps } from './Eyebrow.tsx'
export {
  ResponsiveGrid,
  gridColsVariants,
  type ResponsiveGridProps,
} from './ResponsiveGrid.tsx'
export {
  BentoGrid,
  BentoTile,
  BentoTileCaption,
  bentoGridVariants,
  bentoCaptionVariants,
  type BentoGridProps,
  type BentoTileProps,
  type BentoTileCaptionProps,
} from './BentoGrid.tsx'
export {
  ImageTile,
  imageTileVariants,
  type ImageTileProps,
} from './ImageTile.tsx'
export {
  ContentCard,
  contentCardVariants,
  type ContentCardProps,
} from './ContentCard.tsx'
export {
  MasonryTile,
  masonryTileVariants,
  type MasonryTileProps,
} from './MasonryTile.tsx'

export type { KitAction } from './types.ts'
export { kitActionClasses } from './types.ts'
