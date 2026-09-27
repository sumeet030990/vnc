import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
  TablePagination,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

const PAGE_SIZES = [10, 20, 50]

// Shared table with our card look, toolbar, paging, loading and error states.
// - `query` is the React Query result for the list (isPending, isFetching, error, refetch).
// - Pass `rowCount` when the API does the paging; leave it out to page in the browser.
// - `filters` goes in the top toolbar; `renderRowActions` returns the row's buttons.
// - Any other option is passed straight to `useMaterialReactTable`.
function DataTable({
  columns,
  data,
  query,
  noun,
  nounPlural = `${noun}s`,
  pagination,
  onPaginationChange,
  rowCount,
  filters,
  renderRowActions,
  emptyState,
  pageSizes = PAGE_SIZES,
  ...tableOptions
}) {
  const isServerPaged = rowCount !== undefined
  const total = isServerPaged ? rowCount : data.length

  const table = useMaterialReactTable({
    columns,
    data,
    getRowId: (row) => String(row.id),

    manualPagination: isServerPaged,
    manualFiltering: isServerPaged,
    rowCount,
    onPaginationChange,
    state: {
      pagination,
      isLoading: query.isPending,
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
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
          {filters}
        </Stack>

        {/* Thin bar while the list reloads; keeps height steady. */}
        <Box sx={{ height: 2 }}>
          {query.isFetching && !query.isPending && (
            <LinearProgress color="secondary" sx={{ height: 2 }} />
          )}
        </Box>

        {query.isError && (
          <Alert
            severity="error"
            sx={{ mx: 2.5, my: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => query.refetch()}
              >
                Try again
              </Button>
            }
          >
            Could not load {nounPlural}: {query.error.message}
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
          rowsPerPageOptions={pageSizes}
          onPageChange={(_e, pageIndex) =>
            onPaginationChange((p) => ({ ...p, pageIndex }))
          }
          onRowsPerPageChange={(e) =>
            onPaginationChange({
              pageIndex: 0,
              pageSize: Number(e.target.value),
            })
          }
          sx={{ borderTop: 1, borderColor: 'divider', color: 'text.secondary' }}
        />
      ),

    enableRowActions: Boolean(renderRowActions),
    positionActionsColumn: 'last',
    displayColumnDefOptions: {
      'mrt-row-actions': { header: '', size: 96 },
    },
    renderRowActions: renderRowActions
      ? (props) => (
          <Stack
            direction="row"
            spacing={0.5}
            className="row-actions"
            sx={{ justifyContent: 'flex-end' }}
          >
            {renderRowActions(props)}
          </Stack>
        )
      : undefined,

    renderEmptyRowsFallback: emptyState ? () => emptyState : undefined,

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

    ...tableOptions,
  })

  return <MaterialReactTable table={table} />
}

export default DataTable
