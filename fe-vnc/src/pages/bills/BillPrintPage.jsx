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

// Total of the charges in the summary: commission + freight + brokerage, less advance freight.
// This is not the saved total_amount, which is the sum of the item amounts.
const chargesTotal = (bill) =>
  (bill.buyer_commision_amount ?? 0) +
  (bill.freight ?? 0) +
  (bill.lorry_brokerage ?? 0) -
  (bill.advance_freight ?? 0)

// A4 sheet size and the blank border around the bill on paper.
const PAGE_WIDTH = '210mm'
const PAGE_HEIGHT = '297mm'
const PAGE_MARGIN = '12mm'

// On paper: A4, no app chrome, and only the bill itself.
const printStyles = (
  <GlobalStyles
    styles={{
      // No page margin, so the browser has no room to print its own
      // date, title and URL. The bill adds the white border itself (below).
      '@page': { size: 'A4', margin: 0 },
      '@media print': {
        // Print the grey row shading too (browsers skip backgrounds by default).
        body: {
          backgroundColor: '#FFFFFF',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        },
        '.no-print': { display: 'none !important' },
      },
    }}
  />
)

// The bill is printed in black and white, so it uses only black, grey and white.
const INK = '#000000'
const LINE = '#9E9E9E'
const STRIPE = '#F0F0F0'
// A shade darker than the stripes, so the header stands out from the rows.
const HEADER_FILL = '#E0E0E0'

// Small grey heading used above each block (Billed to, Transport, ...).
function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      component="p"
      sx={{ lineHeight: 1.6, mb: 0.5 }}
    >
      {children}
    </Typography>
  )
}

// "Label: value" on one line; hidden when the value is empty.
function InfoLine({ label, value, variant = 'body2' }) {
  if (!value) return null
  return (
    <Typography variant={variant}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}:{' '}
      </Box>
      <Box component="span" sx={{ fontWeight: 500 }}>
        {value}
      </Box>
    </Typography>
  )
}

// Outlined panel used for the buyer and transport blocks.
const panelSx = {
  border: 1,
  borderColor: LINE,
  borderRadius: '8px',
  px: 2,
  py: 1.5,
  breakInside: 'avoid',
}

// Company name, address, contacts and tax numbers centred, then the bill number and date.
function CompanyHeader({ company, bill }) {
  const address = formatAddress(company)
  const phones = [company?.primary_mobile_no, company?.secondary_mobile_no]
    .filter(Boolean)
    .join(', ')
  const emails = [company?.primary_email, company?.secondary_email]
    .filter(Boolean)
    .join(', ')

  return (
    <Box sx={{ pb: 1, borderBottom: 2, borderColor: INK }}>
      {/* Company details, centred */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" component="p" sx={{ mb: 0.5, color: INK }}>
          {company?.name || APP_NAME}
        </Typography>
        {address && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {address}
          </Typography>
        )}
        <Stack
          direction="row"
          sx={{ flexWrap: 'wrap', justifyContent: 'center', columnGap: 3 }}
        >
          <InfoLine label="Phone" value={phones} />
          <InfoLine label="Email" value={emails} />
        </Stack>
        <Stack
          direction="row"
          sx={{ flexWrap: 'wrap', justifyContent: 'center', columnGap: 3 }}
        >
          <InfoLine label="GSTIN" value={company?.gst_number} />
          <InfoLine label="PAN" value={company?.pan_number} />
        </Stack>
      </Box>

      {/* Bill number on the left, date on the right */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'baseline',
          mt: 1.5,
        }}
      >
        <Typography variant="h6" component="h1" sx={{ color: INK }}>
          Bill #{bill.id}
        </Typography>
        <InfoLine
          label="Date"
          value={dateFormat.format(new Date(bill.bill_date))}
        />
      </Stack>
    </Box>
  )
}

// Buyer name and address, then contact, state, GST and PAN in two columns.
function BuyerPanel({ buyer }) {
  const address = formatAddress({
    address: buyer?.address,
    city: buyer?.city,
    pin_code: buyer?.pin_code,
  })
  return (
    <Box sx={panelSx}>
      <SectionLabel>Billed to</SectionLabel>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {buyer?.name || '—'}
      </Typography>
      {address && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {address}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 3,
          rowGap: 0.25,
          mt: 0.5,
        }}
      >
        {/* Contact and state always show (dash when blank); GST and PAN only when saved. */}
        <InfoLine label="Contact" value={buyer?.primary_mobile_no || '—'} />
        <InfoLine
          label="State"
          value={
            [buyer?.state, buyer?.state_code && `(${buyer.state_code})`]
              .filter(Boolean)
              .join(' ') || '—'
          }
        />
        <InfoLine label="GSTIN" value={buyer?.gst_number} />
        <InfoLine label="PAN" value={buyer?.pan_number} />
      </Box>
    </Box>
  )
}

// Everything about transport in one box: lorry details on the left,
// transport charges and their total on the right.
function TransportPanel({ bill }) {
  return (
    <Box sx={panelSx}>
      <SectionLabel>Transport details</SectionLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          alignItems: 'start',
          columnGap: 3,
        }}
      >
        <Stack spacing={0.5} sx={{ pt: 0.4 }}>
          <InfoLine label="Transporter" value={bill.transporter?.name || '—'} />
          <InfoLine label="Lorry number" value={bill.lorry_number || '—'} />
          <InfoLine
            label="Driver contact"
            value={bill.lorry_driver_contact || '—'}
          />
        </Stack>
        <Box sx={{ borderLeft: 1, borderColor: LINE, pl: 3 }}>
          <SummaryRow label="Freight" value={bill.freight} />
          <SummaryRow
            label="Buyer Brokerage"
            value={bill.buyer_commision_amount}
          />
          <SummaryRow label="Advance freight" value={bill.advance_freight} />
          <SummaryRow label="Lorry brokerage" value={bill.lorry_brokerage} />
          <SummaryRow label="Total amount" value={chargesTotal(bill)} strong />
        </Box>
      </Box>
    </Box>
  )
}

// One line in the transport charges.
function SummaryRow({ label, value, strong = false }) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'space-between',
        py: 0.4,
        ...(strong && {
          mt: 0.75,
          pt: 1,
          borderTop: '3px double',
          borderColor: INK,
        }),
      }}
    >
      <Typography
        variant={strong ? 'subtitle1' : 'body2'}
        color={strong ? 'inherit' : 'text.secondary'}
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

// Headers are all centred. Widths are hints: Seller and Item get more room, Invoice no. and Packing less.
const ITEM_COLUMNS = [
  { label: '#', width: '4%' },
  { label: 'Seller', width: '26%' },
  { label: 'Invoice no.', width: '10%' },
  { label: 'Item', width: '14%' },
  { label: 'Bags' },
  { label: 'Packing', width: '7%' },
  { label: 'Quintal' },
  { label: 'Rate' },
  { label: 'Amount' },
]

// The items table stretches to fill the A4 sheet, but never gets shorter than this.
const ITEMS_MIN_HEIGHT = '60mm'

const numericCell = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

// Full grid table: bold header, grey lines between every cell, totals row at the end.
function ItemsTable({ items }) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: INK,
        borderRadius: '8px',
        overflow: 'hidden',
        // Take all the height left on the sheet, so the signature lands at the bottom.
        // Never shrink, or a long bill would get cut off instead of going to page 2.
        flex: '1 0 auto',
        minHeight: ITEMS_MIN_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Table
        size="small"
        sx={{
          // The table grows to fill the box; the spacer row takes the extra space.
          flex: '1 0 auto',
          '& td, & th': {
            px: 1,
            py: 0.75,
            borderBottom: 1,
            borderRight: 1,
            borderColor: LINE,
          },
          '& td:last-of-type, & th:last-of-type': { borderRight: 0 },
          // Body rows: a little taller, and no lines between them (only column lines).
          '& tbody td': { py: 1, borderBottom: 0 },
        }}
      >
        <TableHead sx={{ display: 'table-header-group' }}>
          <TableRow
            sx={{ bgcolor: HEADER_FILL, '& th': { borderBottomColor: INK } }}
          >
            {ITEM_COLUMNS.map((col) => (
              <TableCell
                key={col.label}
                align="center"
                sx={{
                  width: col.width,
                  typography: 'caption',
                  fontWeight: 600,
                  color: INK,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                breakInside: 'avoid',
                // Light grey on every other row; still reads well in black and white.
                ...(index % 2 === 1 && { bgcolor: STRIPE }),
              }}
            >
              <TableCell align="center" sx={{ color: 'text.secondary' }}>
                {index + 1}
              </TableCell>
              <TableCell align="center">{row.seller?.name || '—'}</TableCell>
              <TableCell align="center">{row.seller_bill_no || '—'}</TableCell>
              <TableCell align="center">{row.item?.name || '—'}</TableCell>
              <TableCell align="center" sx={numericCell}>
                {formatCount(row.quantity_bags)}
              </TableCell>
              <TableCell align="center" sx={numericCell}>
                {formatCount(row.packaging)}
              </TableCell>
              <TableCell align="center" sx={numericCell}>
                {weightFormat.format(row.weight)}
              </TableCell>
              <TableCell align="center" sx={numericCell}>
                {formatMoney(row.souda_rate)}
              </TableCell>
              <TableCell align="center" sx={numericCell}>
                {formatMoney(row.amount)}
              </TableCell>
            </TableRow>
          ))}
          {/* Empty row that stretches to fill the table, keeping the column lines. */}
          <TableRow aria-hidden sx={{ height: '100%' }}>
            {ITEM_COLUMNS.map((col) => (
              <TableCell key={col.label} sx={{ py: 0, borderBottom: 0 }} />
            ))}
          </TableRow>
          <TableRow
            sx={{
              '& td': {
                fontWeight: 700,
                borderBottom: 0,
                borderTop: 1,
                borderTopColor: INK,
              },
            }}
          >
            <TableCell colSpan={4} align="right">
              Total
            </TableCell>
            <TableCell align="center" sx={numericCell}>
              {formatCount(sum(items, 'quantity_bags'))}
            </TableCell>
            <TableCell />
            <TableCell align="center" sx={numericCell}>
              {weightFormat.format(sum(items, 'weight'))}
            </TableCell>
            <TableCell />
            <TableCell align="center" sx={numericCell}>
              {formatMoney(sum(items, 'amount'))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}

// Also drawn off-screen on the bills list, to make the WhatsApp PDF.
export function BillDocument({ bill, company, ref }) {
  return (
    // On screen this is drawn as an A4 sheet, so it looks the same as on paper.
    <Box
      ref={ref}
      sx={{
        boxSizing: 'border-box',
        width: PAGE_WIDTH,
        minHeight: PAGE_HEIGHT,
        // A column that fills the sheet: the items table takes the spare height.
        display: 'flex',
        flexDirection: 'column',
        mx: 'auto',
        p: PAGE_MARGIN,
        bgcolor: 'background.paper',
        borderRadius: '4px',
        boxShadow: (t) => t.customShadows.md,
        '@media print': {
          width: 'auto',
          // A hair under 297mm, so rounding never pushes a blank second page.
          minHeight: `calc(${PAGE_HEIGHT} - 1mm)`,
          boxShadow: 'none',
          borderRadius: 0,
          p: PAGE_MARGIN,
        },
      }}
    >
      <CompanyHeader company={company} bill={bill} />

      <Box sx={{ my: 2 }}>
        <BuyerPanel buyer={bill.buyer} />
      </Box>

      <ItemsTable items={bill.bill_items} />

      <Box sx={{ mt: 2 }}>
        <TransportPanel bill={bill} />
      </Box>

      {/* Signature */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 2,
          breakInside: 'avoid',
        }}
      >
        <Box sx={{ width: 220, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            For {company?.name || APP_NAME}
          </Typography>
          <Box
            sx={{
              mt: 5,
              borderTop: 1,
              borderColor: INK,
              pt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Authorised signatory
            </Typography>
          </Box>
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
