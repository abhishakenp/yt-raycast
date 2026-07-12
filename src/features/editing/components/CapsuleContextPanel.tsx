import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Plus, Trash2, Boxes, ChevronUp, ChevronDown } from 'lucide-react'
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
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from '#/components/ui/sortable'

interface CapsuleContextPanelProps {
  capsuleName: string
  statementId: string
  sessionId: string
  anonymousOwnerSecret?: string
}

export const CapsuleContextPanel = ({
  capsuleName,
  statementId,
  sessionId,
  anonymousOwnerSecret,
}: CapsuleContextPanelProps) => (
  <LakebedSessionProvider
    sessionId={sessionId}
    anonymousOwnerSecret={anonymousOwnerSecret}
  >
    <CapsuleContextPanelInner
      capsuleName={capsuleName}
      statementId={statementId}
    />
  </LakebedSessionProvider>
)

// ─── Helpers ────────────────────────────────────────────────────────────────

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const lookupCapsuleSchema = (capsuleName: string): CapsuleSchemaInfo | null => {
  const capsule = allCapsules.find((c) => c.client.name === capsuleName)
  if (!capsule) return null
  const propsSchema = capsule.client.props
  if (!propsSchema) return null
  const info = introspectCapsuleSchema(propsSchema)
  return hasContextInfo(info) ? info : null
}

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() +
  s
    .slice(1)
    .replace(/([A-Z])/g, ' $1')
    .trim()

const LONG_TEXT_KEYS = new Set([
  'description',
  'subheading',
  'heading',
  'bio',
  'content',
  'body',
  'text',
  'quote',
  'blurb',
  'tagline',
  'excerpt',
])

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

const SUBTITLE_FIELD_KEYS = [
  'price',
  'description',
  'caption',
  'excerpt',
  'date',
  'role',
  'period',
]

const findTitleField = (itemFields: CollectionField[]): string | undefined =>
  itemFields.find((f) => TITLE_FIELD_KEYS.includes(f.key))?.key

const findSubtitleField = (itemFields: CollectionField[]): string | undefined =>
  itemFields.find((f) => SUBTITLE_FIELD_KEYS.includes(f.key))?.key

const extractItemTitle = (
  item: unknown,
  titleField: string | undefined,
  fallback: string,
): string => {
  if (!titleField || !isPlainObject(item)) return fallback
  const val = item[titleField]
  return typeof val === 'string' && val.trim() ? val : fallback
}

// ─── Inner panel ────────────────────────────────────────────────────────────

const CapsuleContextPanelInner = ({
  capsuleName,
  statementId,
}: {
  capsuleName: string
  statementId: string
}) => {
  const actions = useSectionCapsuleActions(capsuleName, statementId)
  const schemaInfo = useMemo(
    () => lookupCapsuleSchema(capsuleName),
    [capsuleName],
  )

  if (!schemaInfo) return null
  if (!actions.canEdit) {
    return (
      <div className="px-4 py-3 text-xs text-white/40">
        Loading section data…
      </div>
    )
  }

  const { variants, collections, scalars } = schemaInfo
  if (variants.length === 0 && collections.length === 0 && scalars.length === 0)
    return null

  return (
    <div className="grid w-full grid-cols-3 gap-1.5 p-3">
      {variants.map((variant) => (
        <BentoVariant
          key={variant.key}
          variantKey={variant.key}
          options={variant.options}
          currentValue={actions.sectionData?.[variant.key]}
          onSet={actions.setProp}
        />
      ))}

      {collections.map((collection) => (
        <BentoCollection
          key={collection.key}
          collectionKey={collection.key}
          itemFields={collection.itemFields}
          items={actions.sectionData?.[collection.key]}
          onAdd={actions.addItem}
          onRemove={actions.removeItem}
          onReorder={actions.reorderItem}
          onEdit={actions.editItem}
        />
      ))}

      {scalars.map((scalar) => (
        <BentoScalar
          key={scalar.key}
          scalarKey={scalar.key}
          type={scalar.type}
          currentValue={actions.sectionData?.[scalar.key]}
          onSet={actions.setProp}
        />
      ))}
    </div>
  )
}

// ─── Variant ────────────────────────────────────────────────────────────────

const BentoVariant = ({
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
  <div className="col-span-3 flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-white/35">
      {variantKey}
    </span>
    <div className="flex gap-0.5 rounded-md bg-black/20 p-0.5">
      {options.map((option) => {
        const isActive = currentValue === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => void onSet(variantKey, option.value)}
            className={cn(
              'rounded px-2.5 py-0.5 text-xs font-semibold transition-all',
              isActive
                ? 'bg-cyan-300/20 text-cyan-100'
                : 'text-white/40 hover:text-white',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  </div>
)

// ─── Collection ─────────────────────────────────────────────────────────────

const BentoCollection = ({
  collectionKey,
  itemFields,
  items,
  onAdd,
  onRemove,
  onReorder,
  onEdit,
}: {
  collectionKey: string
  itemFields: CollectionField[]
  items: unknown
  onAdd: (key: string, item: Record<string, unknown>) => Promise<void>
  onRemove: (key: string, index: number) => Promise<void>
  onReorder: (key: string, fromIndex: number, toIndex: number) => Promise<void>
  onEdit: (
    key: string,
    index: number,
    patch: Record<string, unknown>,
  ) => Promise<void>
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [draftItem, setDraftItem] = useState<Record<string, unknown> | null>(
    null,
  )
  const [editBuffer, setEditBuffer] = useState<Record<string, unknown> | null>(
    null,
  )
  const rawItems = Array.isArray(items) ? items : []
  const [localOrder, setLocalOrder] = useState<number[] | null>(null)
  const label = titleCase(collectionKey)

  // When rawItems reference changes (backend update), clear local order
  // since the backend now reflects the new order
  const prevRawItems = useRef(rawItems)
  useEffect(() => {
    if (prevRawItems.current !== rawItems) {
      setLocalOrder(null)
      prevRawItems.current = rawItems
    }
  }, [rawItems])

  // Apply local order if present, otherwise use raw items as-is
  const itemArray = localOrder
    ? localOrder.map((i) => rawItems[i]).filter((x) => x !== undefined)
    : rawItems

  const titleField = findTitleField(itemFields)
  const subtitleField = findSubtitleField(itemFields)

  const startAdd = useCallback(() => {
    setDraftItem(createDefaultItem({ key: collectionKey, itemFields }))
    setExpandedIndex(null)
  }, [collectionKey, itemFields])

  const saveDraft = useCallback(() => {
    if (!draftItem) return
    void onAdd(collectionKey, draftItem)
    setDraftItem(null)
    setExpandedIndex(itemArray.length)
  }, [draftItem, collectionKey, onAdd, itemArray.length])

  const cancelDraft = useCallback(() => setDraftItem(null), [])

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Optimistic: update local order immediately
      const currentOrder = localOrder ?? rawItems.map((_, i) => i)
      const nextOrder = [...currentOrder]
      const [moved] = nextOrder.splice(fromIndex, 1)
      nextOrder.splice(toIndex, 0, moved)
      setLocalOrder(nextOrder)
      // Backend sync
      void onReorder(collectionKey, fromIndex, toIndex)
    },
    [localOrder, rawItems, onReorder, collectionKey],
  )

  // Sortable values: the raw indices in their current display order.
  // e.g. if localOrder is [1, 2, 0, 3, 4], sortableItems is [1, 2, 0, 3, 4].
  // This lets dnd-kit track items by their stable raw index ID and
  // detect when the order changes.
  const sortableItems = localOrder ?? rawItems.map((_, i) => i)
  const getItemValue = (i: number) => String(i)

  return (
    <div className="col-span-3 flex flex-col gap-1.5 rounded-md border border-white/8 bg-white/[0.03] p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          {label} <span className="text-white/20">({itemArray.length})</span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={startAdd}
          disabled={draftItem !== null}
          className="h-6 gap-1 px-2 text-[11px]"
        >
          <Plus className="size-3" />
          Add
        </Button>
      </div>

      {itemArray.length === 0 && draftItem === null && (
        <p className="py-1.5 text-center text-[11px] text-white/20">
          No items yet
        </p>
      )}

      {itemArray.length > 0 && (
        <Sortable
          value={sortableItems}
          getItemValue={getItemValue}
          onMove={(event) => {
            handleReorder(event.activeIndex, event.overIndex)
          }}
          orientation="vertical"
        >
          <SortableContent className="flex flex-col gap-1">
            {itemArray.map((item, index) => {
              const isExpanded = expandedIndex === index
              const itemRecord = isPlainObject(item) ? item : {}
              const title = extractItemTitle(
                item,
                titleField,
                `${label} ${index + 1}`,
              )
              const subtitle = subtitleField
                ? String(itemRecord[subtitleField] || '')
                : ''
              const rawIndex = sortableItems[index]
              return (
                <SortableItem key={rawIndex} value={String(rawIndex)} asChild>
                  <div
                    className={cn(
                      'group rounded-md border transition-all',
                      isExpanded
                        ? 'border-cyan-300/30 bg-cyan-300/5'
                        : 'border-white/8 bg-black/15 hover:border-white/15',
                    )}
                  >
                    <div className="flex items-center gap-1 px-1.5 py-1">
                      <SortableItemHandle
                        className="grid size-5 shrink-0 place-items-center rounded text-white/25 transition-colors hover:bg-white/10 hover:text-white/60"
                        aria-label={`Drag ${title}`}
                      >
                        <GripIcon />
                      </SortableItemHandle>
                      <button
                        type="button"
                        onClick={() => {
                          if (isExpanded) {
                            // Collapsing — discard edit buffer
                            setEditBuffer(null)
                            setExpandedIndex(null)
                          } else {
                            // Expanding — initialize edit buffer from current item
                            setEditBuffer({ ...itemRecord })
                            setExpandedIndex(index)
                          }
                        }}
                        className="min-w-0 flex-1 truncate text-left text-[11px] font-medium text-white/75 hover:text-white"
                      >
                        {title}
                        {subtitle && (
                          <span className="ml-1.5 text-[10px] text-white/30">
                            {subtitle}
                          </span>
                        )}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleReorder(index, index - 1)}
                        disabled={index === 0}
                        className="text-white/40 hover:text-white"
                        title="Move up"
                      >
                        <ChevronUp className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleReorder(index, index + 1)}
                        disabled={index === itemArray.length - 1}
                        className="text-white/40 hover:text-white"
                        title="Move down"
                      >
                        <ChevronDown className="size-3" />
                      </Button>
                      <DeleteWithConfirm
                        itemLabel={title}
                        onConfirm={() => void onRemove(collectionKey, index)}
                      />
                    </div>

                    {isExpanded && editBuffer !== null && (
                      <div className="flex flex-col gap-1 border-t border-white/8 p-1.5">
                        <div className="grid grid-cols-2 gap-1">
                          {itemFields.map((field) => (
                            <FieldInput
                              key={field.key}
                              field={field}
                              value={editBuffer[field.key]}
                              onChange={(newValue) =>
                                setEditBuffer((prev) =>
                                  prev
                                    ? { ...prev, [field.key]: newValue }
                                    : prev,
                                )
                              }
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Cancel — revert to original, discard buffer
                              setEditBuffer(null)
                              setExpandedIndex(null)
                            }}
                            className="rounded px-2 py-0.5 text-[10px] font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            Cancel
                          </button>
                          <Button
                            type="button"
                            variant="default"
                            size="xs"
                            onClick={() => {
                              // Save — commit all buffered edits to backend
                              void onEdit(collectionKey, index, editBuffer)
                              setEditBuffer(null)
                              setExpandedIndex(null)
                            }}
                            className="h-5 gap-1 px-2 text-[10px]"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </SortableItem>
              )
            })}
          </SortableContent>
          <SortableOverlay />
        </Sortable>
      )}

      {/* Inline draft — appears at bottom when Add is clicked */}
      {draftItem !== null && (
        <div className="rounded-md border border-cyan-300/40 bg-cyan-300/5">
          <div className="flex items-center gap-1 px-1.5 py-1">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/60">
              New {label}
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={cancelDraft}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="default"
              size="xs"
              onClick={saveDraft}
              className="h-5 gap-1 px-2 text-[10px]"
            >
              <Plus className="size-2.5" />
              Save
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-1 border-t border-cyan-300/20 p-1.5">
            {itemFields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={draftItem[field.key]}
                onChange={(newValue) =>
                  setDraftItem((prev) =>
                    prev ? { ...prev, [field.key]: newValue } : prev,
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Delete with confirmation dialog ────────────────────────────────────────

const DeleteWithConfirm = ({
  itemLabel,
  onConfirm,
}: {
  itemLabel: string
  onConfirm: () => void
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-red-400/50 hover:bg-red-500/15 hover:text-red-300"
        title={`Remove ${itemLabel}`}
      >
        <Trash2 className="size-3" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Remove {itemLabel}?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently remove this item from the collection. This
          action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Remove
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

// ─── Grip icon (drag handle) ─────────────────────────────────────────────────

const GripIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </svg>
)

// ─── Field input (inside collection items — inline editing) ─────────────────

const FieldInput = ({
  field,
  value,
  onChange,
}: {
  field: CollectionField
  value: unknown
  onChange: (value: unknown) => void
}) => {
  const isWide = field.type === 'array-string' || LONG_TEXT_KEYS.has(field.key)
  const labelText = titleCase(field.key)

  if (field.type === 'boolean') {
    return (
      <label className="col-span-2 flex items-center gap-1.5 text-[11px] text-white/55">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="size-3 accent-cyan-300"
        />
        {labelText}
      </label>
    )
  }

  if (field.type === 'array-string') {
    const text = Array.isArray(value)
      ? (value as string[]).join('\n')
      : typeof value === 'string'
        ? value
        : ''
    return (
      <div className={cn('flex flex-col gap-0.5', isWide && 'col-span-2')}>
        <label className="text-[9px] font-medium uppercase tracking-wider text-white/40">
          {labelText}
        </label>
        <textarea
          value={text}
          onChange={(e) =>
            onChange(
              e.target.value.split('\n').filter((line) => line.trim() !== ''),
            )
          }
          rows={2}
          placeholder={`${labelText} (one per line)`}
          className="w-full resize-none rounded border border-white/10 bg-black/20 px-1.5 py-1 text-[11px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/40"
        />
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div className="flex flex-col gap-0.5">
        <label className="text-[9px] font-medium uppercase tracking-wider text-white/40">
          {labelText}
        </label>
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => {
            const n = Number(e.target.value)
            onChange(Number.isFinite(n) ? n : 0)
          }}
          placeholder={labelText}
          className="w-full rounded border border-white/10 bg-black/20 px-1.5 py-1 text-[11px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/40"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-0.5', isWide && 'col-span-2')}>
      <label className="text-[9px] font-medium uppercase tracking-wider text-white/40">
        {labelText}
      </label>
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={labelText}
        className="w-full rounded border border-white/10 bg-black/20 px-1.5 py-1 text-[11px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/40"
      />
    </div>
  )
}

// ─── Scalar ─────────────────────────────────────────────────────────────────

const BentoScalar = ({
  scalarKey,
  type,
  currentValue,
  onSet,
}: {
  scalarKey: string
  type: 'string' | 'number' | 'boolean'
  currentValue: unknown
  onSet: (key: string, value: unknown) => Promise<void>
}) => {
  const placeholder = titleCase(scalarKey)
  const isLong = LONG_TEXT_KEYS.has(scalarKey)

  if (type === 'boolean') {
    return (
      <label className="col-span-3 flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/60">
        <input
          type="checkbox"
          checked={currentValue === true}
          onChange={(e) => void onSet(scalarKey, e.target.checked)}
          className="size-3.5 accent-cyan-300"
        />
        {placeholder}
      </label>
    )
  }

  if (type === 'number') {
    return (
      <input
        type="number"
        value={typeof currentValue === 'number' ? currentValue : ''}
        onChange={(e) => {
          const n = Number(e.target.value)
          void onSet(scalarKey, Number.isFinite(n) ? n : 0)
        }}
        placeholder={placeholder}
        className="col-span-1 w-full rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white outline-none transition-colors placeholder:text-white/30 focus:border-cyan-300/40"
      />
    )
  }

  return (
    <input
      type="text"
      value={typeof currentValue === 'string' ? currentValue : ''}
      onChange={(e) => void onSet(scalarKey, e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white outline-none transition-colors placeholder:text-white/30 focus:border-cyan-300/40',
        isLong ? 'col-span-3' : 'col-span-2',
      )}
    />
  )
}

// ─── Icon export ────────────────────────────────────────────────────────────
export { Boxes as CapsuleControlsIcon }
