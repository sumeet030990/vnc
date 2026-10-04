import { TableCell, TableRow } from '@mui/material'
import {
  BillCell,
  GROUP_START,
  PartyCell,
  ReportTable,
  STRIPE_ROW,
  TotalsRow,
} from './ReportTable.jsx'
import {
  formatCount,
  formatDate,
  formatMoney,
  formatWeight,
  numericCell,
} from './reportFormat.js'

const COLUMNS = [
  { label: 'Date' },
  { label: 'Bill' },
  { label: 'Seller' },
  { label: 'City' },
  { label: 'Invoice no.' },
  { label: 'Item' },
  { label: 'Bags', numeric: true },
  { label: 'Quintal', numeric: true },
  { label: 'Rate', numeric: true },
  { label: 'Amount', numeric: true },
  { label: 'Commission', numeric: true },
]

// One row per seller item. The bill's date, number and commission span all of
// its item rows, so the commission shows (and adds up) only once per bill.
function BuyerReportTable({ bills, totals }) {
  return (
    <ReportTable columns={COLUMNS}>
      {bills.map((bill, billIndex) => {
        const span = bill.bill_items.length
        const note = [bill.transporter?.name, bill.lorry_number]
          .filter(Boolean)
          .join(' · ')
        const billCell = { rowSpan: span, sx: { verticalAlign: 'top' } }
        const billMoney = {
          ...billCell,
          align: 'right',
          sx: { ...billCell.sx, ...numericCell },
        }

        // Every other bill is shaded as a whole, since the date, bill and
        // commission cells span all of its rows. A line marks each new bill.
        return bill.bill_items.map((item, index) => (
          <TableRow
            key={item.id}
            className={
              [billIndex % 2 === 1 && STRIPE_ROW, index === 0 && GROUP_START]
                .filter(Boolean)
                .join(' ') || undefined
            }
            sx={{ breakInside: 'avoid' }}
          >
            {index === 0 && (
              <>
                <TableCell
                  {...billCell}
                  data-first
                  sx={{ ...billCell.sx, whiteSpace: 'nowrap' }}
                >
                  {formatDate(bill.bill_date)}
                </TableCell>
                <BillCell bill={bill} note={note} {...billCell} />
              </>
            )}
            <PartyCell party={item.seller} />
            <TableCell>{item.seller?.city || '—'}</TableCell>
            <TableCell>{item.seller_bill_no || '—'}</TableCell>
            <TableCell>{item.item?.name || '—'}</TableCell>
            <TableCell align="right" sx={numericCell}>
              {formatCount(item.quantity_bags)}
            </TableCell>
            <TableCell align="right" sx={numericCell}>
              {formatWeight(item.weight)}
            </TableCell>
            <TableCell align="right" sx={numericCell}>
              {formatMoney(item.souda_rate)}
            </TableCell>
            <TableCell align="right" sx={numericCell}>
              {formatMoney(item.amount)}
            </TableCell>
            {index === 0 && (
              <TableCell {...billMoney}>
                {formatMoney(bill.buyer_commision_amount)}
              </TableCell>
            )}
          </TableRow>
        ))
      })}
      <TotalsRow>
        <TableCell data-first colSpan={6} align="right">
          Total
        </TableCell>
        <TableCell align="right" sx={numericCell}>
          {formatCount(totals.quantity_bags)}
        </TableCell>
        <TableCell align="right" sx={numericCell}>
          {formatWeight(totals.weight)}
        </TableCell>
        <TableCell />
        <TableCell align="right" sx={numericCell}>
          {formatMoney(totals.amount)}
        </TableCell>
        <TableCell align="right" sx={numericCell}>
          {formatMoney(totals.buyer_commision_amount)}
        </TableCell>
      </TotalsRow>
    </ReportTable>
  )
}

export default BuyerReportTable
