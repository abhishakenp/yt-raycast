/**
 * section-kit — shared, generic, prop-driven React composites that vertical
 * section capsules compose. Write repeated UI (mobile drawer nav, footers,
 * headings, star ratings, card grids) ONCE here, not re-inlined per family.
 *
 * Single source of truth for the action contract is `./types.ts` (KitAction).
 */

export {
  SiteNav,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  NavbarActions,
  NavbarCta,
  siteNavHeaderVariants,
  siteNavRowVariants,
  navbarCtaVariants,
} from './SiteNav.tsx'
export type { SiteNavProps } from './SiteNav.tsx'
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
export {
  HoverAccordion,
  HoverAccordionPanel,
  hoverAccordionPanelVariants,
  useHoverAccordion,
} from './HoverAccordion.tsx'
export {
  ListingCard,
  ListingCardMedia,
  ListingCardBadge,
  ListingCardSpecRow,
  listingCardVariants,
  listingBadgeVariants,
} from './ListingCard.tsx'
export {
  FaqAccordion,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
  FaqAnswer,
  faqAccordionVariants,
  faqItemVariants,
  faqQuestionIconVariants,
} from './FaqAccordion.tsx'
export {
  OverviewSection,
  OverviewGrid,
  OverviewContent,
  OverviewEyebrow,
  OverviewBrand,
  OverviewHeading,
  OverviewSubheading,
  OverviewFeatures,
  OverviewFeature,
  OverviewCta,
  OverviewStats,
  OverviewStat,
  OverviewStatValue,
  OverviewStatLabel,
  OverviewMediaPanel,
} from './OverviewSection.tsx'
export {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
  heroSectionVariants,
  heroBadgeVariants,
  heroHeadingVariants,
  heroSubheadingVariants,
  HeroCodeWindow,
  HeroCodeWindowHeader,
  HeroCodeWindowBody,
  HeroInfoStrip,
  HeroInfoStripItem,
} from './HeroSection.tsx'
export { LogoStrip } from './LogoStrip.tsx'
export {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
  PortfolioTag,
  portfolioGridVariants,
} from './PortfolioGrid.tsx'
export {
  ArticleGrid,
  ArticleCard,
  ArticleMedia,
  ArticleContent,
  ArticleMeta,
  articleGridVariants,
  articleCardVariants,
} from './ArticleGrid.tsx'
export {
  ScheduleList,
  ScheduleItem,
  ScheduleTime,
  ScheduleContent,
  ScheduleTitle,
  ScheduleDetail,
  scheduleListVariants,
} from './ScheduleList.tsx'

export {
  SubscribeBand,
  SubscribeForm,
  SubscribeInput,
  SubscribeHeading,
  SubscribeDescription,
  SubscribeFineprint,
  subscribeBandVariants,
} from './SubscribeBand.tsx'

export {
  TopicGrid,
  TopicCard,
  TopicIcon,
  topicGridVariants,
} from './TopicGrid.tsx'

export {
  MenuList,
  MenuCategory,
  MenuItem,
  MenuItemPrice,
  MenuItemDescription,
  menuListVariants,
} from './MenuList.tsx'

export {
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  categoryGridVariants,
} from './CategoryGrid.tsx'

export {
  PressList,
  PressItem,
  PressQuote,
  PressAttribution,
  pressListVariants,
} from './PressList.tsx'

export type { KitAction } from './types.ts'
export { kitActionClasses } from './types.ts'
