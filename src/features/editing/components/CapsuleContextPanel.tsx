import { useState, useMemo, useCallback } from 'react'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Boxes,
  GripVertical,
} from 'lucide-react'
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

// Heuristic: fields that usually hold long text → span 2 columns
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
])

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
      {/* Variants — full width pill bar */}
      {variants.map((variant) => (
        <BentoVariant
          key={variant.key}
          variantKey={variant.key}
          options={variant.options}
          currentValue={actions.sectionData?.[variant.key]}
          onSet={actions.setProp}
        />
      ))}

      {/* Collections — full width, items in inner grid */}
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

      {/* Scalars — sized by type + likely content length */}
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
  onReorder: (key: string, from: number, to: number) => Promise<void>
  onEdit: (
    key: string,
    index: number,
    patch: Record<string, unknown>,
  ) => Promise<void>
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const itemArray = Array.isArray(items) ? items : []
  const label = titleCase(collectionKey)

  const handleAdd = useCallback(() => {
    const defaultItem = createDefaultItem({ key: collectionKey, itemFields })
    void onAdd(collectionKey, defaultItem)
    setExpandedIndex(itemArray.length)
  }, [collectionKey, itemFields, onAdd, itemArray.length])

  const titleField = itemFields.find(
    (f) => f.key === 'name' || f.key === 'title' || f.key === 'alt',
  )?.key
  const subtitleField = itemFields.find(
    (f) => f.key === 'price' || f.key === 'description' || f.key === 'caption',
  )?.key

  // How many columns for the item grid — 3 if many items, 2 otherwise
  const itemCols = itemArray.length > 4 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <div className="col-span-3 flex flex-col gap-1.5 rounded-md border border-white/8 bg-white/[0.03] p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          {label} <span className="text-white/20">({itemArray.length})</span>
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-0.5 rounded bg-cyan-300/10 px-1.5 py-0.5 text-[11px] font-medium text-cyan-300 transition-colors hover:bg-cyan-300/20"
        >
          <Plus className="size-3" />
          Add
        </button>
      </div>

      {itemArray.length === 0 && (
        <p className="py-1.5 text-center text-[11px] text-white/20">
          No items yet
        </p>
      )}

      {itemArray.length > 0 && (
        <div className={cn('grid gap-1', itemCols)}>
          {itemArray.map((item, index) => {
            const isExpanded = expandedIndex === index
            const itemRecord = isPlainObject(item) ? item : {}
            const title = titleField
              ? String(itemRecord[titleField] || `${label} ${index + 1}`)
              : `${label} ${index + 1}`
            const subtitle = subtitleField
              ? String(itemRecord[subtitleField] || '')
              : ''
            return (
              <div
                key={index}
                className={cn(
                  'rounded border transition-all',
                  isExpanded
                    ? 'border-cyan-300/30 bg-cyan-300/5'
                    : 'border-white/8 bg-black/15 hover:border-white/15',
                )}
              >
                {/* Card header */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="flex w-full items-center gap-1 px-1.5 py-1 text-left"
                >
                  <GripVertical className="size-2.5 shrink-0 text-white/20" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-white/75">
                      {title}
                    </div>
                    {subtitle && (
                      <div className="truncate text-[10px] text-white/30">
                        {subtitle}
                      </div>
                    )}
                  </div>
                </button>

                {/* Card toolbar */}
                <div className="flex items-center gap-0.5 border-t border-white/5 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      void onReorder(collectionKey, index, index - 1)
                    }
                    disabled={index === 0}
                    className="grid size-4 place-items-center rounded text-white/30 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20"
                  >
                    <ChevronUp className="size-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void onReorder(collectionKey, index, index + 1)
                    }
                    disabled={index === itemArray.length - 1}
                    className="grid size-4 place-items-center rounded text-white/30 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20"
                  >
                    <ChevronDown className="size-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRemove(collectionKey, index)}
                    className="ml-auto grid size-4 place-items-center rounded text-red-400/50 transition-colors hover:bg-red-500/15 hover:text-red-300"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>

                {/* Expanded fields */}
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-1 border-t border-white/8 p-1.5">
                    {itemFields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={itemRecord[field.key]}
                        onChange={(newValue) =>
                          void onEdit(collectionKey, index, {
                            [field.key]: newValue,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Field input (inside collection items) ──────────────────────────────────

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
  const placeholder = titleCase(field.key)

  if (field.type === 'boolean') {
    return (
      <label className="col-span-2 flex items-center gap-1.5 text-[11px] text-white/55">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="size-3 accent-cyan-300"
        />
        {placeholder}
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
      <textarea
        value={text}
        onChange={(e) =>
          onChange(
            e.target.value.split('\n').filter((line) => line.trim() !== ''),
          )
        }
        rows={2}
        placeholder={`${placeholder} (one per line)`}
        className={cn(
          'w-full resize-none rounded border border-white/10 bg-black/20 px-1.5 py-1 text-[11px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/40',
          isWide && 'col-span-2',
        )}
      />
    )
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => {
          const n = Number(e.target.value)
          onChange(Number.isFinite(n) ? n : 0)
        }}
        placeholder={placeholder}
        className="w-full rounded border border-white/10 bg-black/20 px-1.5 py-1 text-[11px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/40"
      />
    )
  }

  return (
    <input
      type="text"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full rounded border border-white/10 bg-black/20 px-1.5 py-1 text-[11px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/40',
        isWide && 'col-span-2',
      )}
    />
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

  // string — long text spans 3 cols, short text spans 2
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
