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
import { MAIN_COMPANY_ID, useCompany } from '../../api/companies.js'
import { formatCount, formatMoney } from './billForm.js'

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'App'

// "Street, City, State - 400001", skipping any empty parts.
function formatAddress({ address, city, state, pin_code } = {}) {
  const line = [address, city, state].filter(Boolean).join(', ')
  return [line, pin_code].filter(Boolean).join(' - ')
}

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

// A4 sheet size and the blank border around the bill on paper.
const PAGE_WIDTH = '210mm'
const PAGE_HEIGHT = '297mm'
const PAGE_MARGIN = '12mm'

// On paper: A4, no app chrome, and only the bill itself.
const printStyles = (
  <GlobalStyles
    styles={{
      '@page': { size: 'A4', margin: PAGE_MARGIN },
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

// Buyer name with their address, contact, state, GST and PAN number below.
function BuyerDetail({ buyer }) {
  const lines = [
    formatAddress({
      address: buyer?.address,
      city: buyer?.city,
      pin_code: buyer?.pin_code,
    }),
    buyer?.primary_mobile_no && `Contact: ${buyer.primary_mobile_no}`,
    buyer?.state && `State: ${buyer.state}`,
    buyer?.gst_number && `GST: ${buyer.gst_number}`,
    buyer?.pan_number && `PAN: ${buyer.pan_number}`,
  ].filter(Boolean)

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary" component="p">
        Buyer
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {buyer?.name || '—'}
      </Typography>
      {lines.map((line) => (
        <Typography key={line} variant="body2" color="text.secondary">
          {line}
        </Typography>
      ))}
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
  { label: 'Invoice no.' },
  { label: 'Item' },
  { label: 'Bags' },
  { label: 'Packing' },
  { label: 'Quintal' },
  { label: 'Rate' },
  { label: 'Amount' },
]

const numericCell = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

function BillDocument({ bill, company }) {
  const items = bill.bill_items
  const companyAddress = formatAddress(company)
  return (
    // On screen this is drawn as an A4 sheet, so it looks the same as on paper.
    <Box
      sx={{
        boxSizing: 'border-box',
        width: PAGE_WIDTH,
        minHeight: PAGE_HEIGHT,
        mx: 'auto',
        p: PAGE_MARGIN,
        bgcolor: 'background.paper',
        borderRadius: '4px',
        boxShadow: (t) => t.customShadows.md,
        '@media print': {
          width: 'auto',
          minHeight: 0,
          boxShadow: 'none',
          borderRadius: 0,
          p: 0,
        },
      }}
    >
      {/* Company header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
          {company?.name || APP_NAME}
        </Typography>
        {companyAddress && (
          <Typography variant="body2" color="text.secondary">
            {companyAddress}
          </Typography>
        )}
        <Box
          sx={{
            height: 3,
            width: 48,
            bgcolor: 'secondary.main',
            mx: 'auto',
            my: 3,
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Bill number and date */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" component="h1">
            Bill #{bill.id}
          </Typography>
        </Box>
        <Typography variant="body1">
          <Box component="span" sx={{ color: 'text.secondary' }}>
            Date:{' '}
          </Box>
          <Box component="span" sx={{ fontWeight: 500 }}>
            {dateFormat.format(new Date(bill.bill_date))}
          </Box>
        </Typography>
      </Stack>

      {/* Parties and lorry */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'start',
          gap: 3,
          mb: 4,
        }}
      >
        <BuyerDetail buyer={bill.buyer} />
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
                  align="center"
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

// Clean, app-bar-free view of one bill. Printing starts only from the Print button.
function BillPrintPage() {
  const { id } = useParams()
  const bill = useBill(id)
  const company = useCompany(MAIN_COMPANY_ID)
  // If the company fails to load, still show the bill with the app name.
  const ready = Boolean(bill.data) && !company.isPending

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
      <Box sx={{ maxWidth: PAGE_WIDTH, mx: 'auto' }}>
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
            disabled={!ready}
          >
            Print
          </Button>
        </Stack>

        {(bill.isPending || (bill.data && company.isPending)) && (
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
        {ready && (
          // Small screens scroll sideways instead of squeezing the A4 sheet.
          <Box
            sx={{ overflowX: 'auto', '@media print': { overflow: 'visible' } }}
          >
            <BillDocument bill={bill.data} company={company.data} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default BillPrintPage
