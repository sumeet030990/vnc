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
import { useDeleteUser } from '../../api/users.js'

// Mount a fresh copy per open (use a `key`) so old errors don't linger.
function DeleteUserDialog({ open, user, onClose, onDeleted }) {
  const deleteUser = useDeleteUser()

  const handleDelete = () => {
    deleteUser
      .mutateAsync(user.id)
      .then(() => onDeleted(user))
      .catch(() => {
        // Error is shown from deleteUser.error; keep the dialog open.
      })
  }

  const handleClose = () => {
    if (!deleteUser.isPending) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-user-title"
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
          <Typography id="delete-user-title" variant="h6" component="h2">
            Delete this user?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Typography
              component="strong"
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {user?.name || user?.user_name}
            </Typography>{' '}
            will be removed for good. This can't be undone.
          </Typography>
          {deleteUser.isError && (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              {deleteUser.error.message}
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
          disabled={deleteUser.isPending}
          fullWidth
        >
          {deleteUser.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteUserDialog
