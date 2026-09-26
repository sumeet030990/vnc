import { useEffect, useMemo, useState } from 'react'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
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
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import Search from '@mui/icons-material/Search'
import { useAuth } from '../../auth/useAuth.js'
import { useRoles } from '../../api/roles.js'
import { useUsers } from '../../api/users.js'
import UserFormDialog from './UserFormDialog.jsx'
import DeleteUserDialog from './DeleteUserDialog.jsx'

const PAGE_SIZES = [10, 20, 50]
const SEARCH_DELAY_MS = 300

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

// Waits until typing stops before the value changes, so we don't call the API per key.
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function NameCell({ user, isSelf }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: 13,
          fontWeight: 600,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.07),
          color: 'primary.main',
        }}
      >
        {initials(user.name ?? user.user_name ?? '')}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {user.name || '—'}
          </Typography>
          {isSelf && (
            <Typography
              variant="caption"
              sx={{ color: 'secondary.dark', fontWeight: 600 }}
            >
              You
            </Typography>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap>
          {user.user_name ? `@${user.user_name}` : 'No username'}
        </Typography>
      </Box>
    </Stack>
  )
}

function LoginStatus({ allowed }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={(t) => ({
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: allowed
            ? 'secondary.main'
            : alpha(t.palette.primary.main, 0.2),
          boxShadow: allowed
            ? `0 0 0 3px ${alpha(t.palette.secondary.main, 0.18)}`
            : 'none',
        })}
      />
      <Typography
        variant="body2"
        color={allowed ? 'text.primary' : 'text.secondary'}
      >
        {allowed ? 'Can log in' : 'No access'}
      </Typography>
    </Stack>
  )
}

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
        <PeopleOutlined />
      </Avatar>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {isFiltered ? 'No users found' : 'No users yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {isFiltered
          ? 'Try a different search or role.'
          : 'Add your first user to get started.'}
      </Typography>
      {isFiltered ? (
        <Button variant="outlined" color="inherit" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
          Add user
        </Button>
      )}
    </Stack>
  )
}

function UsersPage() {
  const { user: currentUser } = useAuth()
  const roles = useRoles()

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [searchInput, setSearchInput] = useState('')
  const [roleId, setRoleId] = useState('')
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS)

  // `key` remounts the dialog on every open, so the form always starts fresh.
  const [formDialog, setFormDialog] = useState({
    open: false,
    user: null,
    key: 0,
  })
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
    key: 0,
  })
  const [notice, setNotice] = useState('')

  const users = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search,
    roleId,
  })

  const data = useMemo(() => users.data?.users ?? [], [users.data])
  const total = users.data?.total ?? 0
  const isFiltered = Boolean(search || roleId)

  // A new search or filter should start from the first page.
  const [lastFilters, setLastFilters] = useState({ search, roleId })
  if (lastFilters.search !== search || lastFilters.roleId !== roleId) {
    setLastFilters({ search, roleId })
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const clearFilters = () => {
    setSearchInput('')
    setRoleId('')
  }

  const openForm = (user = null) =>
    setFormDialog((d) => ({ open: true, user, key: d.key + 1 }))
  const openDelete = (user) =>
    setDeleteDialog((d) => ({ open: true, user, key: d.key + 1 }))

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'User',
        size: 260,
        Cell: ({ row }) => (
          <NameCell
            user={row.original}
            isSelf={row.original.id === currentUser?.id}
          />
        ),
      },
      {
        accessorKey: 'role.name',
        header: 'Role',
        size: 140,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            size="small"
            sx={{
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              color: 'primary.main',
            }}
          />
        ),
      },
      {
        accessorKey: 'mobile_no',
        header: 'Mobile',
        size: 150,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
        size: 140,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            color={cell.getValue() ? 'text.primary' : 'text.secondary'}
          >
            {cell.getValue() || '—'}
          </Typography>
        ),
      },
      {
        accessorKey: 'allow_login',
        header: 'Access',
        size: 140,
        Cell: ({ cell }) => <LoginStatus allowed={cell.getValue()} />,
      },
    ],
    [currentUser?.id],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    getRowId: (row) => String(row.id),

    // The API does the paging and searching.
    manualPagination: true,
    manualFiltering: true,
    rowCount: total,
    onPaginationChange: setPagination,
    state: {
      pagination,
      isLoading: users.isPending,
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
            placeholder="Search users"
            sx={{ flex: 1, maxWidth: { sm: 420 } }}
            slotProps={{
              htmlInput: { 'aria-label': 'Search users' },
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
          <TextField
            select
            size="small"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={roles.isPending || roles.isError}
            sx={{ minWidth: 170 }}
            slotProps={{
              select: { displayEmpty: true },
              htmlInput: { 'aria-label': 'Filter by role' },
            }}
          >
            <MenuItem value="">All roles</MenuItem>
            {roles.data?.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
          {!users.isPending && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {total} {total === 1 ? 'user' : 'users'}
            </Typography>
          )}
        </Stack>

        {/* Thin bar while a new page or search loads; keeps height steady. */}
        <Box sx={{ height: 2 }}>
          {users.isFetching && !users.isPending && (
            <LinearProgress color="secondary" sx={{ height: 2 }} />
          )}
        </Box>

        {users.isError && (
          <Alert
            severity="error"
            sx={{ mx: 2.5, my: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => users.refetch()}
              >
                Try again
              </Button>
            }
          >
            Could not load users: {users.error.message}
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
    renderRowActions: ({ row }) => {
      const isSelf = row.original.id === currentUser?.id
      const label = row.original.name || row.original.user_name
      return (
        <Stack
          direction="row"
          spacing={0.5}
          className="row-actions"
          sx={{ justifyContent: 'flex-end' }}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              aria-label={`Edit ${label}`}
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
          <Tooltip title={isSelf ? "You can't delete yourself" : 'Delete'}>
            {/* Span keeps the tooltip working on a disabled button. */}
            <span>
              <IconButton
                size="small"
                aria-label={`Delete ${label}`}
                disabled={isSelf}
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
            </span>
          </Tooltip>
        </Stack>
      )
    },

    renderEmptyRowsFallback: () => (
      <EmptyState
        isFiltered={isFiltered}
        onClear={clearFilters}
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
              Team
            </Typography>
            <Typography variant="h4" component="h1">
              Users
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage people, their roles and who can log in.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => openForm()}
          >
            Add user
          </Button>
        </Stack>

        <MaterialReactTable table={table} />

        <UserFormDialog
          key={`form-${formDialog.key}`}
          open={formDialog.open}
          user={formDialog.user}
          onClose={() => setFormDialog((d) => ({ ...d, open: false }))}
          onSaved={() => {
            setNotice(formDialog.user ? 'User updated' : 'User added')
            setFormDialog((d) => ({ ...d, open: false }))
          }}
        />
        <DeleteUserDialog
          key={`delete-${deleteDialog.key}`}
          open={deleteDialog.open}
          user={deleteDialog.user}
          onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}
          onDeleted={() => {
            setNotice('User deleted')
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

export default UsersPage
