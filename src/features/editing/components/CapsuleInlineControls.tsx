import { useMemo } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'
import { allCapsules } from '@ship-fast/blocks'
import {
  introspectCapsuleSchema,
  createDefaultItem,
  hasContextInfo,
  type CapsuleSchemaInfo,
  type CollectionField,
} from '@ship-fast/blocks/capsules'
import { useSectionCapsuleActions } from '../hooks/useSectionCapsuleActions'
import { cn } from '#/lib/utils'

interface CapsuleInlineControlsProps {
  capsuleName: string
  statementId: string
  sessionId: string
  anonymousOwnerSecret?: string
  /**
   * When provided, the component highlights the collection item the user
   * is currently editing and offers remove/reorder controls for that item.
   * Format: `{ collectionKey, index }`.
   */
  activeCollectionItem?: { collectionKey: string; index: number } | null
}

/**
 * Compact inline controls for the capsule currently selected in the toolbar.
 * Shows variant switchers (e.g. "2 | 3 | 4 columns") and collection
 * add/remove/reorder buttons in a horizontal layout suitable for the
 * toolbar's expandable panel.
 *
 * Wraps itself in `LakebedSessionProvider` (the toolbar lives outside the
 * preview's provider).
 */
export const CapsuleInlineControls = ({
  capsuleName,
  statementId,
  sessionId,
  anonymousOwnerSecret,
  activeCollectionItem,
}: CapsuleInlineControlsProps) => (
  <LakebedSessionProvider
    sessionId={sessionId}
    anonymousOwnerSecret={anonymousOwnerSecret}
  >
    <CapsuleInlineControlsInner
      capsuleName={capsuleName}
      statementId={statementId}
      activeCollectionItem={activeCollectionItem}
    />
  </LakebedSessionProvider>
)

// ─── Schema lookup ──────────────────────────────────────────────────────────

const lookupCapsuleSchema = (capsuleName: string): CapsuleSchemaInfo | null => {
  const capsule = allCapsules.find((c) => c.client.name === capsuleName)
  if (!capsule) return null
  const propsSchema = capsule.client.props
  if (!propsSchema) return null
  const info = introspectCapsuleSchema(propsSchema)
  return hasContextInfo(info) ? info : null
}

// ─── Inner component ────────────────────────────────────────────────────────

const CapsuleInlineControlsInner = ({
  capsuleName,
  statementId,
  activeCollectionItem,
}: {
  capsuleName: string
  statementId: string
  activeCollectionItem?: { collectionKey: string; index: number } | null
}) => {
  const actions = useSectionCapsuleActions(capsuleName, statementId)
  const schemaInfo = useMemo(
    () => lookupCapsuleSchema(capsuleName),
    [capsuleName],
  )

  if (!schemaInfo) return null
  if (!actions.canEdit) {
    return (
      <div className="px-3 py-2 text-xs text-white/40">
        Loading section data…
      </div>
    )
  }

  const hasVariants = schemaInfo.variants.length > 0
  const hasCollections = schemaInfo.collections.length > 0
  if (!hasVariants && !hasCollections) return null

  return (
    <div className="flex w-full flex-col gap-2.5 px-3 py-2">
      {/* Variant switchers — inline toggle buttons */}
      {schemaInfo.variants.map((variant) => (
        <InlineVariantSwitcher
          key={variant.key}
          variantKey={variant.key}
          options={variant.options}
          currentValue={actions.sectionData?.[variant.key]}
          onSet={actions.setProp}
        />
      ))}

      {/* Collection controls — add/remove/reorder */}
      {schemaInfo.collections.map((collection) => {
        const isActiveCollection =
          activeCollectionItem?.collectionKey === collection.key ||
          (activeCollectionItem?.collectionKey === '__auto__' &&
            schemaInfo.collections.length === 1)
        const activeIndex = isActiveCollection
          ? (activeCollectionItem?.index ?? null)
          : null
        return (
          <InlineCollectionControls
            key={collection.key}
            collectionKey={collection.key}
            itemFields={collection.itemFields}
            items={actions.sectionData?.[collection.key]}
            activeIndex={activeIndex}
            onAdd={actions.addItem}
            onRemove={actions.removeItem}
            onReorder={actions.reorderItem}
          />
        )
      })}
    </div>
  )
}

// ─── Inline variant switcher ────────────────────────────────────────────────

const InlineVariantSwitcher = ({
  variantKey,
  options,
  currentValue,
  onSet,
}: {
  variantKey: string
  options: { value: string | number | boolean; label: string }[]
  currentValue: unknown
  onSet: (key: string, value: unknown) => Promise<void>
}) => (
  <div className="flex items-center gap-2">
    <span className="shrink-0 text-xs font-medium text-white/50">
      {variantKey}
    </span>
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const isActive = currentValue === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => void onSet(variantKey, option.value)}
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-cyan-300/20 text-cyan-100'
                : 'text-white/50 hover:bg-white/5 hover:text-white',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  </div>
)

// ─── Inline collection controls ─────────────────────────────────────────────

const InlineCollectionControls = ({
  collectionKey,
  itemFields,
  items,
  activeIndex,
  onAdd,
  onRemove,
  onReorder,
}: {
  collectionKey: string
  itemFields: CollectionField[]
  items: unknown
  activeIndex: number | null
  onAdd: (key: string, item: Record<string, unknown>) => Promise<void>
  onRemove: (key: string, index: number) => Promise<void>
  onReorder: (key: string, from: number, to: number) => Promise<void>
}) => {
  const itemArray = Array.isArray(items) ? items : []
  const label = collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1)

  const handleAdd = () => {
    const defaultItem = createDefaultItem({
      key: collectionKey,
      itemFields,
    })
    void onAdd(collectionKey, defaultItem)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs font-medium text-white/50">
        {label} ({itemArray.length})
      </span>
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-cyan-300 transition-colors hover:bg-cyan-300/10"
        title={`Add ${label}`}
      >
        <Plus className="size-3" />
        Add
      </button>
      {activeIndex !== null &&
        activeIndex >= 0 &&
        activeIndex < itemArray.length && (
          <>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-xs text-white/40">
              Item {activeIndex + 1}
            </span>
            <button
              type="button"
              onClick={() =>
                void onReorder(collectionKey, activeIndex, activeIndex - 1)
              }
              disabled={activeIndex === 0}
              className="grid size-5 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Move up"
            >
              <ChevronUp className="size-3" />
            </button>
            <button
              type="button"
              onClick={() =>
                void onReorder(collectionKey, activeIndex, activeIndex + 1)
              }
              disabled={activeIndex === itemArray.length - 1}
              className="grid size-5 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Move down"
            >
              <ChevronDown className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => void onRemove(collectionKey, activeIndex)}
              className="grid size-5 place-items-center rounded text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
              title="Remove item"
            >
              <Trash2 className="size-3" />
            </button>
          </>
        )}
    </div>
  )
}
