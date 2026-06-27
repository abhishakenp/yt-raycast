import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  Table as UITable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx'

// Compound primitive: flatten Table/TableHeader/TableRow/... into a single
// node driven by `columns` + `rows`. Each row is keyed by column `key`.
// Sample defaults let it render standalone with no data wired up.
const sampleColumns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
]

const sampleRows: Array<Record<string, string>> = [
  { name: 'Invoice #1024', status: 'Paid', amount: '$250.00' },
  { name: 'Invoice #1025', status: 'Pending', amount: '$150.00' },
  { name: 'Invoice #1026', status: 'Unpaid', amount: '$350.00' },
]

export const Table = defineCapsule({
  name: 'Table',
  description:
    'Data table. `columns` define headers (key+label); each `rows` object maps column key -> cell text. Optional caption.',
  props: z.object({
    columns: z
      .array(z.object({ key: z.string(), label: z.string() }))
      .optional(),
    rows: z.array(z.record(z.string(), z.string())).optional(),
    caption: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const columns = props.columns?.length ? props.columns : sampleColumns
    const rows = props.rows?.length ? props.rows : sampleRows
    return (
      <UITable className={props.className}>
        {props.caption && <TableCaption>{props.caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.key}>{row[col.key] ?? ''}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </UITable>
    )
  },
})
