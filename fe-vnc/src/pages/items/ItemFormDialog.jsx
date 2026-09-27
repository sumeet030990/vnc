import { useFormik } from 'formik'
import * as yup from 'yup'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import AddBoxOutlined from '@mui/icons-material/AddBoxOutlined'
import Close from '@mui/icons-material/Close'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { useCreateItem, useUpdateItem } from '../../api/items.js'

// Same limits as the backend (src/app/validations/itemValidation.ts).
const MAX_TEXT = 191
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Please enter a name')
    .max(MAX_TEXT, `Name must be at most ${MAX_TEXT} characters`),
  slug: yup
    .string()
    .trim()
    .required('Please enter a slug')
    .max(MAX_TEXT, `Slug must be at most ${MAX_TEXT} characters`)
    .matches(
      SLUG_PATTERN,
      'Slug must be lowercase letters and numbers, joined by dashes',
    ),
})

// "Gold Bar 24K" -> "gold-bar-24k"
const toSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Turns the API's { errors: { field: [msg] } } into Formik errors.
const toFieldErrors = (errors = {}) =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([, messages]) => messages?.length)
      .map(([field, messages]) => [field, messages[0]]),
  )

// Mount a fresh copy per open (use a `key`) so the form resets each time.
function ItemFormDialog({ open, item, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const mutation = isEdit ? updateItem : createItem

  const formik = useFormik({
    initialValues: { name: item?.name ?? '', slug: item?.slug ?? '' },
    validationSchema: schema,
    onSubmit: async (values, { setErrors }) => {
      const name = values.name.trim()
      try {
        // The slug can't change after create, so an update only sends the name.
        const saved = isEdit
          ? await updateItem.mutateAsync({ id: item.id, name })
          : await createItem.mutateAsync({ name, slug: values.slug.trim() })
        onSaved(saved)
      } catch (error) {
        // The general message shows from mutation.error; fields get their own.
        setErrors(toFieldErrors(error.data?.errors))
      }
    },
  })

  const fieldProps = (name) => ({
    id: `item-${name}`,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  })

  // The slug is made from the name on a new item, and never changes after that.
  const handleNameChange = (e) => {
    formik.handleChange(e)
    if (!isEdit) formik.setFieldValue('slug', toSlug(e.target.value))
  }

  const handleClose = () => {
    if (!formik.isSubmitting) onClose()
  }

  const TitleIcon = isEdit ? EditOutlined : AddBoxOutlined

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="item-form-title"
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: formik.handleSubmit,
          noValidate: true,
        },
      }}
    >
      <DialogTitle
        id="item-form-title"
        component="div"
        sx={{ px: 3, pt: 3, pb: 2.5 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
              color: 'secondary.dark',
            }}
          >
            <TitleIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h2">
              {isEdit ? 'Edit item' : 'Add a new item'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {isEdit ? `Update details for ${item.name}.` : 'Give it a name.'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 3, borderColor: 'divider' }}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error.message}
          </Alert>
        )}
        <Stack spacing={2.5}>
          <TextField
            {...fieldProps('name')}
            onChange={handleNameChange}
            label="Name"
            required
            autoFocus
          />
          <TextField
            {...fieldProps('slug')}
            label="Slug"
            disabled
            helperText={
              (formik.touched.slug && formik.errors.slug) ||
              (isEdit
                ? "The slug can't be changed"
                : 'Made from the name automatically')
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          bgcolor: (t) => alpha(t.palette.background.default, 0.6),
        }}
      >
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting
            ? 'Saving…'
            : isEdit
              ? 'Save changes'
              : 'Add item'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ItemFormDialog
