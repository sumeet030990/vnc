import { useMemo, useState } from 'react'
import { Box, Button, Fade, Snackbar, Stack, Typography } from '@mui/material'
import Add from '@mui/icons-material/Add'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import { useItems } from '../../api/items.js'
import DataTable from '../../components/table/DataTable.jsx'
import RowActionButton from '../../components/table/RowActionButton.jsx'
import TableEmptyState from '../../components/table/TableEmptyState.jsx'
import TableSearchField from '../../components/table/TableSearchField.jsx'
import ItemFormDialog from './ItemFormDialog.jsx'
import DeleteItemDialog from './DeleteItemDialog.jsx'

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

        <DataTable
          columns={columns}
          data={data}
          query={items}
          noun="item"
          pagination={pagination}
          onPaginationChange={setPagination}
          filters={
            <TableSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search items"
            />
          }
          renderRowActions={({ row }) => (
            <>
              <RowActionButton
                title="Edit"
                label={`Edit ${row.original.name}`}
                icon={<EditOutlined fontSize="small" />}
                onClick={() => openForm(row.original)}
              />
              <RowActionButton
                title="Delete"
                label={`Delete ${row.original.name}`}
                icon={<DeleteOutlined fontSize="small" />}
                color="error"
                onClick={() => openDelete(row.original)}
              />
            </>
          )}
          emptyState={
            <TableEmptyState
              icon={<Inventory2Outlined />}
              title={isFiltered ? 'No items found' : 'No items yet'}
              message={
                isFiltered
                  ? 'Try a different search.'
                  : 'Add your first item to get started.'
              }
              action={
                isFiltered ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => setSearchInput('')}
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openForm()}
                  >
                    Add item
                  </Button>
                )
              }
            />
          }
        />

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
