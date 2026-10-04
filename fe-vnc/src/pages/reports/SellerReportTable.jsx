import { TableCell, TableRow } from '@mui/material'
import {
  BillCell,
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
  { label: 'Buyer' },
  { label: 'City' },
  { label: 'Invoice no.' },
  { label: 'Item' },
  { label: 'Bags', numeric: true },
  { label: 'Packing', numeric: true },
  { label: 'Quintal', numeric: true },
  { label: 'Rate', numeric: true },
  { label: 'Amount', numeric: true },
  { label: 'Commission', numeric: true },
]

// One row per item the seller sold, with the buyer it went to.
function SellerReportTable({ items, totals }) {
  return (
    <ReportTable columns={COLUMNS}>
      {items.map((item, index) => (
        <TableRow
          key={item.id}
          className={index % 2 === 1 ? STRIPE_ROW : undefined}
          sx={{ breakInside: 'avoid' }}
        >
          <TableCell data-first sx={{ whiteSpace: 'nowrap' }}>
            {formatDate(item.bill.bill_date)}
          </TableCell>
          <BillCell bill={item.bill} note={item.bill.lorry_number} />
          <PartyCell party={item.bill.buyer} />
          <TableCell>{item.bill.buyer?.city || '—'}</TableCell>
          <TableCell>{item.seller_bill_no || '—'}</TableCell>
          <TableCell>{item.item?.name || '—'}</TableCell>
          <TableCell align="right" sx={numericCell}>
            {formatCount(item.quantity_bags)}
          </TableCell>
          <TableCell align="right" sx={numericCell}>
            {formatCount(item.packaging)}
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
          <TableCell align="right" sx={numericCell}>
            {formatMoney(item.seller_commision_amount)}
          </TableCell>
        </TableRow>
      ))}
      <TotalsRow>
        <TableCell data-first colSpan={6} align="right">
          Total
        </TableCell>
        <TableCell align="right" sx={numericCell}>
          {formatCount(totals.quantity_bags)}
        </TableCell>
        <TableCell />
        <TableCell align="right" sx={numericCell}>
          {formatWeight(totals.weight)}
        </TableCell>
        <TableCell />
        <TableCell align="right" sx={numericCell}>
          {formatMoney(totals.amount)}
        </TableCell>
        <TableCell align="right" sx={numericCell}>
          {formatMoney(totals.seller_commision_amount)}
        </TableCell>
      </TotalsRow>
    </ReportTable>
  )
}

export default SellerReportTable
