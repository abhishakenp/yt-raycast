import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
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
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'

export type CapsuleInlineHandle = {
  commit: () => Promise<void>
  discard: () => void
}

interface CapsuleInlineControlsProps {
  capsuleName: string
  statementId: string
  sessionId: string
  anonymousOwnerSecret?: string
  activeCollectionItem?: { collectionKey: string; index: number } | null
  handleRef?: React.MutableRefObject<CapsuleInlineHandle | null>
  capsuleElement?: HTMLElement | null
}

export function CapsuleInlineControls({
  capsuleName,
  statementId,
  sessionId,
  anonymousOwnerSecret,
  activeCollectionItem,
  handleRef,
  capsuleElement,
}: CapsuleInlineControlsProps) {
  return (
    <LakebedSessionProvider
      sessionId={sessionId}
      anonymousOwnerSecret={anonymousOwnerSecret}
    >
      <CapsuleInlineControlsInner
        capsuleName={capsuleName}
        statementId={statementId}
        activeCollectionItem={activeCollectionItem}
        handleRef={handleRef}
        capsuleElement={capsuleElement}
      />
    </LakebedSessionProvider>
  )
}

function lookupCapsuleSchema(capsuleName: string): CapsuleSchemaInfo | null {
  const capsule = allCapsules.find((c) => c.client.name === capsuleName)
  if (!capsule) return null
  const propsSchema = capsule.client.props
  if (!propsSchema) return null
  const info = introspectCapsuleSchema(propsSchema)
  return hasContextInfo(info) ? info : null
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const TITLE_FIELD_KEYS = [
  'name',
  'title',
  'heading',
  'label',
  'alt',
  'tag',
  'author',
  'company',
  'role',
]

function findTitleField(itemFields: CollectionField[]): string | undefined {
  return itemFields.find((f) => TITLE_FIELD_KEYS.includes(f.key))?.key
}

function extractItemTitle(
  item: unknown,
  titleField: string | undefined,
  fallback: string,
): string {
  if (!titleField || !isPlainObject(item)) return fallback
  const val = item[titleField]
  return typeof val === 'string' && val.trim() ? val : fallback
}

function CapsuleInlineControlsInner({
  capsuleName,
  statementId,
  activeCollectionItem,
  handleRef,
  capsuleElement,
}: {
  capsuleName: string
  statementId: string
  activeCollectionItem?: { collectionKey: string; index: number } | null
  handleRef?: React.MutableRefObject<CapsuleInlineHandle | null>
  capsuleElement?: HTMLElement | null
}) {
  const actions = useSectionCapsuleActions(capsuleName, statementId)
  const schemaInfo = useMemo(
    () => lookupCapsuleSchema(capsuleName),
    [capsuleName],
  )

  // ── Buffered reorders: keyed by collectionKey → ordered array of raw indices
  const [pendingOrders, setPendingOrders] = useState<Record<string, number[]>>(
    {},
  )
  const pendingOrdersRef = useRef(pendingOrders)
  pendingOrdersRef.current = pendingOrders

  // ── Buffered variant/scalar edits: keyed by prop key → value
  const [pendingScalars, setPendingScalars] = useState<Record<string, unknown>>(
    {},
  )
  const pendingScalarsRef = useRef(pendingScalars)
  pendingScalarsRef.current = pendingScalars

  // ── Buffered adds: keyed by collectionKey → array of items to add on Apply
  const [pendingAdds, setPendingAdds] = useState<
    Record<string, Record<string, unknown>[]>
  >({})
  const pendingAddsRef = useRef(pendingAdds)
  pendingAddsRef.current = pendingAdds

  // ── Buffered removes: keyed by collectionKey → array of indices to remove
  const [pendingRemoves, setPendingRemoves] = useState<
    Record<string, number[]>
  >({})
  const pendingRemovesRef = useRef(pendingRemoves)
  pendingRemovesRef.current = pendingRemoves

  const actionsRef = useRef(actions)
  actionsRef.current = actions

  // Store original DOM children for each collection key so we can revert on discard
  const originalDomRef = useRef<
    Record<string, { parent: HTMLElement; children: HTMLElement[] }>
  >({})

  const capsuleElementRef = useRef(capsuleElement)
  capsuleElementRef.current = capsuleElement

  const commit = useCallback(async () => {
    const orders = pendingOrdersRef.current
    const scalars = pendingScalarsRef.current
    const adds = pendingAddsRef.current
    const removes = pendingRemovesRef.current
    const act = actionsRef.current
    for (const [key, order] of Object.entries(orders)) {
      const identity = order.map((_, i) => i)
      if (order.join(',') === identity.join(',')) continue
      const rawItems = Array.isArray(act.sectionData?.[key])
        ? (act.sectionData![key] as unknown[])
        : []
      const reordered = order
        .map((i) => rawItems[i])
        .filter((x) => x !== undefined)
      await act.mergeData({
        [key]: reordered,
      } as Partial<Record<string, unknown>>)
    }
    for (const [key, value] of Object.entries(scalars)) {
      await act.setProp(key, value)
    }
    for (const [key, items] of Object.entries(adds)) {
      for (const item of items) {
        await act.addItem(key, item)
      }
    }
    for (const [key, indices] of Object.entries(removes)) {
      const sorted = [...indices].sort((a, b) => b - a)
      for (const idx of sorted) {
        await act.removeItem(key, idx)
      }
    }
    setPendingOrders({})
    setPendingScalars({})
    setPendingAdds({})
    setPendingRemoves({})
    originalDomRef.current = {}
  }, [])

  const discard = useCallback(() => {
    // Revert DOM to original order
    for (const [, saved] of Object.entries(originalDomRef.current)) {
      const { parent, children } = saved
      // Remove all current children
      while (parent.firstChild) parent.removeChild(parent.firstChild)
      // Re-append in original order
      for (const child of children) parent.appendChild(child)
    }
    setPendingOrders({})
    setPendingScalars({})
    setPendingAdds({})
    setPendingRemoves({})
    originalDomRef.current = {}
  }, [])

  // Register commit/discard on the handle ref
  useEffect(() => {
    if (handleRef) {
      handleRef.current = { commit, discard }
      return () => {
        handleRef.current = null
      }
    }
  }, [handleRef, commit, discard])

  // Find the grid container in the capsule element for a given collection key.
  // The grid is the element with the most same-tag children (e.g. 5 ARTICLEs).
  const findGridContainer = useCallback((_collectionKey) => {
    if (!capsuleElementRef.current) return null
    // Find the element with the most same-tag direct children
    let best: HTMLElement | null = null
    let bestCount = 1
    const all = capsuleElementRef.current.querySelectorAll('*')
    for (const el of Array.from(all)) {
      const htmlEl = el as HTMLElement
      const children = Array.from(htmlEl.children)
      if (children.length <= bestCount) continue
      // Check if children are all the same tag (like ARTICLE)
      const tags = new Set(children.map((c) => c.tagName))
      if (tags.size === 1) {
        best = htmlEl
        bestCount = children.length
      }
    }
    return best
  }, [])

  // Apply reorder to DOM for live preview
  const applyReorderToDom = useCallback(
    (collectionKey, order) => {
      const grid = findGridContainer(collectionKey)
      if (!grid) return

      // Save original DOM order on first reorder
      if (!originalDomRef.current[collectionKey]) {
        originalDomRef.current[collectionKey] = {
          parent: grid,
          children: Array.from(grid.children) as HTMLElement[],
        }
      }

      const saved = originalDomRef.current[collectionKey]
      const children = saved.children
      // Re-append in new order
      for (const idx of order) {
        if (children[idx]) grid.appendChild(children[idx])
      }
    },
    [findGridContainer],
  )

  if (!schemaInfo) return null
  if (!actions.canEdit) {
    return (
      <div className="px-3 py-2 text-xs text-white/40">
        Loading section data…
      </div>
    )
  }

  const bufferedValue = (key, backend) =>
    key in pendingScalars ? pendingScalars[key] : backend

  const hasVariants = schemaInfo.variants.length > 0
  const hasCollections = schemaInfo.collections.length > 0
  if (!hasVariants && !hasCollections) return null

  return (
    <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
      {schemaInfo.variants.map((variant) => (
        <InlineVariantSwitcher
          key={variant.key}
          variantKey={variant.key}
          options={variant.options}
          currentValue={bufferedValue(
            variant.key,
            actions.sectionData?.[variant.key],
          )}
          onBuffer={(value) =>
            setPendingScalars((prev) => ({ ...prev, [variant.key]: value }))
          }
        />
      ))}

      {schemaInfo.variants.length > 0 && schemaInfo.collections.length > 0 && (
        <div className="h-4 w-px shrink-0 bg-white/10" />
      )}

      {schemaInfo.collections.map((collection) => {
        const isActiveCollection =
          activeCollectionItem?.collectionKey === collection.key ||
          (activeCollectionItem?.collectionKey === '__auto__' &&
            schemaInfo.collections.length === 1)
        // Auto-select first item when section is active but no specific item
        const activeIndex = isActiveCollection
          ? (activeCollectionItem?.index ?? 0)
          : 0
        const pendingOrder = pendingOrders[collection.key] ?? null
        const pendingAddItems = pendingAdds[collection.key] ?? []
        // Show pending adds in the item list for display purposes
        const displayItems = Array.isArray(
          actions.sectionData?.[collection.key],
        )
          ? [
              ...(actions.sectionData![collection.key] as unknown[]),
              ...pendingAddItems,
            ]
          : pendingAddItems.length > 0
            ? pendingAddItems
            : []
        return (
          <InlineCollectionControls
            key={collection.key}
            collectionKey={collection.key}
            itemFields={collection.itemFields}
            items={displayItems}
            activeIndex={activeIndex}
            pendingOrder={pendingOrder}
            onReorderLocal={(order) => {
              setPendingOrders((prev) => ({
                ...prev,
                [collection.key]: order,
              }))
              applyReorderToDom(collection.key, order)
            }}
            onAdd={(key, item) => {
              setPendingAdds((prev) => ({
                ...prev,
                [key]: [...(prev[key] ?? []), item],
              }))
            }}
            onRemove={(key, index) => {
              setPendingRemoves((prev) => ({
                ...prev,
                [key]: [...(prev[key] ?? []), index],
              }))
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Inline variant switcher — flow row of pills ────────────────────────────

function InlineVariantSwitcher({
  variantKey,
  options,
  currentValue,
  onBuffer,
}: {
  variantKey: string
  options: { value: string | number | boolean; label: string }[]
  currentValue: unknown
  onBuffer: (value: unknown) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {variantKey}
      </span>
      <div className="flex gap-0.5 rounded-md bg-white/5 p-0.5">
        {options.map((option) => {
          const isActive = currentValue === option.value
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onBuffer(option.value)}
              className={cn(
                'rounded px-2 py-0.5 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-cyan-300/20 text-cyan-100'
                  : 'text-white/45 hover:text-white',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Inline collection controls — compact flow row ──────────────────────────

function InlineCollectionControls({
  collectionKey,
  itemFields,
  items,
  activeIndex,
  pendingOrder,
  onReorderLocal,
  onAdd,
  onRemove,
}: {
  collectionKey: string
  itemFields: CollectionField[]
  items: unknown
  activeIndex: number | null
  pendingOrder: number[] | null
  onReorderLocal: (order: number[]) => void
  onAdd: (key: string, item: Record<string, unknown>) => void
  onRemove: (key: string, index: number) => void
}) {
  const rawItems = Array.isArray(items) ? items : []
  const label = collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1)
  const titleField = findTitleField(itemFields)

  // Current display order: pendingOrder if set, otherwise identity
  const currentOrder = pendingOrder ?? rawItems.map((_, i) => i)
  const itemArray = currentOrder
    .map((i) => rawItems[i])
    .filter((x) => x !== undefined)

  // Track selected item by raw index (stable identity).
  // Initialize from activeIndex so the Select is controlled from the start.
  const [selectedRawIndex, setSelectedRawIndex] = useState<number | null>(
    () => {
      if (activeIndex !== null && activeIndex >= 0) {
        return currentOrder[activeIndex] ?? activeIndex
      }
      return null
    },
  )

  // When DOM-derived activeIndex changes, update selection to match
  useEffect(() => {
    if (activeIndex !== null && activeIndex >= 0) {
      const raw = currentOrder[activeIndex] ?? activeIndex
      setSelectedRawIndex(raw)
    }
  }, [activeIndex]) // intentionally not depending on currentOrder

  // Find the display position of the selected raw index
  const effectiveIndex =
    selectedRawIndex !== null ? currentOrder.indexOf(selectedRawIndex) : -1

  const hasActiveItem = effectiveIndex >= 0 && effectiveIndex < itemArray.length

  const activeItem = hasActiveItem ? itemArray[effectiveIndex] : null
  const activeTitle = activeItem
    ? extractItemTitle(activeItem, titleField, `${label} ${effectiveIndex + 1}`)
    : ''

  const handleAdd = () => {
    const defaultItem = createDefaultItem({ key: collectionKey, itemFields })
    void onAdd(collectionKey, defaultItem)
  }

  const doReorder = useCallback(
    (fromDisplay, toDisplay) => {
      if (toDisplay < 0 || toDisplay >= currentOrder.length) return
      const nextOrder = [...currentOrder]
      const [moved] = nextOrder.splice(fromDisplay, 1)
      nextOrder.splice(toDisplay, 0, moved)
      onReorderLocal(nextOrder)
    },
    [currentOrder, onReorderLocal],
  )

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label} <span className="text-white/25">({itemArray.length})</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={handleAdd}
        className="h-6 gap-1 px-2 text-[11px] text-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-200"
        title={`Add ${label}`}
      >
        <Plus className="size-3" />
        Add
      </Button>
      {itemArray.length > 0 && (
        <>
          <div className="h-3 w-px bg-white/10" />
          <Select
            value={hasActiveItem ? String(selectedRawIndex) : ''}
            onValueChange={(val) => setSelectedRawIndex(Number(val))}
          >
            <SelectTrigger className="h-6 w-[140px] gap-1 rounded-md border-white/10 bg-black/20 px-2 text-[11px] text-white/70">
              <SelectValue placeholder="Pick item…" />
            </SelectTrigger>
            <SelectContent>
              {itemArray.map((item, displayIdx) => {
                const rawIdx = currentOrder[displayIdx]
                const title = extractItemTitle(
                  item,
                  titleField,
                  `${label} ${displayIdx + 1}`,
                )
                return (
                  <SelectItem key={rawIdx} value={String(rawIdx)}>
                    {title}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {hasActiveItem && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => doReorder(effectiveIndex, effectiveIndex - 1)}
                disabled={effectiveIndex === 0}
                className="text-white/40 hover:text-white"
                title="Move up"
              >
                <ChevronUp className="size-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => doReorder(effectiveIndex, effectiveIndex + 1)}
                disabled={effectiveIndex === itemArray.length - 1}
                className="text-white/40 hover:text-white"
                title="Move down"
              >
                <ChevronDown className="size-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    title="Remove item"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {activeTitle}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this item. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        void onRemove(collectionKey, selectedRawIndex!)
                        setSelectedRawIndex(null)
                      }}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </>
      )}
    </div>
  )
}
