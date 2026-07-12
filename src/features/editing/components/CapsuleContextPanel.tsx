import { useState, useMemo, useCallback } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Boxes } from 'lucide-react'
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

/**
 * Wrapper that provides a LakebedSessionProvider context (the toolbar lives
 * outside the preview's provider) and renders the inner panel.
 */
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

// ─── Schema lookup ──────────────────────────────────────────────────────────

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
      <div className="px-3 py-2 text-xs text-white/40">
        Loading section data…
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3 px-3 py-2">
      {schemaInfo.variants.map((variant) => (
        <VariantSwitcher
          key={variant.key}
          variantKey={variant.key}
          options={variant.options}
          currentValue={actions.sectionData?.[variant.key]}
          onSet={actions.setProp}
        />
      ))}
      {schemaInfo.collections.map((collection) => (
        <CollectionEditor
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
      {schemaInfo.scalars.map((scalar) => (
        <ScalarInput
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

// ─── Variant switcher ───────────────────────────────────────────────────────

const VariantSwitcher = ({
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
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-white/60">{variantKey}</label>
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const isActive = currentValue === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => void onSet(variantKey, option.value)}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-cyan-300/20 text-cyan-100'
                : 'text-white/60 hover:bg-white/5 hover:text-white',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  </div>
)

// ─── Collection editor ──────────────────────────────────────────────────────

const CollectionEditor = ({
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
  const label = collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1)

  const handleAdd = useCallback(() => {
    const defaultItem = createDefaultItem({
      key: collectionKey,
      itemFields,
    })
    void onAdd(collectionKey, defaultItem)
    setExpandedIndex(itemArray.length)
  }, [collectionKey, itemFields, onAdd, itemArray.length])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-white/60">
          {label} ({itemArray.length})
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-cyan-300 transition-colors hover:bg-cyan-300/10"
        >
          <Plus className="size-3" />
          Add
        </button>
      </div>
      {itemArray.length === 0 && (
        <p className="text-xs text-white/30">No items yet.</p>
      )}
      {itemArray.map((item, index) => {
        const isExpanded = expandedIndex === index
        const itemRecord = isPlainObject(item) ? item : {}
        return (
          <div
            key={index}
            className="rounded border border-white/10 bg-white/5"
          >
            <div className="flex items-center gap-1 px-2 py-1">
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="flex-1 truncate text-left text-xs text-white/70 hover:text-white"
              >
                {String(
                  itemRecord.name ||
                    itemRecord.title ||
                    itemRecord.alt ||
                    itemRecord.quote ||
                    `${collectionKey} ${index + 1}`,
                )}
              </button>
              <button
                type="button"
                onClick={() => void onReorder(collectionKey, index, index - 1)}
                disabled={index === 0}
                className="grid size-5 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronUp className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => void onReorder(collectionKey, index, index + 1)}
                disabled={index === itemArray.length - 1}
                className="grid size-5 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronDown className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => void onRemove(collectionKey, index)}
                className="grid size-5 place-items-center rounded text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
            {isExpanded && (
              <div className="flex flex-col gap-1.5 border-t border-white/10 px-2 py-1.5">
                {itemFields.map((field) => (
                  <CollectionFieldInput
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
  )
}

// ─── Collection field input ─────────────────────────────────────────────────

const CollectionFieldInput = ({
  field,
  value,
  onChange,
}: {
  field: CollectionField
  value: unknown
  onChange: (value: unknown) => void
}) => {
  const label = field.key.charAt(0).toUpperCase() + field.key.slice(1)

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs text-white/60">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="size-3.5 accent-cyan-300"
        />
        {label}
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
      <label className="flex flex-col gap-0.5">
        <span className="text-xs text-white/50">{label}</span>
        <textarea
          value={text}
          onChange={(e) =>
            onChange(
              e.target.value.split('\n').filter((line) => line.trim() !== ''),
            )
          }
          rows={2}
          className="w-full resize-none rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/50"
          placeholder="One per line"
        />
      </label>
    )
  }

  if (field.type === 'number') {
    return (
      <label className="flex flex-col gap-0.5">
        <span className="text-xs text-white/50">{label}</span>
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => {
            const n = Number(e.target.value)
            onChange(Number.isFinite(n) ? n : 0)
          }}
          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/50"
        />
      </label>
    )
  }

  // string (default)
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-xs text-white/50">{label}</span>
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/50"
      />
    </label>
  )
}

// ─── Scalar input ───────────────────────────────────────────────────────────

const ScalarInput = ({
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
  const label = scalarKey.charAt(0).toUpperCase() + scalarKey.slice(1)

  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs text-white/60">
        <input
          type="checkbox"
          checked={currentValue === true}
          onChange={(e) => void onSet(scalarKey, e.target.checked)}
          className="size-3.5 accent-cyan-300"
        />
        {label}
      </label>
    )
  }

  if (type === 'number') {
    return (
      <label className="flex flex-col gap-0.5">
        <span className="text-xs text-white/50">{label}</span>
        <input
          type="number"
          value={typeof currentValue === 'number' ? currentValue : ''}
          onChange={(e) => {
            const n = Number(e.target.value)
            void onSet(scalarKey, Number.isFinite(n) ? n : 0)
          }}
          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/50"
        />
      </label>
    )
  }

  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-xs text-white/50">{label}</span>
      <input
        type="text"
        value={typeof currentValue === 'string' ? currentValue : ''}
        onChange={(e) => void onSet(scalarKey, e.target.value)}
        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/50"
      />
    </label>
  )
}

// ─── Icon export for toolbar button ─────────────────────────────────────────
export { Boxes as CapsuleControlsIcon }
