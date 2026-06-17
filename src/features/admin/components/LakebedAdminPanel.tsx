/*
 * Adapted from Convex dashboard-common data UI.
 * Source: https://github.com/get-convex/convex-backend/tree/f7869f700d93974ed85ed207b689bd4bfbd037be/npm-packages/dashboard-common/src/features/data/components
 * License at source: FSL-1.1-Apache-2.0 future license.
 *
 * This local adapter keeps the Convex dashboard table stack shape:
 * DataSidebar -> DataToolbar/DataFilters -> react-table/react-window DataTable
 * with inline cell editing and a side document editor, while replacing the
 * dashboard deployment UDFs with Lakebed sessionData reads/writes.
 */

import {
  ChevronDownIcon,
  DotsVerticalIcon,
  EyeClosedIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import classNames from 'classnames'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels'
import type { Column, Row } from 'react-table'
import { useBlockLayout, useResizeColumns, useTable } from 'react-table'
import { useLakebedSession } from '@ship-fast/lakebed/react'

import { api } from '../../../../convex/_generated/api'
import {
  createLakebedAdminTables,
  parseAdminValue,
  previewAdminValue,
} from '@/features/admin/services/lakebed-admin-model'
import type {
  JsonRecord,
  LakebedAdminRow,
  LakebedAdminTable,
  LakebedSessionDataDoc,
} from '@/features/admin/services/lakebed-admin-model'

type SortState = {
  column: string
  direction: 'asc' | 'desc'
}

type PopupState =
  | { type: 'addDocuments'; tableId: string }
  | { type: 'editDocument'; row: LakebedAdminRow; tableId: string }
  | undefined

type LakebedDocument = JsonRecord & {
  __lakebedRow: LakebedAdminRow
  __rowId: string
}

type LakebedSessionArgs = {
  anonymousOwnerSecret?: string
  sessionId: string
}

type ReplaceSessionDataArgs = LakebedSessionArgs & {
  capsule: string
  data: JsonRecord
}

type ResizableColumn = Column<LakebedDocument> & {
  disableResizing?: boolean
  minWidth?: number
  width?: number
}

type ResizableHeader = ReturnType<
  typeof useTable<LakebedDocument>
>['headerGroups'][number]['headers'][number] & {
  disableResizing?: boolean
  getResizerProps?: () => React.HTMLAttributes<HTMLDivElement>
}

const lakebedApi = (
  api as unknown as {
    lakebed: {
      listSessionData: unknown
      replaceSessionData: unknown
    }
  }
).lakebed

const useLakebedSessionData = useQuery as (
  query: unknown,
  args: LakebedSessionArgs | 'skip',
) => LakebedSessionDataDoc[] | undefined

const useReplaceSessionData = useMutation as (
  mutation: unknown,
) => (args: ReplaceSessionDataArgs) => Promise<unknown>

const rowHeight = 38

const useClickAway = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, callback])
}

const isJsonRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const withoutGeneratedFields = (value: unknown): unknown => {
  if (!isJsonRecord(value)) return value
  const { _id: _id, _key: _key, ...rest } = value
  void _id
  void _key
  return rest
}

const defaultValueForColumn = (column: string) => {
  if (column.toLowerCase().endsWith('at')) return new Date().toISOString()
  if (column.toLowerCase().includes('count')) return 0
  if (column.toLowerCase().includes('quantity')) return 1
  return ''
}

const nextRowValue = (
  table: LakebedAdminTable,
  row: LakebedAdminRow,
  column: string,
  value: unknown,
) => {
  if (column === '_id') return row.value

  if (table.storage === 'value' && !isJsonRecord(row.value)) {
    return value
  }

  return {
    ...(isJsonRecord(row.value) ? row.value : {}),
    [column]: value,
  }
}

const nextDataForRowSave = ({
  data,
  row,
  table,
  value,
}: {
  data: JsonRecord
  row: LakebedAdminRow
  table: LakebedAdminTable
  value: unknown
}): JsonRecord => {
  const nextData = { ...data }
  const currentValue = data[table.field]

  if (table.storage === 'array') {
    const rows = Array.isArray(currentValue) ? [...currentValue] : []
    rows[row.index] = withoutGeneratedFields(value)
    nextData[table.field] = rows
    return nextData
  }

  if (table.storage === 'map') {
    const currentMap = isJsonRecord(currentValue) ? { ...currentValue } : {}
    const rowRecord = isJsonRecord(value) ? value : { value }
    const nextKey =
      typeof rowRecord._key === 'string' && rowRecord._key.trim()
        ? rowRecord._key.trim()
        : (row.key ?? row.id)
    currentMap[nextKey] = withoutGeneratedFields(rowRecord)
    if (row.key && row.key !== nextKey) delete currentMap[row.key]
    nextData[table.field] = currentMap
    return nextData
  }

  nextData[table.field] = withoutGeneratedFields(value)
  return nextData
}

const nextDataForRowDelete = ({
  data,
  row,
  table,
}: {
  data: JsonRecord
  row: LakebedAdminRow
  table: LakebedAdminTable
}): JsonRecord => {
  const nextData = { ...data }
  const currentValue = data[table.field]

  if (table.storage === 'array') {
    const rows = Array.isArray(currentValue) ? [...currentValue] : []
    rows.splice(row.index, 1)
    nextData[table.field] = rows
    return nextData
  }

  if (table.storage === 'map') {
    const currentMap = isJsonRecord(currentValue) ? { ...currentValue } : {}
    delete currentMap[row.key ?? row.id]
    nextData[table.field] = currentMap
  }

  return nextData
}

const nextDataForRowAdd = ({
  data,
  table,
  value,
}: {
  data: JsonRecord
  table: LakebedAdminTable
  value: unknown
}): JsonRecord => {
  const nextData = { ...data }
  const currentValue = data[table.field]

  if (table.storage === 'array') {
    nextData[table.field] = Array.isArray(currentValue)
      ? [...currentValue, withoutGeneratedFields(value)]
      : [withoutGeneratedFields(value)]
  }

  if (table.storage === 'map') {
    const currentMap = isJsonRecord(currentValue) ? { ...currentValue } : {}
    const recordValue = isJsonRecord(value) ? value : { value }
    const key =
      typeof recordValue._key === 'string' && recordValue._key.trim()
        ? recordValue._key.trim()
        : `row_${Date.now()}`
    currentMap[key] = withoutGeneratedFields(recordValue)
    nextData[table.field] = currentMap
  }

  return nextData
}

const newDocumentTemplate = (table: LakebedAdminTable): JsonRecord =>
  Object.fromEntries(
    table.columns
      .filter((column) => !column.startsWith('_'))
      .map((column) => [column, defaultValueForColumn(column)]),
  )

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const documentFromRow = (row: LakebedAdminRow): LakebedDocument => ({
  ...row.cells,
  __lakebedRow: row,
  __rowId: row.id,
})

export function LakebedAdminPanel() {
  const session = useLakebedSession()
  const sessionArgs = useMemo(
    () => ({
      ...(session.anonymousOwnerSecret
        ? { anonymousOwnerSecret: session.anonymousOwnerSecret }
        : {}),
      sessionId: session.sessionId,
    }),
    [session],
  )
  const docs = useLakebedSessionData(lakebedApi.listSessionData, sessionArgs)
  const replaceSessionData = useReplaceSessionData(
    lakebedApi.replaceSessionData,
  )

  const tables = useMemo(() => createLakebedAdminTables(docs), [docs])
  const [selectedTableId, setSelectedTableId] = useState<string>()
  const [tableSearch, setTableSearch] = useState('')
  const [rowFilter, setRowFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const [sort, setSort] = useState<SortState>()
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [popup, setPopup] = useState<PopupState>()
  const [error, setError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)

  const visibleTables = useMemo(() => {
    const query = tableSearch.trim().toLowerCase()
    if (!query) return tables
    return tables.filter((table) => table.name.toLowerCase().includes(query))
  }, [tables, tableSearch])

  const selectedTable =
    tables.find((table) => table.id === selectedTableId) ??
    visibleTables[0] ??
    tables[0]
  const selectedDoc = docs?.find(
    (doc) => doc.capsule === selectedTable?.capsule,
  )

  useEffect(() => {
    if (!selectedTable) return
    setSelectedTableId(selectedTable.id)
    setSelectedRows((current) => {
      const next = new Set<string>()
      for (const row of selectedTable.rows) {
        if (current.has(row.id)) next.add(row.id)
      }
      return next
    })
    setHiddenColumns((current) =>
      current.filter((column) => selectedTable.columns.includes(column)),
    )
    setSort((current) =>
      current && selectedTable.columns.includes(current.column)
        ? current
        : { column: '_creationTime', direction: 'desc' },
    )
  }, [selectedTable])

  const filteredRows = useMemo(() => {
    if (!selectedTable) return []
    const query = rowFilter.trim().toLowerCase()
    const rows = query
      ? selectedTable.rows.filter((row) =>
          selectedTable.columns.some((column) =>
            previewAdminValue(row.cells[column]).toLowerCase().includes(query),
          ),
        )
      : selectedTable.rows

    if (!sort) return rows
    return [...rows].sort((a, b) => {
      const left = previewAdminValue(a.cells[sort.column])
      const right = previewAdminValue(b.cells[sort.column])
      const result = left.localeCompare(right, undefined, { numeric: true })
      return sort.direction === 'asc' ? result : -result
    })
  }, [rowFilter, selectedTable, sort])

  const documents = useMemo(
    () => filteredRows.map(documentFromRow),
    [filteredRows],
  )

  const saveData = useCallback(
    async (table: LakebedAdminTable, data: JsonRecord) => {
      if (!selectedDoc) return
      setError(undefined)
      setIsSaving(true)
      try {
        await replaceSessionData({
          ...(session.anonymousOwnerSecret
            ? { anonymousOwnerSecret: session.anonymousOwnerSecret }
            : {}),
          capsule: table.capsule,
          data,
          sessionId: session.sessionId,
        })
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Save failed')
      } finally {
        setIsSaving(false)
      }
    },
    [replaceSessionData, selectedDoc, session],
  )

  const saveCell = useCallback(
    async (row: LakebedAdminRow, column: string, value: unknown) => {
      if (!selectedTable || !selectedDoc || column.startsWith('_')) return

      const nextValue = nextRowValue(selectedTable, row, column, value)
      await saveData(
        selectedTable,
        nextDataForRowSave({
          data: selectedDoc.data,
          row,
          table: selectedTable,
          value: nextValue,
        }),
      )
    },
    [saveData, selectedDoc, selectedTable],
  )

  const addDocument = async (value: unknown) => {
    if (!selectedTable || !selectedDoc || selectedTable.storage === 'value')
      return
    await saveData(
      selectedTable,
      nextDataForRowAdd({
        data: selectedDoc.data,
        table: selectedTable,
        value,
      }),
    )
    setPopup(undefined)
  }

  const saveDocument = async (row: LakebedAdminRow, value: unknown) => {
    if (!selectedTable || !selectedDoc) return
    await saveData(
      selectedTable,
      nextDataForRowSave({
        data: selectedDoc.data,
        row,
        table: selectedTable,
        value,
      }),
    )
    setPopup(undefined)
  }

  const deleteRows = async (rowIds: Set<string>) => {
    if (!selectedTable || !selectedDoc || selectedTable.storage === 'value')
      return
    let data = selectedDoc.data
    for (const rowId of rowIds) {
      const row = selectedTable.rows.find((candidate) => candidate.id === rowId)
      if (row) {
        data = nextDataForRowDelete({ data, row, table: selectedTable })
      }
    }
    await saveData(selectedTable, data)
    setSelectedRows(new Set())
  }

  const selectedDocument =
    selectedRows.size === 1
      ? selectedTable?.rows.find((row) => selectedRows.has(row.id))
      : undefined

  const popupPanel =
    popup && selectedTable && popup.tableId === selectedTable.id ? (
      <DocumentPanel
        key={`${popup.type}:${selectedTable.id}`}
        mode={popup.type === 'addDocuments' ? 'add' : 'edit'}
        initialValue={
          popup.type === 'addDocuments'
            ? newDocumentTemplate(selectedTable)
            : withoutGeneratedFields(popup.row.value)
        }
        isSaving={isSaving}
        onClose={() => setPopup(undefined)}
        onSave={(value) =>
          popup.type === 'addDocuments'
            ? addDocument(value)
            : saveDocument(popup.row, value)
        }
        tableName={selectedTable.name}
      />
    ) : null

  return (
    <div className="lakebed-convex-admin grid h-full min-h-[520px] grid-cols-[320px_minmax(0,1fr)] overflow-hidden bg-[#282622] text-[#f8f8f2]">
      <DataSidebar
        selectedTableId={selectedTable?.id}
        tableSearch={tableSearch}
        tables={visibleTables}
        onSearch={setTableSearch}
        onSelectTable={(tableId) => {
          setSelectedTableId(tableId)
          setSelectedRows(new Set())
          setPopup(undefined)
        }}
      />

      <main className="min-h-0 overflow-hidden bg-[#282622] p-4">
        {selectedTable ? (
          <PanelGroup orientation="horizontal" className="h-full min-h-0">
            <Panel
              className="flex min-w-[18rem] flex-col gap-3 overflow-hidden py-2"
              defaultSize={popupPanel ? 62 : 100}
              minSize={30}
            >
              <DataToolbar
                isSaving={isSaving}
                numRows={filteredRows.length}
                popup={popup}
                selectedDocument={selectedDocument}
                selectedRows={selectedRows}
                table={selectedTable}
                onAdd={() =>
                  setPopup({ tableId: selectedTable.id, type: 'addDocuments' })
                }
                onDelete={() => void deleteRows(selectedRows)}
                onEdit={() => {
                  if (selectedDocument) {
                    setPopup({
                      row: selectedDocument,
                      tableId: selectedTable.id,
                      type: 'editDocument',
                    })
                  }
                }}
              />

              <DataFilters
                columns={selectedTable.columns}
                hiddenColumns={hiddenColumns}
                rowFilter={rowFilter}
                showFilters={showFilters}
                sort={sort}
                onHiddenColumnsChange={setHiddenColumns}
                onRowFilterChange={setRowFilter}
                onShowFiltersChange={setShowFilters}
                onSortChange={setSort}
              />

              {error && (
                <div className="rounded-md border border-[#8b3a42] bg-[#3d272b] px-3 py-2 text-sm text-[#fecdd3]">
                  {error}
                </div>
              )}

              <DataTable
                columns={selectedTable.columns.filter(
                  (column) => !hiddenColumns.includes(column),
                )}
                data={documents}
                isSaving={isSaving}
                selectedRows={selectedRows}
                onEditDocument={(row) =>
                  setPopup({
                    row,
                    tableId: selectedTable.id,
                    type: 'editDocument',
                  })
                }
                onSaveCell={saveCell}
                onSelectRows={setSelectedRows}
              />
            </Panel>
            {popupPanel && (
              <>
                <PanelResizeHandle className="mx-4 w-px bg-[#57544f]" />
                <Panel
                  className="min-w-[18rem] overflow-visible py-2"
                  defaultSize={38}
                  minSize={28}
                >
                  {popupPanel}
                </Panel>
              </>
            )}
          </PanelGroup>
        ) : (
          <div className="grid h-full place-items-center rounded-lg border border-[#57544f] bg-[#2d2b27] text-sm text-[#a1a1aa]">
            {docs === undefined
              ? 'Loading session data...'
              : 'No session data.'}
          </div>
        )}
      </main>
    </div>
  )
}

function DataSidebar({
  onSearch,
  onSelectTable,
  selectedTableId,
  tableSearch,
  tables,
}: {
  onSearch: (value: string) => void
  onSelectTable: (tableId: string) => void
  selectedTableId?: string
  tableSearch: string
  tables: LakebedAdminTable[]
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#4b4945] bg-[#2d2b27] py-4">
      <div className="mb-2 flex flex-col px-3">
        <h5 className="text-base font-semibold text-[#f8f8f2]">Tables</h5>
      </div>

      <label className="flex h-11 items-center gap-2 border-b border-[#4b4945] px-5 text-[#a1a1aa]">
        <MagnifyingGlassIcon className="size-4" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f8f8f2] outline-none placeholder:text-[#a1a1aa]"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search tables..."
          type="search"
          value={tableSearch}
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1">
        <div className="flex flex-col gap-0.5">
          {[...tables]
            .sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
            )
            .map((table) => (
              <button
                key={table.id}
                type="button"
                className={classNames(
                  'h-11 rounded-md px-3 text-left text-[15px] transition-colors',
                  selectedTableId === table.id
                    ? 'bg-[#45423d] font-semibold text-white'
                    : 'text-[#e4e4e7] hover:bg-[#383531]',
                )}
                onClick={() => onSelectTable(table.id)}
              >
                <span className="block truncate">
                  {table.name}
                  {table.storage === 'value' ? ' *' : ''}
                </span>
              </button>
            ))}
        </div>
      </div>
    </aside>
  )
}

function DataToolbar({
  isSaving,
  numRows,
  onAdd,
  onDelete,
  onEdit,
  popup,
  selectedDocument,
  selectedRows,
  table,
}: {
  isSaving: boolean
  numRows: number
  onAdd: () => void
  onDelete: () => void
  onEdit: () => void
  popup: PopupState
  selectedDocument?: LakebedAdminRow
  selectedRows: Set<string>
  table: LakebedAdminTable
}) {
  const selectionToolsEnabled = selectedRows.size > 0

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-full items-center gap-4">
          <div className="flex max-w-full flex-col gap-1">
            <h3 className="truncate font-mono text-3xl font-bold tracking-[0.04em] text-[#f8f8f2]">
              {table.name}
              {table.storage === 'value' && (
                <span className="font-sans text-base"> *</span>
              )}
            </h3>
          </div>
          {isSaving && (
            <div className="size-4 animate-spin rounded-full border-2 border-[#8b8983] border-t-[#f8f8f2]" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(!selectionToolsEnabled || popup?.type === 'addDocuments') && (
            <ToolbarButton
              disabled={table.storage === 'value' || isSaving}
              focused={popup?.type === 'addDocuments'}
              icon={<PlusIcon />}
              onClick={onAdd}
            >
              Add
            </ToolbarButton>
          )}
          {selectionToolsEnabled && (
            <ToolbarButton
              disabled={!selectedDocument || isSaving}
              icon={<Pencil1Icon />}
              onClick={onEdit}
            >
              Edit {selectedRows.size > 1 ? selectedRows.size : ''}
            </ToolbarButton>
          )}
          {selectionToolsEnabled && (
            <ToolbarButton
              disabled={table.storage === 'value' || isSaving}
              icon={<TrashIcon />}
              onClick={onDelete}
            >
              Delete {selectedRows.size > 1 ? selectedRows.size : ''}
            </ToolbarButton>
          )}
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md border border-[#57544f] bg-[#302e2a] text-[#f8f8f2] transition-colors hover:bg-[#383531]"
            aria-label="Table actions"
          >
            <DotsVerticalIcon className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-1 text-right text-sm text-[#f8f8f2]">
        {numRows.toLocaleString()} {numRows === 1 ? 'document' : 'documents'}
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  disabled,
  focused,
  icon,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  focused?: boolean
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={classNames(
        'flex h-10 items-center gap-2 rounded-md border border-[#57544f] bg-[#302e2a] px-3 text-sm font-semibold text-[#f8f8f2] transition-colors hover:bg-[#383531] disabled:cursor-not-allowed disabled:opacity-45',
        focused && 'ring-1 ring-[#8b949e]',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}

function DataFilters({
  columns,
  hiddenColumns,
  onHiddenColumnsChange,
  onRowFilterChange,
  onShowFiltersChange,
  onSortChange,
  rowFilter,
  showFilters,
  sort,
}: {
  columns: string[]
  hiddenColumns: string[]
  onHiddenColumnsChange: (columns: string[]) => void
  onRowFilterChange: (value: string) => void
  onShowFiltersChange: (showing: boolean) => void
  onSortChange: (sort: SortState) => void
  rowFilter: string
  showFilters: boolean
  sort?: SortState
}) {
  const [showColumns, setShowColumns] = useState(false)

  return (
    <div className="flex flex-col overflow-visible rounded-t-lg border border-[#57544f] bg-[#282622]">
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 items-center rounded-md border border-[#57544f] bg-[#302e2a] text-[#8b8983]">
            <button
              type="button"
              className="grid size-9 place-items-center border-r border-[#57544f]"
              aria-label="Previous page"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className="grid size-9 place-items-center"
              aria-label="Next page"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <button
            type="button"
            className={classNames(
              'flex h-9 items-center gap-2 rounded-md border border-[#57544f] bg-[#302e2a] px-3 text-sm font-medium text-[#f8f8f2]',
              showFilters && 'ring-1 ring-[#8b949e]',
            )}
            onClick={() => onShowFiltersChange(!showFilters)}
          >
            <span className="text-lg leading-none">⌘</span>
            Filter & Sort
            <ChevronDownIcon className="size-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-md border border-[#57544f] bg-[#302e2a] text-[#d4d4d8]"
              aria-label="Show or hide columns"
              onClick={() => setShowColumns((showing) => !showing)}
            >
              <EyeClosedIcon className="size-4" />
            </button>
            {showColumns && (
              <div className="absolute left-0 top-10 z-30 w-56 rounded-md border border-[#57544f] bg-[#302e2a] p-2 shadow-xl">
                {columns.map((column) => (
                  <label
                    key={column}
                    className="flex h-8 items-center gap-2 rounded px-2 text-sm text-[#f8f8f2] hover:bg-[#383531]"
                  >
                    <input
                      checked={!hiddenColumns.includes(column)}
                      disabled={column === '_id'}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onHiddenColumnsChange(
                            hiddenColumns.filter((hidden) => hidden !== column),
                          )
                        } else {
                          onHiddenColumnsChange([...hiddenColumns, column])
                        }
                      }}
                      type="checkbox"
                    />
                    <span className="truncate font-mono">{column}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-[#57544f] bg-[#302e2a] px-4 py-3">
          <label className="flex h-10 min-w-[280px] items-center gap-2 rounded-md border border-[#57544f] bg-[#282622] px-3 text-[#a1a1aa]">
            <MagnifyingGlassIcon className="size-4" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-[#f8f8f2] outline-none placeholder:text-[#a1a1aa]"
              onChange={(event) => onRowFilterChange(event.target.value)}
              placeholder="Filter documents"
              value={rowFilter}
            />
          </label>
          <select
            className="h-10 rounded-md border border-[#57544f] bg-[#282622] px-3 text-sm text-[#f8f8f2] outline-none"
            onChange={(event) =>
              onSortChange({
                column: event.target.value,
                direction: sort?.direction ?? 'asc',
              })
            }
            value={sort?.column ?? columns[0] ?? '_id'}
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="h-10 rounded-md border border-[#57544f] bg-[#282622] px-3 text-sm text-[#f8f8f2]"
            onClick={() =>
              onSortChange({
                column: sort?.column ?? columns[0] ?? '_id',
                direction: sort?.direction === 'asc' ? 'desc' : 'asc',
              })
            }
          >
            {sort?.direction === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      )}
    </div>
  )
}

function DataTable({
  columns,
  data,
  isSaving,
  onEditDocument,
  onSaveCell,
  onSelectRows,
  selectedRows,
}: {
  columns: string[]
  data: LakebedDocument[]
  isSaving: boolean
  onEditDocument: (row: LakebedAdminRow) => void
  onSaveCell: (
    row: LakebedAdminRow,
    column: string,
    value: unknown,
  ) => Promise<void>
  onSelectRows: (rows: Set<string>) => void
  selectedRows: Set<string>
}) {
  const tableColumns = useMemo<ResizableColumn[]>(
    () => [
      {
        Header: '*select',
        accessor: '__rowId',
        Cell: ({ row }: { row: Row<LakebedDocument> }) => (
          <TableCheckbox
            checked={selectedRows.has(row.original.__lakebedRow.id)}
            disabled={isSaving}
            onToggle={() => {
              const next = new Set(selectedRows)
              const id = row.original.__lakebedRow.id
              if (next.has(id)) {
                next.delete(id)
              } else {
                next.add(id)
              }
              onSelectRows(next)
            }}
          />
        ),
        disableResizing: true,
        id: '*select',
        width: 48,
      },
      ...columns.map((column) => ({
        Header: column,
        accessor: column,
        Cell: ({
          row,
          value,
        }: {
          row: Row<LakebedDocument>
          value: unknown
        }) => (
          <DataCell
            column={column}
            document={row.original}
            isEditable={!column.startsWith('_')}
            onEditDocument={() => onEditDocument(row.original.__lakebedRow)}
            onSave={(nextValue) =>
              onSaveCell(row.original.__lakebedRow, column, nextValue)
            }
            value={value}
          />
        ),
        id: column,
        minWidth: column === '_id' ? 140 : 170,
        width: column === '_id' ? 190 : 230,
      })),
    ],
    [columns, isSaving, onEditDocument, onSaveCell, onSelectRows, selectedRows],
  )

  const tableInstance = useTable(
    {
      columns: tableColumns as Column<LakebedDocument>[],
      data,
      getRowId: (row) => row.__rowId,
    },
    useBlockLayout,
    useResizeColumns,
  )

  const {
    getTableBodyProps,
    getTableProps,
    headerGroups,
    prepareRow,
    rows,
    totalColumnsWidth,
  } = tableInstance

  const toggleAll = () => {
    if (selectedRows.size === rows.length) {
      onSelectRows(new Set())
      return
    }
    onSelectRows(new Set(rows.map((row) => row.original.__lakebedRow.id)))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-lg border border-t-0 border-[#57544f] bg-[#282622]">
      <div className="min-h-[160px] flex-1 overflow-auto">
        {rows.length > 0 ? (
          <div
            {...getTableProps()}
            className="min-w-full font-mono text-xs text-[#f8f8f2]"
            style={{ width: totalColumnsWidth }}
          >
            <TableHeader
              allRowsSelected={
                rows.length > 0 && selectedRows.size === rows.length
              }
              headerGroups={headerGroups}
              onToggleAll={toggleAll}
              selectedRows={selectedRows}
            />
            <div {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row)
                const { key: rowKey, ...rowProps } = row.getRowProps()
                return (
                  <div
                    key={rowKey}
                    {...rowProps}
                    className="group flex"
                    style={{ height: rowHeight }}
                  >
                    {row.cells.map((cell) => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps()
                      return (
                        <div
                          key={cellKey}
                          {...cellProps}
                          className="h-full border-r border-b border-[#4b4945] transition-colors group-hover:bg-[#312f2b]"
                        >
                          {cell.render('Cell')}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-sm text-[#a1a1aa]">
            No documents.
          </div>
        )}
      </div>
    </div>
  )
}

function TableHeader({
  allRowsSelected,
  headerGroups,
  onToggleAll,
  selectedRows,
}: {
  allRowsSelected: boolean
  headerGroups: ReturnType<typeof useTable<LakebedDocument>>['headerGroups']
  onToggleAll: () => void
  selectedRows: Set<string>
}) {
  return (
    <div className="sticky top-0 z-20 bg-[#302e2a]">
      {headerGroups.map((headerGroup) => {
        const { key: groupKey, ...groupProps } =
          headerGroup.getHeaderGroupProps()
        return (
          <div
            key={groupKey}
            {...groupProps}
            className="border-x border-x-transparent"
          >
            {headerGroup.headers.map((column, columnIndex) => {
              const { key: columnKey, ...columnProps } = column.getHeaderProps()
              return (
                <div
                  key={columnKey}
                  {...columnProps}
                  className={classNames(
                    'group relative flex h-[38px] items-center border-b border-r border-[#57544f] bg-[#302e2a] px-3 text-left font-mono text-xs font-semibold text-[#d4d4d8]',
                    columnIndex === 0 && 'justify-center px-0',
                  )}
                >
                  {column.Header === '*select' ? (
                    <TableCheckbox
                      checked={allRowsSelected}
                      indeterminate={!allRowsSelected && selectedRows.size > 0}
                      onToggle={onToggleAll}
                    />
                  ) : (
                    <span className="truncate">{String(column.Header)}</span>
                  )}
                  {(() => {
                    const resizableColumn = column as ResizableHeader
                    return !resizableColumn.disableResizing &&
                      resizableColumn.getResizerProps ? (
                      <div
                        {...resizableColumn.getResizerProps()}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none"
                      />
                    ) : null
                  })()}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function TableCheckbox({
  checked,
  disabled,
  indeterminate,
  onToggle,
}: {
  checked: boolean
  disabled?: boolean
  indeterminate?: boolean
  onToggle: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  return (
    <label className="flex size-full cursor-pointer items-center justify-center">
      <input
        ref={inputRef}
        checked={checked}
        className="size-4 accent-[#8b8983]"
        disabled={disabled}
        onChange={onToggle}
        type="checkbox"
      />
    </label>
  )
}

function DataCell({
  column,
  document,
  isEditable,
  onEditDocument,
  onSave,
  value,
}: {
  column: string
  document: LakebedDocument
  isEditable: boolean
  onEditDocument: () => void
  onSave: (value: unknown) => Promise<void>
  value: unknown
}) {
  const cellRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [draft, setDraft] = useState(previewAdminValue(value))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    setDraft(previewAdminValue(value))
  }, [value])

  useClickAway(editorRef, () => {
    if (showEditor && !isSaving) setShowEditor(false)
  })

  const save = async () => {
    setError(undefined)
    setIsSaving(true)
    try {
      await onSave(parseAdminValue(draft))
      setShowEditor(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      ref={cellRef}
      className="relative flex size-full items-center hover:bg-[#34312d]"
    >
      <button
        type="button"
        className={classNames(
          'flex size-full items-center px-2 text-left font-mono text-xs text-[#f8f8f2] outline-none focus:ring-1 focus:ring-[#8b949e]',
          !isEditable && 'cursor-default text-[#a1a1aa]',
        )}
        onDoubleClick={() => {
          if (isEditable) setShowEditor(true)
        }}
        onKeyDown={(event) => {
          if (isEditable && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            setShowEditor(true)
          }
        }}
      >
        <DataCellValue column={column} value={value} />
      </button>
      <button
        type="button"
        className="absolute right-1 hidden size-7 place-items-center rounded border border-[#57544f] bg-[#302e2a] text-[#d4d4d8] shadow group-hover:grid hover:bg-[#383531]"
        aria-label="Cell actions"
        onClick={onEditDocument}
      >
        <DotsVerticalIcon className="size-4" />
      </button>
      {showEditor && isEditable && (
        <div
          ref={editorRef}
          className="absolute left-0 top-0 z-50 -ml-px min-w-[24rem] border border-[#8b949e] bg-[#302e2a] shadow-xl"
        >
          <textarea
            autoFocus
            className="h-32 w-full resize-none border-0 bg-[#282622] p-2 font-mono text-xs text-[#f8f8f2] outline-none"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                setShowEditor(false)
              }
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                void save()
              }
            }}
            value={draft}
          />
          <div className="flex items-center justify-between gap-2 border-t border-[#57544f] px-2 py-1 text-xs text-[#a1a1aa]">
            {error ? (
              <span className="truncate text-[#fecdd3]">{error}</span>
            ) : (
              <span>Esc to cancel · Cmd Enter to save</span>
            )}
            <button
              type="button"
              className="rounded border border-[#57544f] bg-[#383531] px-2 py-1 text-[#f8f8f2] disabled:opacity-45"
              disabled={isSaving}
              onClick={() => void save()}
            >
              Save
            </button>
          </div>
          <span className="sr-only">{document.__rowId}</span>
        </div>
      )}
    </div>
  )
}

function DataCellValue({ column, value }: { column: string; value: unknown }) {
  const stringValue = previewAdminValue(value)
  if (column === '_id') {
    return (
      <span className="flex-1 truncate font-semibold" aria-label="Document ID">
        {stringValue}
      </span>
    )
  }
  if (typeof value === 'string') {
    return (
      <span className="flex-1 truncate before:text-[#8b8983] before:content-['&quot;'] after:text-[#8b8983] after:content-['&quot;']">
        {stringValue.slice(0, 150)}
      </span>
    )
  }
  if (value === undefined) {
    return <span className="flex-1 truncate text-[#a1a1aa] italic">unset</span>
  }
  return <span className="flex-1 truncate">{stringValue.slice(0, 150)}</span>
}

function DocumentPanel({
  initialValue,
  isSaving,
  mode,
  onClose,
  onSave,
  tableName,
}: {
  initialValue: unknown
  isSaving: boolean
  mode: 'add' | 'edit'
  onClose: () => void
  onSave: (value: unknown) => Promise<void>
  tableName: string
}) {
  const [draft, setDraft] = useState(safeStringify(initialValue))
  const [error, setError] = useState<string>()

  const save = async () => {
    setError(undefined)
    try {
      await onSave(parseAdminValue(draft))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed')
    }
  }

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-[#57544f] bg-[#302e2a]">
      <div className="border-b border-[#57544f] px-4 py-4">
        <h3 className="font-mono text-xl font-semibold text-[#f8f8f2]">
          {mode === 'add' ? 'Add documents' : 'Edit document'}
        </h3>
        <p className="mt-1 text-sm text-[#a1a1aa]">{tableName}</p>
      </div>
      <textarea
        className="min-h-0 flex-1 resize-none bg-[#282622] p-4 font-mono text-sm leading-6 text-[#f8f8f2] outline-none"
        onChange={(event) => setDraft(event.target.value)}
        value={draft}
      />
      {error && (
        <div className="border-t border-[#8b3a42] bg-[#3d272b] px-4 py-2 text-sm text-[#fecdd3]">
          {error}
        </div>
      )}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#57544f] px-4 py-4">
        <button
          type="button"
          className="h-10 min-w-[5.75rem] rounded-md border border-[#57544f] bg-[#302e2a] px-3 text-sm font-semibold text-[#f8f8f2]"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="h-10 min-w-[5.75rem] rounded-md border border-[#57544f] bg-[#f8f8f2] px-3 text-sm font-semibold text-[#282622] disabled:opacity-45"
          disabled={isSaving}
          onClick={() => void save()}
        >
          Save
        </button>
      </div>
    </aside>
  )
}
