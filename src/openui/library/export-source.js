const CUSTOM_COMPONENT_DEFS = `
const e = React.createElement;
const surface = {
  border: '1px solid rgba(148,163,184,.24)',
  borderRadius: 24,
  background: 'linear-gradient(145deg, rgba(15,23,42,.94), rgba(17,24,39,.9))',
  boxShadow: '0 24px 80px rgba(2,6,23,.28)'
};
const muted = { color: '#94a3b8' };
const chip = { display: 'inline-flex', borderRadius: 999, padding: '4px 10px', border: '1px solid rgba(34,211,238,.36)', color: '#22d3ee', background: 'rgba(34,211,238,.12)', fontSize: 12, fontWeight: 700 };
const list = (items) => (items || []).map((item) => e('span', { key: item }, item));
const renderChildren = (renderNode, children) => children && children.length ? renderNode(children) : null;

const PageShell = defineComponent({
  name: 'PageShell',
  description: 'Full-page shell for generated websites or app screens.',
  props: z.object({ children: z.array(z.any()), title: z.string().optional(), eyebrow: z.string().optional() }),
  component: ({ props, renderNode }) => e('main', { style: { minHeight: '100%', padding: 'clamp(20px,4vw,56px)', background: '#020617', color: '#f8fafc' } },
    e('div', { style: { maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 24 } },
      props.eyebrow || props.title ? e('header', { style: { display: 'grid', gap: 6 } },
        props.eyebrow ? e('div', { style: { ...muted, textTransform: 'uppercase', letterSpacing: '.18em', fontSize: 12 } }, props.eyebrow) : null,
        props.title ? e('h1', { style: { margin: 0, fontSize: 'clamp(32px,6vw,72px)' } }, props.title) : null
      ) : null,
      renderNode(props.children)
    )
  )
});
const TopNav = defineComponent({
  name: 'TopNav',
  description: 'Brand navigation row with optional links and primary action.',
  props: z.object({ brand: z.string(), links: z.array(z.string()).optional(), actionLabel: z.string().optional() }),
  component: ({ props }) => e('nav', { style: { ...surface, display: 'flex', justifyContent: 'space-between', gap: 16, padding: '14px 18px' } }, e('strong', null, props.brand), e('div', { style: { ...muted, display: 'flex', gap: 16 } }, list(props.links)), props.actionLabel ? e('span', { style: chip }, props.actionLabel) : null)
});
const Section = defineComponent({
  name: 'Section',
  description: 'Titled content section that wraps related child components.',
  props: z.object({ title: z.string(), subtitle: z.string().optional(), children: z.array(z.any()).optional() }),
  component: ({ props, renderNode }) => e('section', { style: { display: 'grid', gap: 18 } }, e('div', null, e('h2', { style: { margin: 0 } }, props.title), props.subtitle ? e('p', { style: muted }, props.subtitle) : null), renderChildren(renderNode, props.children))
});
const SplitHero = defineComponent({
  name: 'SplitHero',
  description: 'Hero band with copy, actions, and optional supporting children.',
  props: z.object({ eyebrow: z.string().optional(), title: z.string(), subtitle: z.string(), primaryAction: z.string().optional(), secondaryAction: z.string().optional(), children: z.array(z.any()).optional() }),
  component: ({ props, renderNode }) => e('section', { style: { ...surface, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24, padding: 'clamp(24px,5vw,56px)', alignItems: 'center' } },
    e('div', { style: { display: 'grid', gap: 16 } }, props.eyebrow ? e('span', { style: chip }, props.eyebrow) : null, e('h1', { style: { margin: 0, fontSize: 'clamp(36px,7vw,76px)', lineHeight: .95 } }, props.title), e('p', { style: { ...muted, fontSize: 18, lineHeight: 1.6 } }, props.subtitle), e('div', { style: { display: 'flex', gap: 10 } }, props.primaryAction ? e('span', { style: chip }, props.primaryAction) : null, props.secondaryAction ? e('span', { style: chip }, props.secondaryAction) : null)),
    renderChildren(renderNode, props.children)
  )
});
const BentoGrid = defineComponent({
  name: 'BentoGrid',
  description: 'Responsive grid for cards, tiles, metrics, and panels.',
  props: z.object({ children: z.array(z.any()), minColumnWidth: z.number().optional() }),
  component: ({ props, renderNode }) => e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(' + (props.minColumnWidth || 240) + 'px,1fr))', gap: 16 } }, renderNode(props.children))
});
const SidebarShell = defineComponent({
  name: 'SidebarShell',
  description: 'Application shell with a left navigation rail and main content.',
  props: z.object({ navItems: z.array(z.string()), children: z.array(z.any()), title: z.string().optional() }),
  component: ({ props, renderNode }) => e('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(190px,240px) 1fr', gap: 18 } }, e('aside', { style: { ...surface, padding: 16 } }, props.title ? e('strong', null, props.title) : null, e('div', { style: { ...muted, display: 'grid', gap: 8 } }, list(props.navItems))), e('div', { style: { display: 'grid', gap: 16 } }, renderNode(props.children)))
});
const FeatureCard = defineComponent({ name: 'FeatureCard', description: 'Feature or benefit card.', props: z.object({ title: z.string(), description: z.string(), meta: z.string().optional() }), component: ({ props }) => e('article', { style: { ...surface, padding: 20 } }, props.meta ? e('span', { style: chip }, props.meta) : null, e('h3', null, props.title), e('p', { style: muted }, props.description)) });
const MetricCard = defineComponent({ name: 'MetricCard', description: 'Metric card.', props: z.object({ label: z.string(), value: z.string(), trend: z.string().optional() }), component: ({ props }) => e('article', { style: { ...surface, padding: 20, display: 'grid', gap: 8 } }, e('span', { style: muted }, props.label), e('strong', { style: { fontSize: 36 } }, props.value), props.trend ? e('span', { style: chip }, props.trend) : null) });
const TestimonialCard = defineComponent({ name: 'TestimonialCard', description: 'Customer quote card.', props: z.object({ quote: z.string(), name: z.string(), role: z.string().optional() }), component: ({ props }) => e('figure', { style: { ...surface, margin: 0, padding: 22 } }, e('blockquote', null, '"' + props.quote + '"'), e('figcaption', { style: muted }, props.name + (props.role ? ', ' + props.role : ''))) });
const PricingTier = defineComponent({ name: 'PricingTier', description: 'Pricing plan card.', props: z.object({ name: z.string(), price: z.string(), features: z.array(z.string()), actionLabel: z.string().optional(), highlighted: z.boolean().optional() }), component: ({ props }) => e('article', { style: { ...surface, padding: 22, outline: props.highlighted ? '2px solid #22d3ee' : 'none' } }, e('h3', null, props.name), e('strong', { style: { fontSize: 34 } }, props.price), e('div', { style: muted }, list(props.features)), props.actionLabel ? e('span', { style: chip }, props.actionLabel) : null) });
const FAQBlock = defineComponent({ name: 'FAQBlock', description: 'Compact FAQ list.', props: z.object({ questions: z.array(z.string()), answers: z.array(z.string()) }), component: ({ props }) => e('div', { style: { display: 'grid', gap: 12 } }, props.questions.map((q, i) => e('details', { key: q, style: { ...surface, padding: 18 } }, e('summary', null, q), e('p', { style: muted }, props.answers[i] || '')))) });
const ProductCard = defineComponent({ name: 'ProductCard', description: 'Commerce product card.', props: z.object({ name: z.string(), price: z.string(), description: z.string().optional(), imageUrl: z.string().optional(), badge: z.string().optional() }), component: ({ props }) => e('article', { style: { ...surface, overflow: 'hidden' } }, props.imageUrl ? e('img', { src: props.imageUrl, alt: props.name, style: { width: '100%', aspectRatio: '4/3', objectFit: 'cover' } }) : null, e('div', { style: { padding: 18 } }, props.badge ? e('span', { style: chip }, props.badge) : null, e('h3', null, props.name), props.description ? e('p', { style: muted }, props.description) : null, e('strong', null, props.price))) });
const CategoryTile = defineComponent({ name: 'CategoryTile', description: 'Commerce category tile.', props: z.object({ title: z.string(), description: z.string().optional(), imageUrl: z.string().optional() }), component: ({ props }) => e('article', { style: { ...surface, minHeight: 180, padding: 22, backgroundImage: props.imageUrl ? 'linear-gradient(rgba(2,6,23,.1),rgba(2,6,23,.78)),url(' + props.imageUrl + ')' : undefined, backgroundSize: 'cover' } }, e('h3', null, props.title), props.description ? e('p', { style: muted }, props.description) : null) });
const CartSummary = defineComponent({ name: 'CartSummary', description: 'Commerce cart/order summary block.', props: z.object({ title: z.string(), items: z.array(z.string()), total: z.string(), actionLabel: z.string().optional() }), component: ({ props }) => e('aside', { style: { ...surface, padding: 20 } }, e('h3', null, props.title), e('div', { style: muted }, list(props.items)), e('strong', null, props.total), props.actionLabel ? e('span', { style: chip }, props.actionLabel) : null) });
const PromoBand = defineComponent({ name: 'PromoBand', description: 'Promotional message band.', props: z.object({ title: z.string(), description: z.string(), actionLabel: z.string().optional() }), component: ({ props }) => e('section', { style: { ...surface, padding: 24 } }, e('h3', null, props.title), e('p', { style: muted }, props.description), props.actionLabel ? e('span', { style: chip }, props.actionLabel) : null) });
const DataPanel = defineComponent({ name: 'DataPanel', description: 'Dashboard panel.', props: z.object({ title: z.string(), summary: z.string().optional(), children: z.array(z.any()).optional() }), component: ({ props, renderNode }) => e('section', { style: { ...surface, padding: 20 } }, e('h3', null, props.title), props.summary ? e('p', { style: muted }, props.summary) : null, renderChildren(renderNode, props.children)) });
const FilterBar = defineComponent({ name: 'FilterBar', description: 'Horizontal filter/action bar.', props: z.object({ filters: z.array(z.string()), actionLabel: z.string().optional() }), component: ({ props }) => e('div', { style: { ...surface, padding: 12, display: 'flex', gap: 10, flexWrap: 'wrap' } }, list(props.filters), props.actionLabel ? e('span', { style: chip }, props.actionLabel) : null) });
const CommandBar = defineComponent({ name: 'CommandBar', description: 'Primary command row.', props: z.object({ title: z.string(), actions: z.array(z.string()).optional(), searchPlaceholder: z.string().optional() }), component: ({ props }) => e('header', { style: { ...surface, padding: 16, display: 'flex', justifyContent: 'space-between' } }, e('strong', null, props.title), props.searchPlaceholder ? e('span', { style: muted }, props.searchPlaceholder) : null, e('div', null, list(props.actions))) });
const ActivityFeed = defineComponent({ name: 'ActivityFeed', description: 'Recent activity list.', props: z.object({ title: z.string(), items: z.array(z.string()) }), component: ({ props }) => e('section', { style: { ...surface, padding: 20 } }, e('h3', null, props.title), e('div', { style: muted }, list(props.items))) });
const StatusPill = defineComponent({ name: 'StatusPill', description: 'Small status badge.', props: z.object({ label: z.string(), tone: z.enum(['neutral', 'success', 'warning', 'danger']).optional() }), component: ({ props }) => e('span', { style: chip }, props.label) });
const PreviewArtifact = defineComponent({ name: 'PreviewArtifact', description: 'Inline preview artifact.', props: z.object({ title: z.string(), description: z.string(), kind: z.string().optional() }), component: ({ props }) => e('article', { style: { ...surface, padding: 18 } }, props.kind ? e('span', { style: chip }, props.kind) : null, e('strong', null, props.title), e('p', { style: muted }, props.description)) });
const CodeArtifact = defineComponent({ name: 'CodeArtifact', description: 'Code preview artifact.', props: z.object({ title: z.string(), language: z.string(), codeString: z.string() }), component: ({ props }) => e('article', { style: surface }, e('header', { style: { padding: 16 } }, props.title + ' · ' + props.language), e('pre', { style: { padding: 16, overflow: 'auto' } }, e('code', null, props.codeString))) });
const SpecArtifact = defineComponent({ name: 'SpecArtifact', description: 'Specification preview.', props: z.object({ title: z.string(), points: z.array(z.string()) }), component: ({ props }) => e('article', { style: { ...surface, padding: 18 } }, e('h3', null, props.title), e('ul', { style: muted }, props.points.map((point) => e('li', { key: point }, point)))) });
const customComponents = [PageShell, TopNav, Section, SplitHero, BentoGrid, SidebarShell, FeatureCard, MetricCard, TestimonialCard, PricingTier, FAQBlock, ProductCard, CategoryTile, CartSummary, PromoBand, DataPanel, FilterBar, CommandBar, ActivityFeed, StatusPill, PreviewArtifact, CodeArtifact, SpecArtifact];
export const shipFastOpenUILibrary = createLibrary({ root: 'PageShell', components: customComponents });
`

export function renderShipFastOpenUILibraryModule({ cdn = false } = {}) {
  const imports = cdn
    ? `import React from 'https://esm.sh/react@19';
import { createLibrary, defineComponent } from 'https://esm.sh/@openuidev/react-lang@0.2.3';
import { z } from 'https://esm.sh/zod@4.3.6/v4';`
    : `import React from 'react';
import { createLibrary, defineComponent } from '@openuidev/react-lang';
import { z } from 'zod/v4';`
  return `${imports}
${CUSTOM_COMPONENT_DEFS}`
}
