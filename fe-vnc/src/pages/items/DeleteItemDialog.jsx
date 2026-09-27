import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import { useDeleteItem } from '../../api/items.js'

// Mount a fresh copy per open (use a `key`) so old errors don't linger.
function DeleteItemDialog({ open, item, onClose, onDeleted }) {
  const deleteItem = useDeleteItem()

  const handleDelete = () => {
    deleteItem
      .mutateAsync(item.id)
      .then(() => onDeleted(item))
      .catch(() => {
        // Error is shown from deleteItem.error; keep the dialog open.
      })
  }

  const handleClose = () => {
    if (!deleteItem.isPending) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-item-title"
    >
      <DialogContent sx={{ pt: 4, px: 3, pb: 3 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: (t) => alpha(t.palette.error.main, 0.1),
              color: 'error.main',
            }}
          >
            <DeleteOutlined />
          </Avatar>
          <Typography id="delete-item-title" variant="h6" component="h2">
            Delete this item?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Typography
              component="strong"
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {item?.name}
            </Typography>{' '}
            will be removed for good. This can't be undone.
          </Typography>
          {deleteItem.isError && (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              {deleteItem.error.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          fullWidth
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleteItem.isPending}
          fullWidth
        >
          {deleteItem.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteItemDialog
