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
import { useDeleteBill } from '../../api/bills.js'

// Mount a fresh copy per open (use a `key`) so old errors don't linger.
function DeleteBillDialog({ open, bill, onClose, onDeleted }) {
  const deleteBill = useDeleteBill()

  const handleDelete = () => {
    deleteBill
      .mutateAsync(bill.id)
      .then(() => onDeleted(bill))
      .catch(() => {
        // Error is shown from deleteBill.error; keep the dialog open.
      })
  }

  const handleClose = () => {
    if (!deleteBill.isPending) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-bill-title"
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
          <Typography id="delete-bill-title" variant="h6" component="h2">
            Delete this bill?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Typography
              component="strong"
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              Bill #{bill?.id}
            </Typography>{' '}
            and all its items will be removed for good. This can't be undone.
          </Typography>
          {deleteBill.isError && (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              {deleteBill.error.message}
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
          disabled={deleteBill.isPending}
          fullWidth
        >
          {deleteBill.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteBillDialog
