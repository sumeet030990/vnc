import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import {
  Box,
  Button,
  Fade,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import PrintOutlined from '@mui/icons-material/PrintOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import { useBills } from '../../api/bills.js'
import { usePeopleOptions } from '../../api/users.js'
import DataTable from '../../components/table/DataTable.jsx'
import RowActionButton from '../../components/table/RowActionButton.jsx'
import TableEmptyState from '../../components/table/TableEmptyState.jsx'
import TableSearchField from '../../components/table/TableSearchField.jsx'
import { useDebouncedValue } from '../../lib/useDebouncedValue.js'
import DeleteBillDialog from './DeleteBillDialog.jsx'
import OptionPicker from './OptionPicker.jsx'
import { formatMoney } from './billForm.js'

const NEW_BILL_PATH = '/commission-bills/new'
// bill_date is a date-only value stored at UTC midnight, so show it in UTC.
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

const SEARCH_DELAY_MS = 300
// The user filter shows buyers and sellers together.
const PARTY_ROLES = ['buyer', 'seller']

// Small "From" or "To" date box for the table toolbar.
function DateFilter({ label, value, onChange, error }) {
  return (
    <TextField
      label={label}
      type="date"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      sx={{ width: { sm: 160 } }}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  )
}

function BillsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const people = usePeopleOptions(PARTY_ROLES)

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS)
  const [person, setPerson] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    bill: null,
    key: 0,
  })
  // The form page sends a notice back after saving.
  const [notice, setNotice] = useState(location.state?.notice ?? '')

  // Clear that notice from history so a refresh doesn't show it again.
  useEffect(() => {
    if (location.state?.notice) navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  // ISO dates compare correctly as text. A wrong range isn't sent to the API.
  const isRangeWrong = Boolean(from && to && from > to)
  const filters = {
    userId: person?.id ?? '',
    search,
    from: isRangeWrong ? '' : from,
    to: isRangeWrong ? '' : to,
  }

  const bills = useBills({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    ...filters,
  })

  const data = useMemo(() => bills.data?.bills ?? [], [bills.data])
  const total = bills.data?.total ?? 0
  const isFiltered = Object.values(filters).some(Boolean)

  // A new search or filter should start from the first page.
  const filterKey = JSON.stringify(filters)
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const clearFilters = () => {
    setSearchInput('')
    setPerson(null)
    setFrom('')
    setTo('')
  }

  const openDelete = (bill) =>
    setDeleteDialog((d) => ({ open: true, bill, key: d.key + 1 }))

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Bill',
        size: 110,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            #{cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'bill_date',
        header: 'Date',
        size: 140,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>
            {dateFormat.format(new Date(cell.getValue()))}
          </Typography>
        ),
      },
      {
        accessorKey: 'buyer.name',
        header: 'Buyer',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>
            {cell.getValue() || '—'}
          </Typography>
        ),
      },
      {
        accessorKey: 'transporter.name',
        header: 'Transporter',
        size: 180,
        Cell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {row.original.transporter?.name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.original.lorry_number || 'No lorry number'}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'total_amount',
        header: 'Total',
        size: 140,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatMoney(cell.getValue())}
          </Typography>
        ),
      },
    ],
    [],
  )

  return (
    <Fade in appear timeout={300}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Billing
            </Typography>
            <Typography variant="h4" component="h1">
              Commission bills
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Record each lorry load, its sellers and the commission earned.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to={NEW_BILL_PATH}
            variant="contained"
            size="large"
            startIcon={<Add />}
          >
            New bill
          </Button>
        </Stack>

        <DataTable
          columns={columns}
          data={data}
          query={bills}
          noun="bill"
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={total}
          actionsSize={136}
          filters={
            <>
              <TableSearchField
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search name, bill no., seller bill no. or date"
              />
              <Box sx={{ width: { sm: 220 } }}>
                <OptionPicker
                  label="Buyer or seller"
                  size="small"
                  options={people.data}
                  loading={people.isPending}
                  value={person}
                  onChange={setPerson}
                  getOptionNote={(option) => option.role?.name}
                />
              </Box>
              <DateFilter
                label="From"
                value={from}
                onChange={setFrom}
                error={isRangeWrong}
              />
              <DateFilter
                label="To"
                value={to}
                onChange={setTo}
                error={isRangeWrong}
              />
            </>
          }
          renderRowActions={({ row }) => (
            <>
              <RowActionButton
                title="Print"
                label={`Print bill ${row.original.id}`}
                icon={<PrintOutlined fontSize="small" />}
                // New tab, so the list keeps its page and filters.
                onClick={() =>
                  window.open(
                    `/commission-bills/${row.original.id}/print`,
                    '_blank',
                    'noopener',
                  )
                }
              />
              <RowActionButton
                title="Edit"
                label={`Edit bill ${row.original.id}`}
                icon={<EditOutlined fontSize="small" />}
                onClick={() =>
                  navigate(`/commission-bills/${row.original.id}/edit`)
                }
              />
              <RowActionButton
                title="Delete"
                label={`Delete bill ${row.original.id}`}
                icon={<DeleteOutlined fontSize="small" />}
                color="error"
                onClick={() => openDelete(row.original)}
              />
            </>
          )}
          emptyState={
            <TableEmptyState
              icon={<ReceiptLongOutlined />}
              title={isFiltered ? 'No bills found' : 'No bills yet'}
              message={
                isFiltered
                  ? 'Try a different search, person or date range.'
                  : 'Create your first commission bill to get started.'
              }
              action={
                isFiltered ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to={NEW_BILL_PATH}
                    variant="contained"
                    startIcon={<Add />}
                  >
                    New bill
                  </Button>
                )
              }
            />
          }
        />

        <DeleteBillDialog
          key={`delete-${deleteDialog.key}`}
          open={deleteDialog.open}
          bill={deleteDialog.bill}
          onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}
          onDeleted={() => {
            setNotice('Bill deleted')
            setDeleteDialog((d) => ({ ...d, open: false }))
            // Deleting the last row on a page would leave it empty — step back one.
            if (data.length === 1 && pagination.pageIndex > 0) {
              setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
            }
          }}
        />

        <Snackbar
          open={Boolean(notice)}
          autoHideDuration={3000}
          onClose={() => setNotice('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={notice}
        />
      </Stack>
    </Fade>
  )
}

export default BillsPage
