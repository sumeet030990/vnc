import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { partyMeta } from './reportFormat.js'

// Paper uses the bill print page's black, grey and white, so it reads well
// on a black-and-white printer.
const INK = '#000000'
const LINE = '#9E9E9E'
const STRIPE = '#F0F0F0'
// A shade darker than the stripes, so the header and totals stand out.
const HEADER_FILL = '#E0E0E0'

// Row class names the tables use: STRIPE_ROW shades every other row (or bill),
// GROUP_START draws a line where a new bill starts.
export const STRIPE_ROW = 'report-stripe'
export const GROUP_START = 'report-group-start'

// Card with a navy header row, matching the other tables in the app.
// columns: [{ label, numeric }]. Rows (and the totals row) come as children.
// Cells in the real first column get `data-first`, so they skip the left grid line.
export function ReportTable({ columns, children }) {
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${alpha(t.palette.primary.main, 0.05)}`,
        boxShadow: t.customShadows.md,
        '@media print': {
          boxShadow: 'none',
          borderColor: INK,
          borderRadius: '8px',
        },
      })}
    >
      {/* Wide reports scroll sideways on small screens. */}
      <Box sx={{ overflowX: 'auto', '@media print': { overflow: 'visible' } }}>
        <Table
          size="small"
          sx={(t) => ({
            '& td': { py: 1.25 },
            [`& tr.${STRIPE_ROW} td`]: {
              bgcolor: alpha(t.palette.primary.main, 0.025),
            },
            [`& tr.${GROUP_START} td`]: {
              borderTop: `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
            },
            // On paper the whole table must fit the A4 width: small text,
            // tight cells, and headers that may wrap onto two lines.
            // Grid lines and shading follow the printed bill.
            '@media print': {
              width: '100%',
              '& th, & td': {
                fontSize: '7.5pt',
                lineHeight: 1.3,
                px: '4px',
                py: '3px',
                color: INK,
                borderLeft: `1px solid ${LINE}`,
              },
              '& [data-first]': { borderLeft: 0 },
              // Body rows: only column lines, plus a line between bills.
              '& tbody td': { borderBottom: 0 },
              [`& tr.${STRIPE_ROW} td`]: { bgcolor: STRIPE },
              [`& tr.${GROUP_START} td`]: { borderTop: `1px solid ${LINE}` },
              '& th': { whiteSpace: 'normal', letterSpacing: 0 },
              '& td .MuiTypography-root': { fontSize: 'inherit' },
              '& td .MuiTypography-caption': { fontSize: '6.5pt' },
              '& td .MuiTypography-noWrap': { whiteSpace: 'normal' },
            },
          })}
        >
          <TableHead sx={{ display: 'table-header-group' }}>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={col.label}
                  data-first={index === 0 || undefined}
                  align={col.numeric ? 'right' : 'left'}
                  sx={(t) => ({
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    bgcolor: 'primary.main',
                    color: alpha(t.palette.common.white, 0.85),
                    borderBottom: 0,
                    // On paper: grey fill, black text, black line under it.
                    '@media print': {
                      bgcolor: HEADER_FILL,
                      fontWeight: 600,
                      borderBottom: `1px solid ${INK}`,
                    },
                  })}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </Box>
    </Paper>
  )
}

// Bold totals row at the bottom of a report table.
export function TotalsRow({ children }) {
  return (
    <TableRow
      sx={(t) => ({
        bgcolor: alpha(t.palette.secondary.main, 0.08),
        '& td': {
          fontWeight: 700,
          borderBottom: 0,
          borderTop: `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
        },
        // On paper: same grey fill as the header, with a black line on top.
        '@media print': {
          '& td': { bgcolor: HEADER_FILL, borderTop: `1px solid ${INK}` },
        },
      })}
    >
      {children}
    </TableRow>
  )
}

// The other party on a row: name, then GSTIN in small grey text.
export function PartyCell({ party, ...props }) {
  const meta = partyMeta(party)
  return (
    <TableCell {...props}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {party?.name || '—'}
      </Typography>
      {meta && (
        <Typography variant="caption" color="text.secondary" component="p">
          {meta}
        </Typography>
      )}
    </TableCell>
  )
}

// Bill number, with a small grey line under it (transporter or lorry).
export function BillCell({ bill, note, ...props }) {
  return (
    <TableCell {...props}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        #{bill.id}
      </Typography>
      {note && (
        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          noWrap
        >
          {note}
        </Typography>
      )}
    </TableCell>
  )
}
