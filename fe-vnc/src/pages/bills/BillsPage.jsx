import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import {
  Box,
  Button,
  Chip,
  Fade,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import { useBills } from '../../api/bills.js'
import { useUserOptions } from '../../api/users.js'
import DataTable from '../../components/table/DataTable.jsx'
import RowActionButton from '../../components/table/RowActionButton.jsx'
import TableEmptyState from '../../components/table/TableEmptyState.jsx'
import DeleteBillDialog from './DeleteBillDialog.jsx'
import { formatMoney } from './billForm.js'

const NEW_BILL_PATH = '/commission-bills/new'
// bill_date is a date-only value stored at UTC midnight, so show it in UTC.
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

// Small "All ..." dropdown for the table toolbar.
function PersonFilter({ label, query, value, onChange }) {
  return (
    <TextField
      select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={query.isPending || query.isError}
      sx={{ minWidth: 180 }}
      slotProps={{
        select: { displayEmpty: true },
        htmlInput: { 'aria-label': `Filter by ${label.toLowerCase()}` },
      }}
    >
      <MenuItem value="">All {label.toLowerCase()}s</MenuItem>
      {query.data?.map((person) => (
        <MenuItem key={person.id} value={person.id}>
          {person.name || `#${person.id}`}
        </MenuItem>
      ))}
    </TextField>
  )
}

function BillsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const buyers = useUserOptions('buyer')
  const transporters = useUserOptions('transporter')

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [buyerId, setBuyerId] = useState('')
  const [transporterId, setTransporterId] = useState('')
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

  const bills = useBills({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    buyerId,
    transporter_id: transporterId,
  })

  const data = useMemo(() => bills.data?.bills ?? [], [bills.data])
  const total = bills.data?.total ?? 0
  const isFiltered = Boolean(buyerId || transporterId)

  // A new filter should start from the first page.
  const [lastFilters, setLastFilters] = useState({ buyerId, transporterId })
  if (
    lastFilters.buyerId !== buyerId ||
    lastFilters.transporterId !== transporterId
  ) {
    setLastFilters({ buyerId, transporterId })
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const clearFilters = () => {
    setBuyerId('')
    setTransporterId('')
  }

  const openDelete = (bill) =>
    setDeleteDialog((d) => ({ open: true, bill, key: d.key + 1 }))

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Bill',
        size: 150,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              #{row.original.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dateFormat.format(new Date(row.original.bill_date))}
            </Typography>
          </Box>
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
        accessorKey: '_count.bill_items',
        header: 'Items',
        size: 90,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            size="small"
            sx={{
              minWidth: 32,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              color: 'primary.main',
            }}
          />
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
          filters={
            <>
              <PersonFilter
                label="Buyer"
                query={buyers}
                value={buyerId}
                onChange={setBuyerId}
              />
              <PersonFilter
                label="Transporter"
                query={transporters}
                value={transporterId}
                onChange={setTransporterId}
              />
            </>
          }
          renderRowActions={({ row }) => (
            <>
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
                  ? 'Try a different buyer or transporter.'
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
