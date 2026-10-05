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
  tdsAmount,
} from './reportFormat.js'

const LEAD_COLUMNS = [
  { label: 'Date' },
  { label: 'Bill' },
  { label: 'Buyer' },
  { label: 'City' },
  { label: 'Invoice no.' },
  { label: 'Item' },
]

const SELLER_COLUMNS = [
  ...LEAD_COLUMNS,
  { label: 'Bags', numeric: true },
  { label: 'Packing', numeric: true },
  { label: 'Quintal', numeric: true },
  { label: 'Rate', numeric: true },
  { label: 'Amount', numeric: true },
  { label: 'Commission', numeric: true },
]

const TDS_COLUMNS = [
  ...LEAD_COLUMNS,
  { label: 'Amount', numeric: true },
  { label: 'Commission', numeric: true },
  { label: 'TDS Amount', numeric: true },
]

// One row per item the seller sold, with the buyer it went to.
// With `tds` set, only money is shown: the amount, the seller commission
// and the TDS on that commission.
function SellerReportTable({ items, totals, tds = false, tdsPercent }) {
  return (
    <ReportTable columns={tds ? TDS_COLUMNS : SELLER_COLUMNS}>
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
          {!tds && (
            <>
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
            </>
          )}
          <TableCell align="right" sx={numericCell}>
            {formatMoney(item.amount)}
          </TableCell>
          <TableCell align="right" sx={numericCell}>
            {formatMoney(item.seller_commision_amount)}
          </TableCell>
          {tds && (
            <TableCell align="right" sx={numericCell}>
              {formatMoney(tdsAmount(item.seller_commision_amount, tdsPercent))}
            </TableCell>
          )}
        </TableRow>
      ))}
      <TotalsRow>
        <TableCell data-first colSpan={6} align="right">
          Total
        </TableCell>
        {!tds && (
          <>
            <TableCell align="right" sx={numericCell}>
              {formatCount(totals.quantity_bags)}
            </TableCell>
            <TableCell />
            <TableCell align="right" sx={numericCell}>
              {formatWeight(totals.weight)}
            </TableCell>
            <TableCell />
          </>
        )}
        <TableCell align="right" sx={numericCell}>
          {formatMoney(totals.amount)}
        </TableCell>
        <TableCell align="right" sx={numericCell}>
          {formatMoney(totals.seller_commision_amount)}
        </TableCell>
        {tds && (
          <TableCell align="right" sx={numericCell}>
            {formatMoney(totals.tds_amount)}
          </TableCell>
        )}
      </TotalsRow>
    </ReportTable>
  )
}

export default SellerReportTable
