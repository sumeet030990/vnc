import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
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
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import { useAuth } from '../../auth/useAuth.js'
import { useRoles } from '../../api/roles.js'
import { useUsers } from '../../api/users.js'
import DataTable from '../../components/table/DataTable.jsx'
import RowActionButton from '../../components/table/RowActionButton.jsx'
import TableEmptyState from '../../components/table/TableEmptyState.jsx'
import TableSearchField from '../../components/table/TableSearchField.jsx'
import UserFormDialog from './UserFormDialog.jsx'
import DeleteUserDialog from './DeleteUserDialog.jsx'

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
        accessorKey: 'primary_mobile_no',
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

        <DataTable
          columns={columns}
          data={data}
          query={users}
          noun="user"
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={total}
          filters={
            <>
              <TableSearchField
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search users"
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
            </>
          }
          renderRowActions={({ row }) => {
            const isSelf = row.original.id === currentUser?.id
            const label = row.original.name || row.original.user_name
            return (
              <>
                <RowActionButton
                  title="Edit"
                  label={`Edit ${label}`}
                  icon={<EditOutlined fontSize="small" />}
                  onClick={() => openForm(row.original)}
                />
                <RowActionButton
                  title={isSelf ? "You can't delete yourself" : 'Delete'}
                  label={`Delete ${label}`}
                  icon={<DeleteOutlined fontSize="small" />}
                  color="error"
                  disabled={isSelf}
                  onClick={() => openDelete(row.original)}
                />
              </>
            )
          }}
          emptyState={
            <TableEmptyState
              icon={<PeopleOutlined />}
              title={isFiltered ? 'No users found' : 'No users yet'}
              message={
                isFiltered
                  ? 'Try a different search or role.'
                  : 'Add your first user to get started.'
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
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openForm()}
                  >
                    Add user
                  </Button>
                )
              }
            />
          }
        />

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
