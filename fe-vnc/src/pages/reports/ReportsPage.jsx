import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  GlobalStyles,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import PrintOutlined from '@mui/icons-material/PrintOutlined'
import { useReport } from '../../api/reports.js'
import { useUserOptions } from '../../api/users.js'
import TableEmptyState from '../../components/table/TableEmptyState.jsx'
import OptionPicker from '../bills/OptionPicker.jsx'
import BuyerReportTable from './BuyerReportTable.jsx'
import SellerReportTable from './SellerReportTable.jsx'
import {
  currentFinancialYear,
  formatCount,
  formatDate,
  formatMoney,
  formatWeight,
} from './reportFormat.js'

const REPORT_TYPES = {
  buyer: {
    person: 'Buyer',
  },
  seller: {
    person: 'Seller',
  },
}

// On paper: landscape A4, without the top bar or the filters.
const printStyles = (
  <GlobalStyles
    styles={{
      '@page': { size: 'A4 landscape', margin: '10mm' },
      '@media print': {
        body: {
          backgroundColor: '#FFFFFF',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        },
        '.MuiAppBar-root, .no-print': { display: 'none !important' },
        'main.MuiContainer-root': { padding: '0 !important' },
      },
    }}
  />
)

// "Address, City, State - 440001", skipping empty parts.
function formatAddress({ address, city, state, pin_code } = {}) {
  const line = [address, city, state].filter(Boolean).join(', ')
  return [line, pin_code].filter(Boolean).join(' - ')
}

// "Label: value"; hidden when the value is empty.
function InfoLine({ label, value }) {
  if (!value) return null
  return (
    <Typography variant="body2">
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}:{' '}
      </Box>
      <Box component="span" sx={{ fontWeight: 500 }}>
        {value}
      </Box>
    </Typography>
  )
}

// Who the report is about, and the period it covers.
function PartyPanel({ title, party, from, to }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '12px',
        '@media print': { boxShadow: 'none', p: 0, mb: 1 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" component="h2">
            {party.name || `#${party.id}`}
          </Typography>
          {formatAddress(party) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatAddress(party)}
            </Typography>
          )}
          <Stack
            direction="row"
            sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 0.25, mt: 1 }}
          >
            <InfoLine label="Contact" value={party.primary_mobile_no} />
            <InfoLine label="GSTIN" value={party.gst_number} />
            <InfoLine label="PAN" value={party.pan_number} />
          </Stack>
        </Box>
        <Box sx={{ textAlign: { sm: 'right' }, flexShrink: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Period
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {formatDate(from)} – {formatDate(to)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

// Row of small total tiles; the last one (commission) gets the gold accent.
function TotalTiles({ tiles }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          md: `repeat(${tiles.length}, 1fr)`,
        },
        gap: 2,
        '@media print': { display: 'none' },
      }}
    >
      {tiles.map((tile, index) => {
        const accent = index === tiles.length - 1
        return (
          <Paper
            key={tile.label}
            elevation={3}
            sx={(t) => ({
              p: 2.5,
              borderRadius: '12px',
              ...(accent && {
                borderTop: `3px solid ${t.palette.secondary.main}`,
              }),
            })}
          >
            <Typography variant="body2" color="text.secondary">
              {tile.label}
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
            >
              {tile.value}
            </Typography>
          </Paper>
        )
      })}
    </Box>
  )
}

function ReportBody({ type, report, from, to }) {
  const config = REPORT_TYPES[type]
  const isBuyer = type === 'buyer'
  const party = isBuyer ? report.buyer : report.seller
  const { totals } = report
  const rowCount = isBuyer ? report.bills.length : report.items.length

  const tiles = [
    { label: 'Bills', value: formatCount(totals.bills) },
    { label: 'Bags', value: formatCount(totals.quantity_bags) },
    { label: 'Quintal', value: formatWeight(totals.weight) },
    { label: 'Amount', value: formatMoney(totals.amount) },
    {
      label: 'Commission',
      value: formatMoney(
        isBuyer
          ? totals.buyer_commision_amount
          : totals.seller_commision_amount,
      ),
    },
  ]

  return (
    <Stack spacing={3}>
      <PartyPanel
        title={`${config.person} report`}
        party={party}
        from={from}
        to={to}
      />
      {rowCount === 0 ? (
        <Paper elevation={3} sx={{ borderRadius: '12px' }}>
          <TableEmptyState
            icon={<AssessmentOutlined />}
            title="No bills in this period"
            message="Try a wider date range."
          />
        </Paper>
      ) : (
        <>
          <TotalTiles tiles={tiles} />
          {isBuyer ? (
            <BuyerReportTable bills={report.bills} totals={totals} />
          ) : (
            <SellerReportTable items={report.items} totals={totals} />
          )}
        </>
      )}
    </Stack>
  )
}

// Buyers and sellers in one list, sorted by name. A role that doesn't exist
// makes useUserOptions return everyone, so keep only these two roles.
function useReportPeople() {
  const buyers = useUserOptions('buyer')
  const sellers = useUserOptions('seller')
  const data = useMemo(() => {
    const byId = new Map()
    for (const person of [...(buyers.data ?? []), ...(sellers.data ?? [])]) {
      if (REPORT_TYPES[person.role?.slug]) byId.set(person.id, person)
    }
    return [...byId.values()].sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? ''),
    )
  }, [buyers.data, sellers.data])
  return { data, isPending: buyers.isPending || sellers.isPending }
}

function ReportsPage() {
  // The last report asked for lives in the URL, so a refresh or a shared link keeps it.
  const [params, setParams] = useSearchParams()
  const defaults = currentFinancialYear()
  const applied = {
    type: params.get('type') === 'seller' ? 'seller' : 'buyer',
    id: params.get('id') ?? '',
    from: params.get('from') || defaults.from,
    to: params.get('to') || defaults.to,
  }

  // The fields edit a draft; nothing loads until "View report" is clicked.
  const [draft, setDraft] = useState(applied)
  const { id: personId, from, to } = draft
  const change = (changes) => setDraft((d) => ({ ...d, ...changes }))

  const people = useReportPeople()
  const person =
    people.data.find((option) => String(option.id) === personId) ?? null

  // ISO dates compare correctly as text.
  const rangeError =
    from > to ? 'From date must be on or before the to date' : ''
  const report = useReport(
    applied.type,
    applied.id,
    { from: applied.from, to: applied.to },
    { enabled: applied.from <= applied.to },
  )

  const viewReport = () => {
    // The person's role decides which report to load.
    const next = { ...draft, type: person.role.slug }
    const isSame =
      next.type === applied.type &&
      next.id === applied.id &&
      next.from === applied.from &&
      next.to === applied.to
    // Same choices as the report on screen: fetch it again for fresh numbers.
    if (isSame) report.refetch()
    else setParams(next, { replace: true })
  }

  return (
    <Fade in appear timeout={300}>
      <Stack spacing={4}>
        {printStyles}

        <Stack
          className="no-print"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Insights
            </Typography>
            <Typography variant="h4" component="h1">
              Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Pick a buyer or seller to see everyone they traded with.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            startIcon={<PrintOutlined />}
            onClick={() => window.print()}
            disabled={!report.data}
          >
            Print
          </Button>
        </Stack>

        <Paper
          className="no-print"
          elevation={3}
          sx={{ p: 2.5, borderRadius: '12px' }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' } }}
          >
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <OptionPicker
                id="report-person"
                label="Buyer or seller"
                options={people.data}
                loading={people.isPending}
                value={person}
                onChange={(option) => change({ id: String(option?.id ?? '') })}
                getOptionNote={(option) => option.role?.name}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <TextField
                label="From"
                type="date"
                value={from}
                onChange={(e) => change({ from: e.target.value })}
                error={Boolean(rangeError)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="To"
                type="date"
                value={to}
                onChange={(e) => change({ to: e.target.value })}
                error={Boolean(rangeError)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Button
              variant="contained"
              size="large"
              startIcon={<AssessmentOutlined />}
              onClick={viewReport}
              disabled={!person || Boolean(rangeError)}
              loading={report.isFetching}
              sx={{ flexShrink: 0 }}
            >
              View report
            </Button>
          </Stack>
          {rangeError && (
            <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
              {rangeError}
            </Typography>
          )}
        </Paper>

        {!applied.id && (
          <Paper elevation={3} sx={{ borderRadius: '12px' }}>
            <TableEmptyState
              icon={<AssessmentOutlined />}
              title="Pick a buyer or seller"
              message="Choose a person and dates above, then click View report."
            />
          </Paper>
        )}

        {applied.id && report.isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {report.isError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => report.refetch()}
              >
                Try again
              </Button>
            }
          >
            Could not load the report: {report.error.message}
          </Alert>
        )}

        {applied.id && report.data && (
          <Fade in key={`${applied.type}-${applied.id}`} timeout={300}>
            <Box>
              <ReportBody
                type={applied.type}
                report={report.data}
                from={report.data.from}
                to={report.data.to}
              />
            </Box>
          </Fade>
        )}
      </Stack>
    </Fade>
  )
}

export default ReportsPage
