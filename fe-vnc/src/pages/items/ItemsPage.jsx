import { useMemo, useState } from 'react'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import Close from '@mui/icons-material/Close'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import Search from '@mui/icons-material/Search'
import { useItems } from '../../api/items.js'
import ItemFormDialog from './ItemFormDialog.jsx'
import DeleteItemDialog from './DeleteItemDialog.jsx'

const PAGE_SIZES = [10, 20, 50]

function EmptyState({ isFiltered, onClear, onAdd }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 9, px: 2 }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 52,
          height: 52,
          bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
          color: 'secondary.dark',
        }}
      >
        <Inventory2Outlined />
      </Avatar>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {isFiltered ? 'No items found' : 'No items yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {isFiltered
          ? 'Try a different search.'
          : 'Add your first item to get started.'}
      </Typography>
      {isFiltered ? (
        <Button variant="outlined" color="inherit" onClick={onClear}>
          Clear search
        </Button>
      ) : (
        <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
          Add item
        </Button>
      )}
    </Stack>
  )
}

function ItemsPage() {
  const items = useItems()

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [searchInput, setSearchInput] = useState('')
  const search = searchInput.trim().toLowerCase()

  // `key` remounts the dialog on every open, so the form always starts fresh.
  const [formDialog, setFormDialog] = useState({
    open: false,
    item: null,
    key: 0,
  })
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
    key: 0,
  })
  const [notice, setNotice] = useState('')

  // The full list is already here, so search it in the browser.
  const data = useMemo(() => {
    const all = items.data ?? []
    if (!search) return all
    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(search) || item.slug.includes(search),
    )
  }, [items.data, search])
  const total = data.length
  const isFiltered = Boolean(search)

  // A new search should start from the first page.
  const [lastSearch, setLastSearch] = useState(search)
  if (lastSearch !== search) {
    setLastSearch(search)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  // Deleting the last row on the last page would leave it empty — step back one.
  const lastPage = Math.max(0, Math.ceil(total / pagination.pageSize) - 1)
  if (pagination.pageIndex > lastPage) {
    setPagination((p) => ({ ...p, pageIndex: lastPage }))
  }

  const openForm = (item = null) =>
    setFormDialog((d) => ({ open: true, item, key: d.key + 1 }))
  const openDelete = (item) =>
    setDeleteDialog((d) => ({ open: true, item, key: d.key + 1 }))

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Item',
        size: 280,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        size: 220,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: 'monospace', fontSize: 13 }}
          >
            {cell.getValue()}
          </Typography>
        ),
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    getRowId: (row) => String(row.id),

    onPaginationChange: setPagination,
    state: {
      pagination,
      isLoading: items.isPending,
    },

    // Our own toolbars (below) replace the built-in ones, which don't fit MUI 9.
    enableSorting: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableGlobalFilter: false,
    enableToolbarInternalActions: false,
    enableFilterMatchHighlighting: false,
    mrtTheme: { baseBackgroundColor: '#FFFFFF' },

    renderTopToolbar: () => (
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ p: 2.5, alignItems: { sm: 'center' } }}
        >
          <TextField
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search items"
            sx={{ flex: 1, maxWidth: { sm: 420 } }}
            slotProps={{
              htmlInput: { 'aria-label': 'Search items' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search"
                      onClick={() => setSearchInput('')}
                      edge="end"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
          {!items.isPending && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {total} {total === 1 ? 'item' : 'items'}
            </Typography>
          )}
        </Stack>

        {/* Thin bar while the list reloads; keeps height steady. */}
        <Box sx={{ height: 2 }}>
          {items.isFetching && !items.isPending && (
            <LinearProgress color="secondary" sx={{ height: 2 }} />
          )}
        </Box>

        {items.isError && (
          <Alert
            severity="error"
            sx={{ mx: 2.5, my: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => items.refetch()}
              >
                Try again
              </Button>
            }
          >
            Could not load items: {items.error.message}
          </Alert>
        )}
      </Box>
    ),

    renderBottomToolbar: () =>
      total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={pagination.pageIndex}
          rowsPerPage={pagination.pageSize}
          rowsPerPageOptions={PAGE_SIZES}
          onPageChange={(_e, pageIndex) =>
            setPagination((p) => ({ ...p, pageIndex }))
          }
          onRowsPerPageChange={(e) =>
            setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
          }
          sx={{ borderTop: 1, borderColor: 'divider', color: 'text.secondary' }}
        />
      ),

    enableRowActions: true,
    positionActionsColumn: 'last',
    displayColumnDefOptions: {
      'mrt-row-actions': { header: '', size: 96 },
    },
    renderRowActions: ({ row }) => (
      <Stack
        direction="row"
        spacing={0.5}
        className="row-actions"
        sx={{ justifyContent: 'flex-end' }}
      >
        <Tooltip title="Edit">
          <IconButton
            size="small"
            aria-label={`Edit ${row.original.name}`}
            onClick={() => openForm(row.original)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              },
            }}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            aria-label={`Delete ${row.original.name}`}
            onClick={() => openDelete(row.original)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                bgcolor: (t) => alpha(t.palette.error.main, 0.08),
              },
            }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),

    renderEmptyRowsFallback: () => (
      <EmptyState
        isFiltered={isFiltered}
        onClear={() => setSearchInput('')}
        onAdd={() => openForm()}
      />
    ),

    // Card look from the theme guide: white surface, soft shadow, 12px corners.
    muiTablePaperProps: {
      elevation: 0,
      sx: (t) => ({
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${alpha(t.palette.primary.main, 0.05)}`,
        boxShadow: t.customShadows.md,
      }),
    },
    muiTableHeadCellProps: {
      sx: (t) => ({
        py: 1.5,
        // Dark navy header with soft white text, matching the top bar.
        bgcolor: 'primary.main',
        color: alpha(t.palette.common.white, 0.85),
        borderBottom: 0,
      }),
    },
    muiTableBodyCellProps: { sx: { py: 1.75 } },
    muiTableBodyRowProps: {
      hover: false,
      sx: (t) => ({
        '& td': { transition: 'background-color 150ms ease' },
        '&:hover td': { bgcolor: alpha(t.palette.secondary.main, 0.05) },
        '&:hover td:after': { backgroundColor: 'transparent' },
        '&:last-of-type td': { borderBottom: 0 },
        // Actions stay visible but quiet until the row is hovered or focused.
        '& .row-actions': { opacity: 0.6, transition: 'opacity 150ms ease' },
        '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1 },
      }),
    },
  })

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
              Master data
            </Typography>
            <Typography variant="h4" component="h1">
              Items
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Keep the list of items you trade up to date.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => openForm()}
          >
            Add item
          </Button>
        </Stack>

        <MaterialReactTable table={table} />

        <ItemFormDialog
          key={`form-${formDialog.key}`}
          open={formDialog.open}
          item={formDialog.item}
          onClose={() => setFormDialog((d) => ({ ...d, open: false }))}
          onSaved={() => {
            setNotice(formDialog.item ? 'Item updated' : 'Item added')
            setFormDialog((d) => ({ ...d, open: false }))
          }}
        />
        <DeleteItemDialog
          key={`delete-${deleteDialog.key}`}
          open={deleteDialog.open}
          item={deleteDialog.item}
          onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}
          onDeleted={() => {
            setNotice('Item deleted')
            setDeleteDialog((d) => ({ ...d, open: false }))
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

export default ItemsPage
