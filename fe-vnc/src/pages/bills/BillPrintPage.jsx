import { useEffect, useRef } from 'react'
import { Link as RouterLink, useParams } from 'react-router'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  GlobalStyles,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import PrintOutlined from '@mui/icons-material/PrintOutlined'
import { useBill } from '../../api/bills.js'
import { formatCount, formatMoney } from './billForm.js'

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'App'

// bill_date is a date-only value stored at UTC midnight, so show it in UTC.
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'long',
  timeZone: 'UTC',
})
const weightFormat = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const sum = (rows, field) =>
  rows.reduce((total, row) => total + (row[field] ?? 0), 0)

// On paper: A4, no app chrome, and only the bill itself.
const printStyles = (
  <GlobalStyles
    styles={{
      '@page': { size: 'A4', margin: '12mm' },
      '@media print': {
        body: { backgroundColor: '#FFFFFF' },
        '.no-print': { display: 'none !important' },
      },
    }}
  />
)

// Label above a value, used for the bill details at the top.
function Detail({ label, value, align = 'left' }) {
  return (
    <Box sx={{ textAlign: align, minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary" component="p">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

// One line in the money summary under the items.
function SummaryRow({ label, value, strong = false }) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'space-between',
        py: 0.75,
        ...(strong && {
          borderTop: 1,
          borderColor: 'divider',
          mt: 0.5,
          pt: 1.25,
        }),
      }}
    >
      <Typography
        variant={strong ? 'subtitle1' : 'body2'}
        color={strong ? 'text.primary' : 'text.secondary'}
        sx={{ fontWeight: strong ? 600 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant={strong ? 'subtitle1' : 'body2'}
        sx={{
          fontWeight: strong ? 700 : 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatMoney(value)}
      </Typography>
    </Stack>
  )
}

const ITEM_COLUMNS = [
  { label: '#' },
  { label: 'Seller' },
  { label: 'Seller bill no.' },
  { label: 'Item' },
  { label: 'Bags', numeric: true },
  { label: 'Packing (kg)', numeric: true },
  { label: 'Weight (qtl)', numeric: true },
  { label: 'Rate', numeric: true },
  { label: 'Amount', numeric: true },
  { label: 'Commission', numeric: true },
]

const numericCell = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

function BillDocument({ bill }) {
  const items = bill.bill_items
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '12px',
        boxShadow: (t) => t.customShadows.md,
        p: { xs: 3, sm: 6 },
        '@media print': { boxShadow: 'none', borderRadius: 0, p: 0 },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="p">
            {APP_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Commission bill
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" component="h1">
            Bill #{bill.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dateFormat.format(new Date(bill.bill_date))}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          height: 3,
          width: 48,
          bgcolor: 'secondary.main',
          my: 3,
          borderRadius: 2,
        }}
      />

      {/* Parties and lorry */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          mb: 4,
        }}
      >
        <Detail label="Buyer" value={bill.buyer?.name} />
        <Detail label="Transporter" value={bill.transporter?.name} />
        <Detail label="Lorry number" value={bill.lorry_number} />
        <Detail label="Driver contact" value={bill.lorry_driver_contact} />
      </Box>

      {/* Items */}
      <Box sx={{ overflowX: 'auto', '@media print': { overflow: 'visible' } }}>
        <Table size="small" sx={{ '& td, & th': { px: 1 } }}>
          <TableHead>
            <TableRow>
              {ITEM_COLUMNS.map((col) => (
                <TableCell
                  key={col.label}
                  align={col.numeric ? 'right' : 'left'}
                  sx={{
                    typography: 'caption',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, index) => (
              <TableRow key={row.id} sx={{ breakInside: 'avoid' }}>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {index + 1}
                </TableCell>
                <TableCell>{row.seller?.name || '—'}</TableCell>
                <TableCell>{row.seller_bill_no || '—'}</TableCell>
                <TableCell>{row.item?.name || '—'}</TableCell>
                <TableCell align="right" sx={numericCell}>
                  {formatCount(row.quantity_bags)}
                </TableCell>
                <TableCell align="right" sx={numericCell}>
                  {formatCount(row.packaging)}
                </TableCell>
                <TableCell align="right" sx={numericCell}>
                  {weightFormat.format(row.weight)}
                </TableCell>
                <TableCell align="right" sx={numericCell}>
                  {formatMoney(row.souda_rate)}
                </TableCell>
                <TableCell align="right" sx={numericCell}>
                  {formatMoney(row.amount)}
                </TableCell>
                <TableCell align="right" sx={numericCell}>
                  {formatMoney(row.seller_commision_amount)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { fontWeight: 600, borderBottom: 0 } }}>
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell align="right" sx={numericCell}>
                {formatCount(sum(items, 'quantity_bags'))}
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={numericCell}>
                {weightFormat.format(sum(items, 'weight'))}
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={numericCell}>
                {formatMoney(sum(items, 'amount'))}
              </TableCell>
              <TableCell align="right" sx={numericCell}>
                {formatMoney(sum(items, 'seller_commision_amount'))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Money summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Box sx={{ width: { xs: '100%', sm: 320 }, breakInside: 'avoid' }}>
          <SummaryRow
            label="Buyer commission"
            value={bill.buyer_commision_amount}
          />
          <SummaryRow label="Freight" value={bill.freight} />
          <SummaryRow label="Advance freight" value={bill.advance_freight} />
          <SummaryRow label="Lorry brokerage" value={bill.lorry_brokerage} />
          <SummaryRow label="Total amount" value={bill.total_amount} strong />
        </Box>
      </Box>

      {/* Signature */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 10,
          breakInside: 'avoid',
        }}
      >
        <Box
          sx={{
            width: 200,
            borderTop: 1,
            borderColor: 'text.secondary',
            pt: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Authorised signature
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// Clean, app-bar-free view of one bill. Opens the print window once it loads.
function BillPrintPage() {
  const { id } = useParams()
  const bill = useBill(id)
  const printed = useRef(false)

  useEffect(() => {
    if (!bill.data || printed.current) return
    printed.current = true
    // Wait for fonts so the first print preview isn't missing text.
    document.fonts.ready.then(() => window.print())
  }, [bill.data])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 2, sm: 5 },
        px: 2,
        '@media print': { bgcolor: 'background.paper', p: 0, minHeight: 0 },
      }}
    >
      {printStyles}
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Stack
          className="no-print"
          direction="row"
          sx={{ justifyContent: 'space-between', mb: 3 }}
        >
          <Button
            component={RouterLink}
            to="/commission-bills"
            color="inherit"
            startIcon={<ArrowBack />}
          >
            Back to bills
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintOutlined />}
            onClick={() => window.print()}
            disabled={!bill.data}
          >
            Print
          </Button>
        </Stack>

        {bill.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}
        {bill.isError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => bill.refetch()}
              >
                Try again
              </Button>
            }
          >
            Could not load this bill: {bill.error.message}
          </Alert>
        )}
        {bill.data && <BillDocument bill={bill.data} />}
      </Box>
    </Box>
  )
}

export default BillPrintPage
